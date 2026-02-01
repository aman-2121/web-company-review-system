// server/src/reviews/review.controller.js

const { Review, ReviewReport, User, Company } = require('../models');

/**
 * Create a new review
 */
const createReview = async (req, res) => {
  const { companyId, rating, comment, isAnonymous } = req.body; // ✅ include isAnonymous

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

    res.status(201).json({ message: 'Reported successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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
};
