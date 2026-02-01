// server/src/reviews/review.controller.js
const { Review, ReviewVote } = require('../models'); // ✅ Correct import

const voteReview = async (req, res) => {
  const { id } = req.params; // reviewId
  const { vote } = req.body; // must be 1 or -1
  const userId = req.user.id;

  // ✅ Validate vote
  if (![1, -1].includes(Number(vote))) {
    return res.status(400).json({ message: 'Invalid vote value. Use 1 (like) or -1 (dislike)' });
  }

  try {
    const existingVote = await ReviewVote.findOne({
      where: { reviewId: id, userId },
    });

    if (existingVote) {
      if (existingVote.vote === vote) {
        // User toggled same vote → remove it
        await existingVote.destroy();
      } else {
        // User changed vote
        existingVote.vote = vote;
        await existingVote.save();
      }
    } else {
      // New vote
      await ReviewVote.create({ reviewId: id, userId, vote });
    }

    // Recalculate counts
    const likes = await ReviewVote.count({ where: { reviewId: id, vote: 1 } });
    const dislikes = await ReviewVote.count({ where: { reviewId: id, vote: -1 } });

    const userVoteRecord = await ReviewVote.findOne({
      where: { reviewId: id, userId },
    });

    res.json({
      likes,
      dislikes,
      userVote: userVoteRecord ? userVoteRecord.vote : 0,
    });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLikes = async (req, res) => {
  const { id } = req.params; // reviewId
  const likes = await ReviewVote.count({ where: { reviewId: id, vote: 1 } });
  const dislikes = await ReviewVote.count({ where: { reviewId: id, vote: -1 } });

  let userVote = 0;
  if (req.user) {
    const vote = await ReviewVote.findOne({
      where: { reviewId: id, userId: req.user.id }
    });
    userVote = vote ? vote.vote : 0;
  }

  res.json({ likes, dislikes, userVote });
};

module.exports = { voteReview, getLikes }
;