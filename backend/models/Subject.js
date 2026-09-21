const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['not_started', 'learning', 'completed', 'needs_revision'],
      default: 'not_started',
    },
    completedAt: Date,
    lastRevisedAt: Date,
    notes: String,
  },
  { _id: true }
);

const subjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      default: '#4F46E5',
    },
    units: [
      {
        name: { type: String, trim: true },
        order: { type: Number, default: 0 },
      },
    ],
    topics: [topicSchema],
  },
  { timestamps: true }
);

subjectSchema.virtual('progress').get(function () {
  if (!this.topics || this.topics.length === 0) return 0;
  const completed = this.topics.filter((t) => t.status === 'completed').length;
  return Math.round((completed / this.topics.length) * 100);
});

subjectSchema.set('toJSON', { virtuals: true });
subjectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Subject', subjectSchema);
