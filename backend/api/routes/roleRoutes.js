import express from 'express';
import { getAllRoles, createRole, updateRole, deleteRole } from '../controllers/roleController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes below this are protected and require a valid login
router.use(protect);

router
  .route('/')
  .get(restrictTo('roles:read'), getAllRoles)
  .post(restrictTo('roles:create'), createRole);

router
  .route('/:role_id')
  .patch(restrictTo('roles:update'), updateRole)
  .delete(restrictTo('roles:delete'), deleteRole);

export default router;
