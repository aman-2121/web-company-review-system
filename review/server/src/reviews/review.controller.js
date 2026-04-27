// server/src/reviews/review.controller.js

const { Review, ReviewReport, ReviewReply, User, Company } = require('../models');
const { createNotification, createNotificationForAdmins } = require('../notifications/notification.controller');

/**
 * Create a new review
 */
const createReview = async (req, res) => {
  const { companyId, rating, comment, isAnonymous } = req.body; // ✅ include isAnonymous

  const company = await Company.findByPk(companyId);
  if (!company) {
    return res.status(404).json({ message: 'Company not found' });
  }
  if (!company.isApproved) {
    return res.status(400).json({ message: 'Company must be approved before reviewing' });
  }

  const existing = await Review.findOne({
    where: { companyId, userId: req.user.id }
  });
  if (existing) {
    return res.status(400).json({ message: 'You have already reviewed this company.' });
  }

  try {
    const review = await Review.create({
      userId: req.user.id,
      companyId,
      rating,
      comment,
      isAnonymous: !!isAnonymous // ✅ store true/false
    });

    res.status(201).json({ review });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ message: 'Failed to create review' });
  }
};

/**
 * Update a review (user can edit own)
 */
const updateReview = async (req, res) => {
  const { rating, comment, isAnonymous } = req.body; // ✅ include isAnonymous

  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const company = await Company.findByPk(review.companyId);
    if (!company.isApproved) {
      return res.status(400).json({ message: 'Company must be approved before reviewing' });
    }

    if (review.userId !== req.user.id && req.user.role.name !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    review.rating = rating;
    review.comment = comment;
    if (isAnonymous !== undefined) {
      review.isAnonymous = !!isAnonymous; // ✅ update if provided
    }

    await review.save();

    res.json({ review });
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ message: 'Failed to update review' });
  }
};

/**
 * Admin: Get all reported reviews with full context
 */
const getReports = async (req, res) => {
  try {
    const reports = await ReviewReport.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Review,
          as: 'review',
          include: [
            { model: User, as: 'user', attributes: ['name'] },
            { model: Company, as: 'company', attributes: ['id', 'name'] },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Server error while fetching reports' });
  }
};

/**
 * Admin: Resolve a report by deleting the reported review
 */
const resolveReport = async (req, res) => {
  try {
    const report = await ReviewReport.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    console.log(`Report ${report.id} resolved by admin ${req.user.id}`);

    await ReviewReport.destroy({ where: { reviewId: report.reviewId } });
    await Review.destroy({ where: { id: report.reviewId } });
    await report.destroy();

    res.json({
      message: 'Report resolved and review deleted successfully',
      reportId: report.id,
      reviewId: report.reviewId,
    });
  } catch (err) {
    console.error('Error resolving report:', err);
    res.status(500).json({ message: 'Server error while resolving report' });
  }
};

/**
 * Admin: Dismiss a single report (delete only that report)
 */
const dismissReport = async (req, res) => {
  try {
    const report = await ReviewReport.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await report.destroy();

    res.json({
      message: 'Report dismissed successfully',
      reportId: req.params.id,
    });
  } catch (err) {
    console.error('Error dismissing report:', err);
    res.status(500).json({ message: 'Server error while dismissing report' });
  }
};

/**
 * Delete a review (user can delete own, admin can delete any)
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== req.user.id && req.user.role.name !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.destroy();

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Report a review (user submits a reason)
 */
const reportReview = async (req, res) => {
  const { reason } = req.body;
  const { id } = req.params;

  try {
    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot report your own review' });
    }

    const [report, created] = await ReviewReport.findOrCreate({
      where: { userId: req.user.id, reviewId: id },
      defaults: { reason },
    });

    if (!created) {
      return res.status(400).json({ message: 'Already reported' });
    }

    // Notify all admins about the new report
    await createNotificationForAdmins({
      type: 'report',
      title: 'New Review Report',
      message: `A review has been reported. Reason: "${reason.substring(0, 100)}${reason.length > 100 ? '...' : ''}"`,
      relatedId: report.id,
      relatedType: 'report',
    });

    res.status(201).json({ message: 'Reported successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all replies for a specific review (public)
 */
const getReplies = async (req, res) => {
  try {
    const replies = await ReviewReply.findAll({
      where: { reviewId: req.params.id },
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    res.json(replies);
  } catch (err) {
    console.error('Error fetching replies:', err);
    res.status(500).json({ message: 'Server error while fetching replies' });
  }
};

/**
 * Admin: Add a reply to a review
 */
const addReply = async (req, res) => {
  const { message } = req.body;
  const { id } = req.params;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Reply message is required' });
  }

  try {
    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const reply = await ReviewReply.create({
      reviewId: id,
      adminId: req.user.id,
      message: message.trim(),
    });

    const replyWithAdmin = await ReviewReply.findByPk(reply.id, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name'],
        },
      ],
    });

    // Notify the review owner about the admin reply
    if (review.userId !== req.user.id) {
      await createNotification({
        userId: review.userId,
        type: 'reply',
        title: 'New Reply on Your Review',
        message: `An admin has replied to your review: "${message.trim().substring(0, 100)}${message.trim().length > 100 ? '...' : ''}"`,
        relatedId: review.id,
        relatedType: 'review',
        companyId: review.companyId,
      });
    }

    res.status(201).json({ reply: replyWithAdmin });
  } catch (err) {
    console.error('Error adding reply:', err);
    res.status(500).json({ message: 'Server error while adding reply' });
  }
};

/**
 * Admin: Update a reply
 */
const updateReply = async (req, res) => {
  const { message } = req.body;
  const { replyId } = req.params;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Reply message is required' });
  }

  try {
    const reply = await ReviewReply.findByPk(replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found' });

    if (reply.adminId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this reply' });
    }

    reply.message = message.trim();
    await reply.save();

    const replyWithAdmin = await ReviewReply.findByPk(reply.id, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.json({ reply: replyWithAdmin });
  } catch (err) {
    console.error('Error updating reply:', err);
    res.status(500).json({ message: 'Server error while updating reply' });
  }
};

/**
 * Admin: Delete a reply
 */
const deleteReply = async (req, res) => {
  const { replyId } = req.params;

  try {
    const reply = await ReviewReply.findByPk(replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found' });

    if (reply.adminId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    await reply.destroy();

    res.json({ message: 'Reply deleted successfully' });
  } catch (err) {
    console.error('Error deleting reply:', err);
    res.status(500).json({ message: 'Server error while deleting reply' });
  }
};

module.exports = {
  createReview,
  updateReview,
  getReports,
  resolveReport,
  deleteReview,
  dismissReport,
  reportReview,
  getReplies,
  addReply,
  updateReply,
  deleteReply,
};
