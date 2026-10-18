const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    examDate: {
      type: Date,
      required: true,
    },
    syllabus: {
      type: String,
      trim: true,
      default: '',
    },
    importantTopics: [
      {
        type: String,
        trim: true,
      },
    ],
    completedTopics: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

examSchema.virtual('daysRemaining').get(function () {
  if (!this.examDate) return null;
  const now = new Date();
  const diff = this.examDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

examSchema.virtual('preparationPercent').get(function () {
  const total = (this.importantTopics || []).length;
  if (total === 0) return 0;
  const done = (this.completedTopics || []).length;
  return Math.min(100, Math.round((done / total) * 100));
});

examSchema.set('toJSON', { virtuals: true });
examSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Exam', examSchema);
