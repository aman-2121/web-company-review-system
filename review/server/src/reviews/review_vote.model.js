// server/src/reviews/review_vote.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReviewVote = sequelize.define('ReviewVote', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Reviews',
        key: 'id',
      },
    },
    vote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[-1, 1]],
      },
    },
  }, {
    timestamps: false,
  });

  return ReviewVote;
};