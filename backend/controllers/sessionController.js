const StudySession = require('../models/StudySession');
const User = require('../models/User');

const getSessions = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const query = { user: req.user._id };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    const sessions = await StudySession.find(query)
      .populate('subject', 'name color')
      .sort({ date: -1 })
      .limit(100);
    res.json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    next(error);
  }
};

const createSession = async (req, res, next) => {
  try {
    const { subject, topic, duration, type, notes } = req.body;
    if (!duration || duration < 1) {
      return res.status(400).json({ success: false, message: 'Valid duration is required' });
    }
    const session = await StudySession.create({
      user: req.user._id,
      subject: subject || undefined,
      topic: topic || '',
      duration: Number(duration),
      type: type || 'pomodoro',
      notes: notes || '',
      date: new Date(),
    });

    // Update user study stats & streak
    const user = await User.findById(req.user._id);
    user.totalStudyMinutes = (user.totalStudyMinutes || 0) + Number(duration);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = user.studyStreak?.lastStudyDate ? new Date(user.studyStreak.lastStudyDate) : null;
    if (last) last.setHours(0, 0, 0, 0);

    if (!last || last.getTime() < today.getTime() - 86400000) {
      // gap > 1 day → reset
      user.studyStreak.current = 1;
    } else if (last.getTime() === today.getTime() - 86400000) {
      user.studyStreak.current = (user.studyStreak.current || 0) + 1;
    }
    // same day → keep current

    if ((user.studyStreak.current || 0) > (user.studyStreak.longest || 0)) {
      user.studyStreak.longest = user.studyStreak.current;
    }
    user.studyStreak.lastStudyDate = new Date();
    await user.save();

    const populated = await StudySession.findById(session._id).populate('subject', 'name color');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSessions, createSession };
