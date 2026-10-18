const express = require('express');
const {
  getResources,
  createResource,
  updateResource,
  deleteResource,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.route('/').get(getResources).post(createResource);
router.route('/:id').put(updateResource).delete(deleteResource);

module.exports = router;
