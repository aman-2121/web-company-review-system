const sequelize = require('../config/db');

const User = require('../users/user.model')(sequelize);
const Company = require('../companies/company.model')(sequelize);
const Type = require('../types/type.model')(sequelize);
const Review = require('../reviews/review.model')(sequelize);
const ReviewVote = require('../reviews/review_vote.model')(sequelize);
const ReviewReport = require('../reviews/review_report.model')(sequelize);

// Define associations
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Company.belongsTo(Type, { foreignKey: 'typeId', as: 'type' });
Type.hasMany(Company, { foreignKey: 'typeId' });

Review.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Company.hasMany(Review, { foreignKey: 'companyId' });

// Fix: set cascade delete for ReviewVotes
Review.hasMany(ReviewVote, {
  foreignKey: 'reviewId',
  onDelete: 'CASCADE',
  hooks: true, // ← important for Sequelize to enforce CASCADE
});
ReviewVote.belongsTo(Review, { foreignKey: 'reviewId' });

ReviewVote.belongsTo(User, { foreignKey: 'userId' });

ReviewReport.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ReviewReport.belongsTo(Review, { foreignKey: 'reviewId', as: 'review' });

module.exports = {
  User,
  Company,
  Type,
  Review,
  ReviewVote,
  ReviewReport,
  sequelize,
};
