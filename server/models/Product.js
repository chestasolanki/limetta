import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    materials: { type: String },
    dimensions: { type: String },
    features: [{ type: String }],
    price: { type: Number, required: true },
    mrp: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    category: { type: String, required: true }, // e.g. 'Lighting', 'Seating', 'Decor'
    images: [{ type: String, required: true }],
    stock: { type: Number, required: true, default: 10 },
    rating: { type: Number, required: true, default: 4.5 },
    finishes: [{ type: String }]
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
