const Subject = require('../models/Subject');

// @desc    Get all subjects for user
// @route   GET /api/subjects
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ user: req.user._id }).sort({ createdAt: 1 });
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Create subject
// @route   POST /api/subjects
const createSubject = async (req, res, next) => {
  try {
    const { name, code, color, units } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Subject name is required' });
    }
    const subject = await Subject.create({
      user: req.user._id,
      name: name.trim(),
      code: code || '',
      color: color || '#4F46E5',
      units: units || [],
      topics: [],
    });
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
const updateSubject = async (req, res, next) => {
  try {
    let subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    const { name, code, color, units } = req.body;
    if (name !== undefined) subject.name = name.trim();
    if (code !== undefined) subject.code = code;
    if (color !== undefined) subject.color = color;
    if (units !== undefined) subject.units = units;
    await subject.save();
    res.json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    await subject.deleteOne();
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add topic to subject
// @route   POST /api/subjects/:id/topics
const addTopic = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    const { name, unit } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Topic name is required' });
    }
    subject.topics.push({
      name: name.trim(),
      unit: unit || '',
      status: 'not_started',
    });
    await subject.save();
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Update topic
// @route   PUT /api/subjects/:id/topics/:topicId
const updateTopic = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    const topic = subject.topics.id(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }
    const { name, unit, status, notes } = req.body;
    if (name !== undefined) topic.name = name.trim();
    if (unit !== undefined) topic.unit = unit;
    if (notes !== undefined) topic.notes = notes;
    if (status !== undefined) {
      topic.status = status;
      if (status === 'completed') {
        topic.completedAt = new Date();
      }
      if (status === 'needs_revision') {
        topic.lastRevisedAt = new Date();
      }
    }
    await subject.save();
    res.json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete topic
// @route   DELETE /api/subjects/:id/topics/:topicId
const deleteTopic = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    const topic = subject.topics.id(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }
    topic.deleteOne();
    await subject.save();
    res.json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Add unit
// @route   POST /api/subjects/:id/units
const addUnit = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Unit name is required' });
    }
    subject.units.push({ name: name.trim(), order: subject.units.length });
    await subject.save();
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  addTopic,
  updateTopic,
  deleteTopic,
  addUnit,
};
