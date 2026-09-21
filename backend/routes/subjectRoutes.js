const express = require('express');
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  addTopic,
  updateTopic,
  deleteTopic,
  addUnit,
} = require('../controllers/subjectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getSubjects).post(createSubject);
router.route('/:id').get(getSubject).put(updateSubject).delete(deleteSubject);
router.post('/:id/topics', addTopic);
router.put('/:id/topics/:topicId', updateTopic);
router.delete('/:id/topics/:topicId', deleteTopic);
router.post('/:id/units', addUnit);

module.exports = router;
