import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

dotenv.config();

const clearDummyData = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleaned all dummy products and orders from MongoDB successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error.message);
    process.exit(1);
  }
};

clearDummyData();
