// server/src/users/user.model.js

module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
  });

  // Hash password before creating user
  User.beforeCreate(async (user) => {
    if (user.password) {
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  // Add instance method to compare passwords
  User.prototype.comparePassword = async function (password) {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, this.password);
  };

  return User;
};