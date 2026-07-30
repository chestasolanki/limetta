import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Cart from '../models/Cart.js';

dotenv.config();

// Default starter categories (Admin can manage / add more from Admin Console)
const categoriesData = [
  { name: 'Lighting', image: '/images/modern_wooden_lamp.png' },
  { name: 'Seating', image: '/images/velvet_armchair.png' },
  { name: 'Decor', image: '/images/ceramic_vases.png' }
];

const seedDB = async () => {
  try {
    await connectDB();

    // Wipe all existing collections to 0
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Cart.deleteMany({});

    console.log('Database wiped completely to zero records.');

    // Seed default categories for admin structure
    await Category.insertMany(categoriesData);
    console.log('Starter categories seeded.');

    // Seed Admin Account (Allows login to start adding pieces)
    await User.create([
      {
        name: 'Chesta Solanki (Admin)',
        email: 'chestasolanki664@gmail.com',
        password: 'Chesta2408@',
        phone: '+91 7455042260',
        role: 'admin',
        address: {
          street: '12 Luxury Boulevard',
          city: 'Gurgaon',
          state: 'Haryana',
          postalCode: '122002',
          country: 'India'
        }
      },
      {
        name: 'Genevieve Thorne',
        email: 'customer@limetta.com',
        password: 'customer123',
        phone: '+1 555 890 2345',
        role: 'customer',
        address: {
          street: '42 Golden Gate Heights',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94122',
          country: 'USA'
        }
      }
    ]);
    console.log('Admin & Customer accounts created.');
    console.log('Database Clean Slate (Zero Products & Zero Orders) Setup Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error.message);
    process.exit(1);
  }
};

seedDB();
