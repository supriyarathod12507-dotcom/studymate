const express = require('express');
const { getDashboard, getAnalytics, globalSearch } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getDashboard);
router.get('/analytics', getAnalytics);
router.get('/search', globalSearch);

module.exports = router;
