import express from 'express';
import * as homeParameterTypeController from '../controllers/homeParameterTypeController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(restrictTo('homeparametertypes:read'), homeParameterTypeController.getAllParameterTypes);

export default router;
