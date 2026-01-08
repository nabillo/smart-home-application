import express from 'express';
import * as homeController from '../controllers/homeController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { checkHomeMembership } from '../middleware/homeAuthMiddleware.js';
import roomRoutes from './roomRoutes.js';
import deviceRoutes from './deviceRoutes.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(homeController.getMyHomes)
  .post(restrictTo('homes:create'), homeController.createHome);

router.route('/:homeId')
  .all(checkHomeMembership()) // Ensures user is a member for all subsequent routes
  .get(restrictTo('homes:read'), homeController.getHome)
  .patch(restrictTo('homes:update'), checkHomeMembership(['Home Admin', 'System Admin']), homeController.updateHome)
  .delete(restrictTo('homes:delete'), checkHomeMembership(['Home Admin', 'System Admin']), homeController.deleteHome);

// Nest routes
router.use('/:homeId/rooms', roomRoutes);
router.use('/:homeId/devices', deviceRoutes);

export default router;
