// server/src/types/types.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { createType } = require('./types.controller'); 
const { getTypes } = require('./types.controller');

// Protected admin routes
router.post('/', protect, authorize('admin'), createType);

// Public route
router.get('/', getTypes);

module.exports = router;