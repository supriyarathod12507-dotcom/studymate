const mongoose = require('mongoose');

const practiceSessionSchema = new mongoose.Schema(
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
    question: {
      type: String,
      required: true,
    },
    hint: String,
    userAnswer: String,
    explanation: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    isCorrect: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model('PracticeSession', practiceSessionSchema);
