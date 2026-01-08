import express from 'express';
import * as deviceController from '../controllers/deviceController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { checkHomeMembership } from '../middleware/homeAuthMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect);
router.use(checkHomeMembership());

router.route('/')
    .get(restrictTo('devices:read'), deviceController.getDevicesInHome)
    .post(restrictTo('devices:create'), checkHomeMembership(['Home Admin', 'System Admin']), deviceController.createDevice);

router.route('/:deviceId')
    .get(restrictTo('devices:read'), deviceController.getDevice)
    .patch(restrictTo('devices:update'), checkHomeMembership(['Home Admin', 'System Admin']), deviceController.updateDevice)
    .delete(restrictTo('devices:delete'), checkHomeMembership(['Home Admin', 'System Admin']), deviceController.deleteDevice);

export default router;
