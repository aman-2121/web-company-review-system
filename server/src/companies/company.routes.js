// server/src/companies/company.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getPendingCompanies,
  approveCompany,
} = require('./company.controller');



const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');


// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/public/uploads/'); // Folder to save images
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });


router.get('/', getAllCompanies);

// Admin only
router.get('/pending', protect, authorize('admin'), getPendingCompanies);

router.get('/:id', getCompanyById);

// User can submit company (goes to pending)
router.post('/', protect, upload.single('image'), createCompany);

router.patch('/approve/:id', protect, authorize('admin'), approveCompany);
router.put('/:id', protect, authorize('admin'), updateCompany);
router.delete('/:id', protect, authorize('admin'), deleteCompany);

module.exports = router;