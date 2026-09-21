const StudyPlan = require('../models/StudyPlan');

const getStudyPlans = async (req, res, next) => {
  try {
    const { view, date } = req.query;
    const query = { user: req.user._id };
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    if (view === 'today') {
      query.date = { $gte: startOfDay, $lt: endOfDay };
    } else if (view === 'week') {
      const endOfWeek = new Date(startOfDay);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      query.date = { $gte: startOfDay, $lt: endOfWeek };
    } else if (view === 'upcoming') {
      query.date = { $gte: startOfDay };
      query.status = 'planned';
    } else if (date) {
      const d = new Date(date);
      const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const e = new Date(s);
      e.setDate(e.getDate() + 1);
      query.date = { $gte: s, $lt: e };
    }

    const plans = await StudyPlan.find(query).populate('subject', 'name color').sort({ date: 1, startTime: 1 });
    res.json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    next(error);
  }
};

const createStudyPlan = async (req, res, next) => {
  try {
    const { subject, unit, topic, date, startTime, duration, priority, notes } = req.body;
    if (!date || !duration) {
      return res.status(400).json({ success: false, message: 'Date and duration are required' });
    }
    const plan = await StudyPlan.create({
      user: req.user._id,
      subject: subject || undefined,
      unit: unit || '',
      topic: topic || '',
      date: new Date(date),
      startTime: startTime || '09:00',
      duration: Number(duration),
      priority: priority || 'medium',
      notes: notes || '',
    });
    const populated = await StudyPlan.findById(plan._id).populate('subject', 'name color');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateStudyPlan = async (req, res, next) => {
  try {
    let plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Study plan not found' });
    const fields = ['subject', 'unit', 'topic', 'date', 'startTime', 'duration', 'priority', 'notes', 'status'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) plan[f] = req.body[f];
    });
    if (req.body.status === 'completed') plan.completedAt = new Date();
    await plan.save();
    const populated = await StudyPlan.findById(plan._id).populate('subject', 'name color');
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteStudyPlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Study plan not found' });
    await plan.deleteOne();
    res.json({ success: true, message: 'Study plan deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStudyPlans, createStudyPlan, updateStudyPlan, deleteStudyPlan };
