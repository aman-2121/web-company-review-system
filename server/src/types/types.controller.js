// server/src/types/types.controller.js

const { Type } = require('../models');



/**
 * Create a new company type
 */
exports.createType = async (req, res) => {
  try {
    const { name } = req.body;

    // Basic validation
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Valid type name is required' });
    }

    // Check if type already exists
    const existingType = await Type.findOne({ where: { name } });
    if (existingType) {
      return res.status(400).json({ message: 'Type already exists' });
    }

    const newType = await Type.create({ name });
    res.status(201).json(newType);
  } catch (err) {
    console.error('Error creating type:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
/**
 * Get all company types
 */
exports.getTypes = async (req, res) => {
  try {
    const types = await Type.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });
    res.json(types);
  } catch (err) {
    console.error('Error fetching types:', err);
    res.status(500).json({ message: 'Server error' });
  }
};