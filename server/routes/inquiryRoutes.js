import express from 'express';
import {
  getInquiries,
  createInquiry,
  resolveInquiry
} from '../controllers/inquiryController.js';

const router = express.Router();

router.route('/')
  .get(getInquiries)
  .post(createInquiry);

router.route('/:id/resolve')
  .put(resolveInquiry);

router.route('/:id')
  .put(resolveInquiry)
  .delete(resolveInquiry);

export default router;
