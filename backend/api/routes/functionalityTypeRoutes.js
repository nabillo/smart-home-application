import express from 'express';
import { getAllFunctionalityTypes } from '../controllers/functionalityTypeController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(restrictTo('functionalities:read'), getAllFunctionalityTypes);

export default router;
