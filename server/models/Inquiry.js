import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: 'Not provided' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    resolved: { type: Boolean, default: false },
    date: { type: String }
  },
  { timestamps: true }
);

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
