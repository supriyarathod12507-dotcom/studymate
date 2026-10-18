const Goal = require('../models/Goal');

const getGoals = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    const goals = await Goal.find(query).populate('subject', 'name color').sort({ createdAt: -1 });
    res.json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    next(error);
  }
};

const createGoal = async (req, res, next) => {
  try {
    const { title, description, subject, targetDate, progress } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Goal title is required' });
    }
    const goal = await Goal.create({
      user: req.user._id,
      title: title.trim(),
      description: description || '',
      subject: subject || undefined,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      progress: progress || 0,
    });
    const populated = await Goal.findById(goal._id).populate('subject', 'name color');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    const fields = ['title', 'description', 'subject', 'targetDate', 'progress', 'status'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) goal[f] = req.body[f];
    });
    if (req.body.status === 'completed' || req.body.progress === 100) {
      goal.status = 'completed';
      goal.progress = 100;
      goal.completedAt = new Date();
    }
    await goal.save();
    const populated = await Goal.findById(goal._id).populate('subject', 'name color');
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    await goal.deleteOne();
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
