// server/src/types/types.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { createType, getTypes, updateType, deleteType } = require('./types.controller');

// Protected admin routes
router.post('/', protect, authorize('admin'), createType);
router.put('/:id', protect, authorize('admin'), updateType);
router.delete('/:id', protect, authorize('admin'), deleteType);

// Public route
router.get('/', getTypes);

module.exports = router;