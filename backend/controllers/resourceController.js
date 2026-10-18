const Resource = require('../models/Resource');

const getResources = async (req, res, next) => {
  try {
    const { subject, type, search } = req.query;
    const query = { user: req.user._id };
    if (subject) query.subject = subject;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
      ];
    }
    const resources = await Resource.find(query).populate('subject', 'name color').sort({ createdAt: -1 });
    res.json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    next(error);
  }
};

const createResource = async (req, res, next) => {
  try {
    const { title, type, url, description, subject, topic } = req.body;
    if (!title || !url) {
      return res.status(400).json({ success: false, message: 'Title and URL are required' });
    }
    const resource = await Resource.create({
      user: req.user._id,
      title: title.trim(),
      type: type || 'website',
      url: url.trim(),
      description: description || '',
      subject: subject || undefined,
      topic: topic || '',
    });
    const populated = await Resource.findById(resource._id).populate('subject', 'name color');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateResource = async (req, res, next) => {
  try {
    let resource = await Resource.findOne({ _id: req.params.id, user: req.user._id });
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    const fields = ['title', 'type', 'url', 'description', 'subject', 'topic'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) resource[f] = req.body[f];
    });
    await resource.save();
    const populated = await Resource.findById(resource._id).populate('subject', 'name color');
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findOne({ _id: req.params.id, user: req.user._id });
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    await resource.deleteOne();
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getResources, createResource, updateResource, deleteResource };
