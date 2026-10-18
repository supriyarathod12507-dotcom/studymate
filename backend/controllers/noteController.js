const Note = require('../models/Note');

const getNotes = async (req, res, next) => {
  try {
    const { subject, search } = req.query;
    const query = { user: req.user._id };
    if (subject) query.subject = subject;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
      ];
    }
    const notes = await Note.find(query).populate('subject', 'name color').sort({ updatedAt: -1 });
    res.json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    next(error);
  }
};

const getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id }).populate('subject', 'name color');
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const createNote = async (req, res, next) => {
  try {
    const { title, content, subject, topic, tags } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Note title is required' });
    }
    if (!content) {
      return res.status(400).json({ success: false, message: 'Note content is required' });
    }
    const note = await Note.create({
      user: req.user._id,
      title: title.trim(),
      content,
      subject: subject || undefined,
      topic: topic || '',
      tags: tags || [],
    });
    const populated = await Note.findById(note._id).populate('subject', 'name color');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    let note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    const fields = ['title', 'content', 'subject', 'topic', 'tags'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) note[f] = req.body[f];
    });
    await note.save();
    const populated = await Note.findById(note._id).populate('subject', 'name color');
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    await note.deleteOne();
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote };
