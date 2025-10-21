import express from 'express';
import { getAllPermissions } from '../controllers/permissionController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes below this are protected and require a valid login
router.use(protect);

router.route('/').get(restrictTo('permissions:read'), getAllPermissions);

export default router;
