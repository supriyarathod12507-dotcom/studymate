const Subject = require('../models/Subject');
const Task = require('../models/Task');
const StudyPlan = require('../models/StudyPlan');
const Exam = require('../models/Exam');
const Goal = require('../models/Goal');
const StudySession = require('../models/StudySession');
const User = require('../models/User');

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const [subjects, todayTasks, todayPlans, upcomingExams, goals, todaySessions, weekSessions, user] =
      await Promise.all([
        Subject.find({ user: userId }),
        Task.find({
          user: userId,
          $or: [{ dueDate: { $gte: startOfDay, $lt: endOfDay } }, { status: { $ne: 'completed' } }],
        })
          .populate('subject', 'name color')
          .sort({ priority: -1 })
          .limit(10),
        StudyPlan.find({ user: userId, date: { $gte: startOfDay, $lt: endOfDay } })
          .populate('subject', 'name color')
          .sort({ startTime: 1 }),
        Exam.find({ user: userId, examDate: { $gte: startOfDay } })
          .populate('subject', 'name color')
          .sort({ examDate: 1 })
          .limit(5),
        Goal.find({ user: userId, status: 'active' })
          .populate('subject', 'name color')
          .limit(5),
        StudySession.find({ user: userId, date: { $gte: startOfDay, $lt: endOfDay } }),
        StudySession.find({ user: userId, date: { $gte: startOfWeek } }),
        User.findById(userId),
      ]);

    // Semester progress
    let totalTopics = 0;
    let completedTopics = 0;
    const revisionNeeded = [];
    subjects.forEach((s) => {
      (s.topics || []).forEach((t) => {
        totalTopics++;
        if (t.status === 'completed') completedTopics++;
        if (t.status === 'needs_revision' || (t.status === 'completed' && t.lastRevisedAt)) {
          const daysSince = t.lastRevisedAt
            ? (now - new Date(t.lastRevisedAt)) / 86400000
            : 999;
          if (t.status === 'needs_revision' || daysSince > 7) {
            revisionNeeded.push({
              subjectId: s._id,
              subjectName: s.name,
              topicId: t._id,
              topicName: t.name,
              status: t.status,
            });
          }
        }
      });
    });
    const semesterProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const weekMinutes = weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    // Today's focus: highest priority incomplete plan or task
    let todaysFocus = null;
    const incompletePlan = todayPlans.find((p) => p.status === 'planned');
    if (incompletePlan) {
      todaysFocus = {
        type: 'plan',
        title: incompletePlan.topic || incompletePlan.unit || 'Study session',
        subject: incompletePlan.subject,
        duration: incompletePlan.duration,
      };
    } else {
      const highTask = todayTasks.find((t) => t.status !== 'completed' && t.priority === 'high');
      if (highTask) {
        todaysFocus = {
          type: 'task',
          title: highTask.title,
          subject: highTask.subject,
        };
      }
    }

    res.json({
      success: true,
      data: {
        todaysFocus,
        todayTasks,
        todayPlans,
        upcomingExams,
        semesterProgress,
        totalTopics,
        completedTopics,
        revisionNeeded: revisionNeeded.slice(0, 5),
        studyStreak: user.studyStreak || { current: 0, longest: 0 },
        studyTime: {
          today: todayMinutes,
          week: weekMinutes,
          total: user.totalStudyMinutes || 0,
        },
        goals,
        subjectsCount: subjects.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [sessions, tasks, subjects, goals] = await Promise.all([
      StudySession.find({ user: userId, date: { $gte: thirtyDaysAgo } }).populate('subject', 'name'),
      Task.find({ user: userId }),
      Subject.find({ user: userId }),
      Goal.find({ user: userId }),
    ]);

    // Weekly hours (last 7 days by day)
    const weeklyHours = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const mins = sessions
        .filter((s) => s.date >= d && s.date < next)
        .reduce((sum, s) => sum + s.duration, 0);
      weeklyHours.push({
        date: d.toISOString().slice(0, 10),
        minutes: mins,
        hours: Math.round((mins / 60) * 10) / 10,
      });
    }

    // Subject-wise study time
    const subjectMap = {};
    sessions.forEach((s) => {
      const name = s.subject?.name || 'Other';
      subjectMap[name] = (subjectMap[name] || 0) + s.duration;
    });
    const subjectWise = Object.entries(subjectMap).map(([name, minutes]) => ({
      name,
      minutes,
      hours: Math.round((minutes / 60) * 10) / 10,
    }));

    // Topic completion
    let totalTopics = 0;
    let completedTopics = 0;
    subjects.forEach((s) => {
      totalTopics += (s.topics || []).length;
      completedTopics += (s.topics || []).filter((t) => t.status === 'completed').length;
    });

    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const completedGoals = goals.filter((g) => g.status === 'completed').length;

    // Insights (real data based)
    const insights = [];
    const weekMins = weeklyHours.reduce((s, d) => s + d.minutes, 0);
    if (weekMins > 0) {
      insights.push(`You studied about ${Math.round(weekMins / 60)} hours this week.`);
    }
    const plannedCompleted = tasks.filter((t) => t.status === 'completed').length;
    if (tasks.length > 0) {
      const pct = Math.round((plannedCompleted / tasks.length) * 100);
      insights.push(`You have completed ${pct}% of your tasks.`);
    }
    subjects.forEach((s) => {
      const pending = (s.topics || []).filter((t) => t.status !== 'completed').length;
      if (pending >= 3) {
        insights.push(`You have ${pending} unfinished topics in ${s.name}.`);
      }
    });
    const needsRev = [];
    subjects.forEach((s) => {
      (s.topics || []).forEach((t) => {
        if (t.status === 'needs_revision') needsRev.push(t.name);
      });
    });
    if (needsRev.length > 0) {
      insights.push(`You have ${needsRev.length} topic(s) marked for revision.`);
    }
    if (insights.length === 0) {
      insights.push('Add subjects and start studying to see personalized insights.');
    }

    res.json({
      success: true,
      data: {
        weeklyHours,
        monthlyMinutes: sessions.reduce((s, x) => s + x.duration, 0),
        subjectWise,
        completedTasks,
        totalTasks: tasks.length,
        completedTopics,
        totalTopics,
        completedGoals,
        totalGoals: goals.length,
        studyDays: new Set(sessions.map((s) => s.date.toISOString().slice(0, 10))).size,
        insights,
      },
    });
  } catch (error) {
    next(error);
  }
};

const globalSearch = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json({ success: true, data: { tasks: [], notes: [], subjects: [], resources: [], exams: [], goals: [] } });
    }
    const userId = req.user._id;
    const regex = { $regex: q, $options: 'i' };

    const [tasks, notes, subjects, resources, exams, goals] = await Promise.all([
      Task.find({ user: userId, $or: [{ title: regex }, { description: regex }, { topic: regex }] })
        .limit(8)
        .select('title status priority'),
      Note.find({ user: userId, $or: [{ title: regex }, { content: regex }, { topic: regex }] })
        .limit(8)
        .select('title topic'),
      Subject.find({ user: userId, name: regex }).limit(5).select('name'),
      Resource.find({ user: userId, $or: [{ title: regex }, { description: regex }] })
        .limit(5)
        .select('title type url'),
      Exam.find({ user: userId, name: regex }).limit(5).select('name examDate'),
      Goal.find({ user: userId, title: regex }).limit(5).select('title progress status'),
    ]);

    res.json({
      success: true,
      data: { tasks, notes, subjects, resources, exams, goals },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getAnalytics, globalSearch };
