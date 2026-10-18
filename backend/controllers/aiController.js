const AIConversation = require('../models/AIConversation');
const Subject = require('../models/Subject');
const Note = require('../models/Note');
const PracticeSession = require('../models/PracticeSession');
const { callAI, buildContextPrefix } = require('../services/aiService');

// List conversations
const getConversations = async (req, res, next) => {
  try {
    const conversations = await AIConversation.find({ user: req.user._id })
      .select('title mode subject topic createdAt updatedAt')
      .populate('subject', 'name')
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

// Get one conversation with messages
const getConversation = async (req, res, next) => {
  try {
    const conv = await AIConversation.findOne({ _id: req.params.id, user: req.user._id }).populate(
      'subject',
      'name color'
    );
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    res.json({ success: true, data: conv });
  } catch (error) {
    next(error);
  }
};

// Create new conversation
const createConversation = async (req, res, next) => {
  try {
    const { title, subject, topic, mode } = req.body;
    const conv = await AIConversation.create({
      user: req.user._id,
      title: title || 'New Conversation',
      subject: subject || undefined,
      topic: topic || '',
      mode: mode || 'simple',
      messages: [],
    });
    res.status(201).json({ success: true, data: conv });
  } catch (error) {
    next(error);
  }
};

// Chat (send message)
const chat = async (req, res, next) => {
  try {
    const { conversationId, message, mode, subjectId, topic } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    let conv;
    if (conversationId) {
      conv = await AIConversation.findOne({ _id: conversationId, user: req.user._id });
      if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    } else {
      conv = await AIConversation.create({
        user: req.user._id,
        title: message.trim().slice(0, 50) + (message.length > 50 ? '...' : ''),
        subject: subjectId || undefined,
        topic: topic || '',
        mode: mode || 'simple',
        messages: [],
      });
    }

    if (mode) conv.mode = mode;

    let subjectName = '';
    if (conv.subject) {
      const sub = await Subject.findById(conv.subject);
      if (sub) subjectName = sub.name;
    } else if (subjectId) {
      const sub = await Subject.findOne({ _id: subjectId, user: req.user._id });
      if (sub) {
        subjectName = sub.name;
        conv.subject = sub._id;
      }
    }

    const contextPrefix = buildContextPrefix(subjectName, conv.topic || topic);
    const userContent = contextPrefix ? `${contextPrefix}\n\n${message.trim()}` : message.trim();

    conv.messages.push({ role: 'user', content: message.trim(), mode: conv.mode });

    const history = conv.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let aiReply;
    try {
      aiReply = await callAI({
        messages: history.map((m, i) =>
          i === history.length - 1 && m.role === 'user'
            ? { role: 'user', content: userContent }
            : m
        ),
        mode: conv.mode,
      });
    } catch (aiErr) {
      return res.status(503).json({
        success: false,
        message: aiErr.message || 'StudyMate AI is temporarily unavailable. Please try again later.',
      });
    }

    conv.messages.push({ role: 'assistant', content: aiReply, mode: conv.mode });
    if (conv.messages.length === 2 && !conversationId) {
      conv.title = message.trim().slice(0, 50) + (message.length > 50 ? '...' : '');
    }
    await conv.save();

    res.json({
      success: true,
      data: {
        conversationId: conv._id,
        reply: aiReply,
        conversation: conv,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Rename conversation
const renameConversation = async (req, res, next) => {
  try {
    const conv = await AIConversation.findOne({ _id: req.params.id, user: req.user._id });
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (req.body.title) conv.title = req.body.title.trim();
    await conv.save();
    res.json({ success: true, data: conv });
  } catch (error) {
    next(error);
  }
};

// Delete conversation
const deleteConversation = async (req, res, next) => {
  try {
    const conv = await AIConversation.findOne({ _id: req.params.id, user: req.user._id });
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    await conv.deleteOne();
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    next(error);
  }
};

// Solve doubt
const solveDoubt = async (req, res, next) => {
  try {
    const { subject, topic, question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    const prompt = `Solve this academic doubt carefully.

Subject: ${subject || 'General'}
Topic: ${topic || 'General'}
Question: ${question.trim()}

Structure your response exactly as:
1. What the question means
2. Required concept
3. Step-by-step solution
4. Final answer
5. Similar practice question

Be clear and accurate.`;

    let reply;
    try {
      reply = await callAI({
        messages: [{ role: 'user', content: prompt }],
        mode: 'step_by_step',
      });
    } catch (aiErr) {
      return res.status(503).json({
        success: false,
        message: aiErr.message || 'StudyMate AI is temporarily unavailable. Please try again later.',
      });
    }

    res.json({ success: true, data: { reply } });
  } catch (error) {
    next(error);
  }
};

// AI actions on notes
const noteAI = async (req, res, next) => {
  try {
    const { noteId, action } = req.body;
    if (!noteId || !action) {
      return res.status(400).json({ success: false, message: 'noteId and action are required' });
    }
    const note = await Note.findOne({ _id: noteId, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    const actionPrompts = {
      summarize: `Summarize the following student notes clearly and concisely:\n\n${note.content}`,
      simplify: `Simplify the following notes into easier language for a college student:\n\n${note.content}`,
      revision: `Extract key revision points, definitions, and must-remember facts from these notes:\n\n${note.content}`,
      explain: `Explain the difficult or complex parts of these notes in more detail:\n\n${note.content}`,
      concepts: `List the important concepts covered in these notes:\n\n${note.content}`,
    };

    const prompt = actionPrompts[action];
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    let reply;
    try {
      reply = await callAI({
        messages: [{ role: 'user', content: prompt }],
        mode: action === 'revision' ? 'revision' : 'simple',
      });
    } catch (aiErr) {
      return res.status(503).json({
        success: false,
        message: aiErr.message || 'StudyMate AI is temporarily unavailable. Please try again later.',
      });
    }

    res.json({ success: true, data: { reply, action } });
  } catch (error) {
    next(error);
  }
};

// Practice question generator
const practice = async (req, res, next) => {
  try {
    const { subject, topic, difficulty } = req.body;
    const prompt = `Generate ONE practice question for a college student.

Subject: ${subject || 'General'}
Topic: ${topic || 'General'}
Difficulty: ${difficulty || 'medium'}

Format exactly:
QUESTION: <the question>
HINT: <a helpful hint without giving away the answer>
EXPLANATION: <full explanation and answer>
DIFFICULTY: ${difficulty || 'medium'}

Focus on learning, not just testing.`;

    let reply;
    try {
      reply = await callAI({
        messages: [{ role: 'user', content: prompt }],
        mode: 'step_by_step',
        temperature: 0.8,
      });
    } catch (aiErr) {
      return res.status(503).json({
        success: false,
        message: aiErr.message || 'StudyMate AI is temporarily unavailable. Please try again later.',
      });
    }

    // Parse roughly
    const qMatch = reply.match(/QUESTION:\s*([\s\S]*?)(?=HINT:|$)/i);
    const hMatch = reply.match(/HINT:\s*([\s\S]*?)(?=EXPLANATION:|$)/i);
    const eMatch = reply.match(/EXPLANATION:\s*([\s\S]*?)(?=DIFFICULTY:|$)/i);

    const question = qMatch ? qMatch[1].trim() : reply;
    const hint = hMatch ? hMatch[1].trim() : '';
    const explanation = eMatch ? eMatch[1].trim() : '';

    const session = await PracticeSession.create({
      user: req.user._id,
      subject: req.body.subjectId || undefined,
      topic: topic || '',
      question,
      hint,
      explanation,
      difficulty: difficulty || 'medium',
    });

    res.json({
      success: true,
      data: {
        id: session._id,
        question,
        hint,
        explanation,
        difficulty: difficulty || 'medium',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getConversation,
  createConversation,
  chat,
  renameConversation,
  deleteConversation,
  solveDoubt,
  noteAI,
  practice,
};
