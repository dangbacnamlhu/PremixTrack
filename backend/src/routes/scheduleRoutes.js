import express from 'express';
import * as scheduleController from '../controllers/scheduleController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', scheduleController.list);
router.get('/:id', scheduleController.getById);
router.post('/', authorize('admin', 'planner'), scheduleController.create);
router.put('/:id', authorize('admin', 'planner'), scheduleController.update);
router.delete('/:id', authorize('admin', 'planner'), scheduleController.remove);

export default router;
