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

// Starter categories
const categoriesData = [
  { name: 'Lighting', image: '/images/modern_wooden_lamp.png' },
  { name: 'Seating', image: '/images/velvet_armchair.png' },
  { name: 'Decor', image: '/images/ceramic_vases.png' }
];

// Curated luxury starter products for each category
const productsData = [
  // LIGHTING CATEGORY
  {
    title: 'Sculptural Brass & Frosted Glass Pendant',
    description: 'Hand-finished solid brass ceiling pendant featuring dual-sphere opalescent frosted glass globes for diffuse, glare-free architectural illumination.',
    shortDescription: 'Hand-finished solid brass pendant with dual-sphere opalescent glass globes.',
    materials: 'Solid Brushed Brass, Hand-Blown Opal Glass',
    dimensions: 'Diameter: 18 in | Drop Height: Adjustable 24-48 in',
    features: ['Dimmable LED architectural core', 'Dual-sphere hand blown glass', 'Concealed ceiling rose canopy'],
    price: 18500,
    mrp: 24000,
    discount: 23,
    category: 'Lighting',
    images: ['/images/brass_pendant.png'],
    stock: 8,
    rating: 4.9,
    finishes: ['Brushed Brass', 'Matte Black', 'Polished Nickel']
  },
  {
    title: 'Aura Minimalist Architectural Table Lamp',
    description: 'Warm indirect ambient illumination encased in a sculpted solid Japanese timber base with matte satin diffuser.',
    shortDescription: 'Warm indirect ambient illumination encased in sculpted Japanese timber base.',
    materials: 'Solid Natural Walnut, Matte Satin Acrylic Diffuser',
    dimensions: 'Base: 8 in x 8 in | Total Height: 16 in',
    features: ['Touch sensor dimming slider', 'Warm 2700K ambient LED', 'Braided textile power cable'],
    price: 8900,
    mrp: 11500,
    discount: 22,
    category: 'Lighting',
    images: ['/images/modern_wooden_lamp.png'],
    stock: 12,
    rating: 4.8,
    finishes: ['Natural Walnut', 'Smoked Ash']
  },

  // SEATING CATEGORY
  {
    title: 'Élégance Bouclé Curved Accent Sofa',
    description: 'Sculptural organic silhouette upholstered in tactile Italian bouclé fabric with solid kiln-dried hardwood frame construction.',
    shortDescription: 'Sculptural organic silhouette upholstered in tactile Italian bouclé fabric.',
    materials: 'Heavyweight Italian Bouclé, Solid Kiln-Dried Hardwood Frame',
    dimensions: 'Length: 84 in | Depth: 38 in | Height: 30 in',
    features: ['Stain-resistant bouclé weave', 'High-resilience foam core', 'Organic curved silhouette'],
    price: 64000,
    mrp: 78000,
    discount: 18,
    category: 'Seating',
    images: ['/images/boucle_sofa.png'],
    stock: 4,
    rating: 5.0,
    finishes: ['Ivory Bouclé', 'Sand Linen', 'Charcoal Wool']
  },
  {
    title: 'Sovereign Velvet Lounge Armchair',
    description: 'Deep lounge armchair featuring hand-tailored plush velvet upholstery supported by slender brushed brass electroplated steel legs.',
    shortDescription: 'Deep lounge chair crafted with brushed brass legs and high-resilience memory cushioning.',
    materials: 'Cotton Velvet Upholstery, Electroplated Brass Steel Legs',
    dimensions: 'Width: 34 in | Depth: 32 in | Height: 33 in',
    features: ['Ergonomic recline angle', 'Dual density cushion padding', 'Scratch-resistant floor pads'],
    price: 29500,
    mrp: 36000,
    discount: 18,
    category: 'Seating',
    images: ['/images/velvet_armchair.png'],
    stock: 6,
    rating: 4.9,
    finishes: ['Deep Forest Velvet', 'Burnt Amber Velvet', 'Midnight Navy']
  },

  // DECOR CATEGORY
  {
    title: 'Wabi-Sabi Ceramic Vessel Trio',
    description: 'Set of three hand-thrown ceramic stoneware vases with matte organic tactile glazes inspired by traditional wabi-sabi aesthetics.',
    shortDescription: 'Hand-thrown ceramic stoneware set with matte tactile glaze finishes.',
    materials: 'High-Fired Stoneware Ceramic, Organic Matte Glaze',
    dimensions: 'Small: 6 in | Medium: 10 in | Large: 14 in Height',
    features: ['100% Water-tight interior', 'Hand-crafted individual variation', 'Felt base protective pads'],
    price: 6499,
    mrp: 8500,
    discount: 23,
    category: 'Decor',
    images: ['/images/ceramic_vases.png'],
    stock: 15,
    rating: 4.7,
    finishes: ['Earthy Chalk', 'Terracotta Wash', 'Charcoal Slate']
  },
  {
    title: 'Travertine Monolith Sculptural Tray',
    description: 'Carved from a single block of natural un-filled Italian Travertine stone with soft bevelled edges and organic veining.',
    shortDescription: 'Carved from a single block of natural un-filled Italian Travertine stone.',
    materials: '100% Solid Natural Un-filled Travertine Marble',
    dimensions: 'Length: 14 in | Width: 9 in | Thickness: 1.2 in',
    features: ['Unique natural stone veining', 'Hand-honed satin finish', 'Solid heavy density centerpiece'],
    price: 7800,
    mrp: 9900,
    discount: 21,
    category: 'Decor',
    images: ['/images/travertine_tray.png'],
    stock: 10,
    rating: 4.9,
    finishes: ['Honed Roman Travertine', 'Beige Marble']
  }
];

const seedDB = async () => {
  try {
    await connectDB();

    // Reset database collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Cart.deleteMany({});

    console.log('Database wiped for initial seeding.');

    // Seed Categories
    await Category.insertMany(categoriesData);
    console.log('Starter categories (Lighting, Seating, Decor) seeded.');

    // Seed Products
    await Product.insertMany(productsData);
    console.log('Luxury products seeded in Lighting, Seating, and Decor categories.');

    // Seed Admin Account & Demo Customer
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

    console.log('Admin & Customer accounts seeded successfully.');
    console.log('Showroom Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
