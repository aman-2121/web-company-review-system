const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReviewReply = sequelize.define('ReviewReply', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Reviews',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: 'ReviewReplies',
    timestamps: true,
  });

  return ReviewReply;
};

