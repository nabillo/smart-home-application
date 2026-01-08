import express from 'express';
import * as roomController from '../controllers/roomController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { checkHomeMembership } from '../middleware/homeAuthMiddleware.js';

// mergeParams allows us to access :homeId from the parent router (homeRoutes)
const router = express.Router({ mergeParams: true });

// This middleware ensures all room routes first verify home membership
router.use(protect);

router.route('/')
    .get(restrictTo('rooms:read'), roomController.getRoomsInHome)
    .post(restrictTo('rooms:create'), checkHomeMembership(['Home Admin', 'System Admin']), roomController.createRoom);

router.route('/:roomId')
    .patch(restrictTo('rooms:update'), checkHomeMembership(['Home Admin', 'System Admin']), roomController.updateRoom)
    .delete(restrictTo('rooms:delete'), checkHomeMembership(['Home Admin', 'System Admin']), roomController.deleteRoom);

export default router;
