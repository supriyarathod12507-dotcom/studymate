const Task = require('../models/Task');

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, subject, search, sort } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (subject) query.subject = subject;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
      ];
    }
    let sortOption = { createdAt: -1 };
    if (sort === 'dueDate') sortOption = { dueDate: 1 };
    if (sort === 'priority') sortOption = { priority: -1 };

    const tasks = await Task.find(query).populate('subject', 'name color').sort(sortOption);
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id }).populate('subject', 'name color');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, subject, topic, priority, status, dueDate } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }
    const task = await Task.create({
      user: req.user._id,
      title: title.trim(),
      description: description || '',
      subject: subject || undefined,
      topic: topic || '',
      priority: priority || 'medium',
      status: status || 'pending',
      dueDate: dueDate || undefined,
    });
    const populated = await Task.findById(task._id).populate('subject', 'name color');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const fields = ['title', 'description', 'subject', 'topic', 'priority', 'status', 'dueDate'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) task[f] = req.body[f];
    });
    if (req.body.status === 'completed' && !task.completedAt) {
      task.completedAt = new Date();
    }
    if (req.body.status !== 'completed') task.completedAt = undefined;

    await task.save();
    const populated = await Task.findById(task._id).populate('subject', 'name color');
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
