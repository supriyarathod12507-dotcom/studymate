const express = require('express');
const {
  getStudyPlans,
  createStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,
} = require('../controllers/studyPlanController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.route('/').get(getStudyPlans).post(createStudyPlan);
router.route('/:id').put(updateStudyPlan).delete(deleteStudyPlan);

module.exports = router;
