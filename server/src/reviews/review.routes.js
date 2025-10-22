const express = require('express');
const router = express.Router();
const {
  createReview,
  updateReview,
  deleteReview,
  getReports,
  resolveReport,
  dismissReport,
  reportReview
} = require('./review.controller');
const { voteReview, getLikes } = require('./review_vote.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');


router.get('/:id/likes',  getLikes);


// User reports a review
router.post('/:id/report', protect, reportReview);
router.post('/:id/vote', protect, voteReview);
// Regular review CRUD
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Admin-only report management
router.get('/reports', protect, authorize('admin'), getReports);
router.delete('/reports/:id', protect, authorize('admin'), resolveReport);
router.delete('/reports/:id/dismiss', protect, authorize('admin'), dismissReport);

module.exports = router;
