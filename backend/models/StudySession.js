const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
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
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ['pomodoro', 'custom', 'break'],
      default: 'pomodoro',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudySession', studySessionSchema);
