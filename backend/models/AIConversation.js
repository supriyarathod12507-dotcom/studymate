const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      default: 'simple',
    },
  },
  { timestamps: true }
);

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    topic: {
      type: String,
      trim: true,
      default: '',
    },
    mode: {
      type: String,
      enum: ['simple', 'step_by_step', 'exam', 'deep', 'hint', 'revision', 'coding'],
      default: 'simple',
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIConversation', aiConversationSchema);
