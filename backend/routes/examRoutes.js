const express = require('express');
const { getExams, createExam, updateExam, deleteExam } = require('../controllers/examController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.route('/').get(getExams).post(createExam);
router.route('/:id').put(updateExam).delete(deleteExam);

module.exports = router;
