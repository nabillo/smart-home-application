import express from 'express';
import { getAllUsers, createUser, deleteUser, updateUser } from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes below this are protected and require a valid login
router.use(protect);

router
  .route('/')
  .get(restrictTo('users:read'), getAllUsers)
  .post(restrictTo('users:create'), createUser);

router
  .route('/:id')
  .patch(restrictTo('users:update'), updateUser)
  .delete(restrictTo('users:delete'), deleteUser);

export default router;
