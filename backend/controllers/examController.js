const Exam = require('../models/Exam');

const getExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({ user: req.user._id })
      .populate('subject', 'name color')
      .sort({ examDate: 1 });
    res.json({ success: true, count: exams.length, data: exams });
  } catch (error) {
    next(error);
  }
};

const createExam = async (req, res, next) => {
  try {
    const { name, subject, examDate, syllabus, importantTopics, notes } = req.body;
    if (!name || !examDate) {
      return res.status(400).json({ success: false, message: 'Exam name and date are required' });
    }
    const exam = await Exam.create({
      user: req.user._id,
      name: name.trim(),
      subject: subject || undefined,
      examDate: new Date(examDate),
      syllabus: syllabus || '',
      importantTopics: importantTopics || [],
      completedTopics: [],
      notes: notes || '',
    });
    const populated = await Exam.findById(exam._id).populate('subject', 'name color');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateExam = async (req, res, next) => {
  try {
    let exam = await Exam.findOne({ _id: req.params.id, user: req.user._id });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    const fields = ['name', 'subject', 'examDate', 'syllabus', 'importantTopics', 'completedTopics', 'notes'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) exam[f] = req.body[f];
    });
    await exam.save();
    const populated = await Exam.findById(exam._id).populate('subject', 'name color');
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, user: req.user._id });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    await exam.deleteOne();
    res.json({ success: true, message: 'Exam deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExams, createExam, updateExam, deleteExam };
