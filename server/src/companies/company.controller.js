// server/src/companies/company.controller.js
const { Op } = require('sequelize');
const { Company, Type, Review, User } = require('../models'); // assuming you export all models

exports.getAllCompanies = async (req, res) => {
  try {
    const { type, rating, search } = req.query;

    const where = { isApproved: true }; // only approved companies
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const { rows: companies, count } = await Company.findAndCountAll({
      where,
      include: [
        { model: Type, as: 'type', attributes: ['name'] },
        {
          model: Review,
          as: 'Reviews',
          attributes: ['rating'],
          required: false,
        },
      ],
      order: [['name', 'ASC']],
    });

    // Add average rating
    const companiesWithAvg = companies.map(company => {
      const ratings = company.Reviews.map(r => r.rating);
      const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
      return {
        ...company.get(),
        averageRating: parseFloat(avg.toFixed(1)),
      };
    });

    res.json({ companies: companiesWithAvg, total: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id, {
      include: [
        { model: Type, as: 'type' },
        {
          model: Review,
          as: 'Reviews',
          include: [{ model: User, as: 'user', attributes: ['name'] }],
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// server/src/companies/company.controller.js
exports.createCompany = async (req, res) => {
  const { name, address, typeId } = req.body;
  let imageUrl = null;

  // Handle image upload
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  try {
    // 🔑 Key logic: Only admins auto-approve
    const isApproved = req.user.role === 'admin';

    const company = await Company.create({
      name,
      address,
      typeId,
      imageUrl,
      isApproved, // ✅ true if admin, false if regular user
    });

    res.status(201).json({
      message: isApproved 
        ? 'Company created and published!' 
        : 'Company submitted for admin approval.',
      company,
    });
  } catch (err) {
    console.error('Create company error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};// server/src/companies/company.controller.js
exports.createCompany = async (req, res) => {
  const { name, address, typeId } = req.body;
  let imageUrl = null;

  // Handle image upload
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  try {
    // 🔑 Key logic: Only admins auto-approve
    const isApproved = req.user.role === 'admin';

    const company = await Company.create({
      name,
      address,
      typeId,
      imageUrl,
      isApproved, // ✅ true if admin, false if regular user
    });

    res.status(201).json({
      message: isApproved 
        ? 'Company created and published!' 
        : 'Company submitted for admin approval.',
      company,
    });
  } catch (err) {
    console.error('Create company error:', err);
    res.status(500).json({ message: 'Server error in create company' });
  }
};

exports.updateCompany = async (req, res) => {
  const { name, address, typeId, imageUrl, isApproved } = req.body;

  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const type = await Type.findByPk(typeId);
    if (!type) return res.status(400).json({ message: 'Invalid type' });

    company.name = name;
    company.address = address;
    company.typeId = typeId;
    company.imageUrl = imageUrl;
    if (req.user.role.name === 'admin') {
      company.isApproved = isApproved !== undefined ? isApproved : company.isApproved;
    }

    await company.save();
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    await company.destroy();
    res.json({ message: 'Company deleted' });
  } catch (err) {
    console.error(err);
    console.log('hello');
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: List pending companies
exports.getPendingCompanies = async (req, res) => {
  try {
    const pending = await Company.findAll({
      where: { isApproved: false },
      include: [{ model: Type, as: 'type' }],
    });
    res.json(pending);
} catch (err) {
  console.error('Error in getPendingCompanies:', err);
  res.status(500).json({ message: err.message, stack: err.stack });
}

};

// Admin: Approve company
exports.approveCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    company.isApproved = true;
    await company.save();

    res.json({ message: 'Company approved', company });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};