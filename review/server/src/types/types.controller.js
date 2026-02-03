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

/**
 * Update a company type
 */
exports.updateType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Basic validation
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Valid type name is required' });
    }

    const type = await Type.findByPk(id);
    if (!type) {
      return res.status(404).json({ message: 'Type not found' });
    }

    // Check if another type with the same name exists
    const existingType = await Type.findOne({ where: { name, id: { [require('sequelize').Op.ne]: id } } });
    if (existingType) {
      return res.status(400).json({ message: 'Type name already exists' });
    }

    type.name = name;
    await type.save();

    res.json(type);
  } catch (err) {
    console.error('Error updating type:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a company type
 */
exports.deleteType = async (req, res) => {
  try {
    const { id } = req.params;

    const type = await Type.findByPk(id);
    if (!type) {
      return res.status(404).json({ message: 'Type not found' });
    }

    // Reassign companies using this type to null (unassigned)
    const { Company } = require('../models');
    await Company.update({ typeId: null }, { where: { typeId: id } });

    await type.destroy();
    res.json({ message: 'Type deleted successfully' });
  } catch (err) {
    console.error('Error deleting type:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
