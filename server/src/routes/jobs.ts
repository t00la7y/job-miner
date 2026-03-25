import express from 'express';
import { getJobs, saveJob } from '../controllers/jobsController';

const router = express.Router();

router.get('/', getJobs);
router.post('/save', saveJob);

export default router;