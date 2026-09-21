const express = require('express');
const {
  getConversations,
  getConversation,
  createConversation,
  chat,
  renameConversation,
  deleteConversation,
  solveDoubt,
  noteAI,
  practice,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id', getConversation);
router.put('/conversations/:id', renameConversation);
router.delete('/conversations/:id', deleteConversation);
router.post('/chat', chat);
router.post('/doubt', solveDoubt);
router.post('/note', noteAI);
router.post('/practice', practice);

module.exports = router;
