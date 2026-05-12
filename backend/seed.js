require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: 'Classic Slim Fit Oxford Shirt',
    description: 'A timeless oxford shirt crafted from premium 100% cotton. Features a slim fit silhouette with a spread collar and mother-of-pearl buttons. Perfect for both formal and smart-casual occasions.',
    price: 2499,
    discountPrice: 1999,
    category: 'Men',
    brand: 'VideStore',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Light Blue', hex: '#ADD8E6' }, { name: 'Navy', hex: '#000080' }],
    stock: 50,
    isFeatured: true,
    isNewArrival: true,
    material: '100% Premium Cotton',
    images: [
      { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80', public_id: 'shirt1' },
      { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80', public_id: 'shirt2' },
    ],
    ratings: 4.5,
    numReviews: 28,
    tags: ['shirt', 'formal', 'cotton', 'slim'],
  },
  {
    name: 'High-Rise Straight Denim Jeans',
    description: 'Premium high-rise straight leg jeans made from sustainable denim. Features a classic five-pocket design with a comfortable stretch fabric for all-day wear.',
    price: 3999,
    discountPrice: 2999,
    category: 'Women',
    brand: 'VideStore',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Light Wash', hex: '#B0C4DE' }, { name: 'Dark Wash', hex: '#1B2A4A' }, { name: 'Black', hex: '#000000' }],
    stock: 35,
    isFeatured: true,
    isBestSeller: true,
    material: '98% Cotton, 2% Elastane',
    images: [
      { url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80', public_id: 'jeans1' },
    ],
    ratings: 4.7,
    numReviews: 45,
    tags: ['jeans', 'denim', 'high-rise', 'women'],
  },
  {
    name: 'Oversized Graphic Streetwear Hoodie',
    description: 'Statement oversized hoodie featuring exclusive VideStore graphic print. Made from heavyweight fleece with a kangaroo pocket and adjustable drawstring hood.',
    price: 3299,
    category: 'Streetwear',
    brand: 'VideStore',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Off White', hex: '#FAF9F6' }, { name: 'Olive', hex: '#808000' }],
    stock: 60,
    isNewArrival: true,
    isBestSeller: true,
    material: '80% Cotton, 20% Polyester',
    images: [
      { url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80', public_id: 'hoodie1' },
    ],
    ratings: 4.8,
    numReviews: 62,
    tags: ['hoodie', 'streetwear', 'oversized', 'graphic'],
  },
  {
    name: 'Minimalist Leather Tote Bag',
    description: 'Sophisticated leather tote bag with clean lines and ample storage. Features a zippered interior pocket, magnetic closure, and detachable shoulder strap.',
    price: 5999,
    discountPrice: 4999,
    category: 'Accessories',
    brand: 'VideStore',
    sizes: ['Free Size'],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Tan', hex: '#D2B48C' }, { name: 'White', hex: '#FFFFFF' }],
    stock: 20,
    isFeatured: true,
    material: 'Genuine Leather',
    images: [
      { url: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&q=80', public_id: 'bag1' },
    ],
    ratings: 4.6,
    numReviews: 33,
    tags: ['bag', 'leather', 'tote', 'accessories'],
  },
  {
    name: 'Relaxed Fit Linen Trousers',
    description: 'Effortlessly chic linen trousers with a relaxed fit. Features an elasticated waistband with drawstring, side pockets, and a breathable linen blend fabric ideal for warm weather.',
    price: 2799,
    category: 'Women',
    brand: 'VideStore',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Cream', hex: '#FFFDD0' }, { name: 'Sage', hex: '#9CAD7F' }, { name: 'Sand', hex: '#C2B280' }],
    stock: 40,
    isNewArrival: true,
    material: '55% Linen, 45% Cotton',
    images: [
      { url: 'https://images.unsplash.com/photo-1551854838-212c9d5aca70?w=600&q=80', public_id: 'trousers1' },
    ],
    ratings: 4.4,
    numReviews: 19,
    tags: ['trousers', 'linen', 'relaxed', 'women'],
  },
  {
    name: 'Technical Running Jacket',
    description: 'Lightweight windproof running jacket with moisture-wicking technology. Features reflective details for visibility, packable design, and multiple zip pockets.',
    price: 4499,
    discountPrice: 3599,
    category: 'Men',
    brand: 'VideStore',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Electric Blue', hex: '#007FFF' }, { name: 'Red', hex: '#FF0000' }],
    stock: 30,
    isBestSeller: true,
    material: '100% Recycled Polyester',
    images: [
      { url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80', public_id: 'jacket1' },
    ],
    ratings: 4.9,
    numReviews: 87,
    tags: ['jacket', 'running', 'technical', 'men'],
  },
  {
    name: 'Gold Chain Statement Necklace',
    description: 'Bold layered gold chain necklace crafted from 18K gold-plated brass. A versatile piece that elevates any outfit from casual to formal.',
    price: 1999,
    discountPrice: 1499,
    category: 'Accessories',
    brand: 'VideStore',
    sizes: ['Free Size'],
    colors: [{ name: 'Gold', hex: '#C9A84C' }, { name: 'Silver', hex: '#C0C0C0' }],
    stock: 25,
    isFeatured: true,
    isNewArrival: true,
    material: '18K Gold Plated Brass',
    images: [
      { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80', public_id: 'necklace1' },
    ],
    ratings: 4.3,
    numReviews: 24,
    tags: ['necklace', 'gold', 'jewelry', 'accessories'],
  },
  {
    name: 'Cargo Streetwear Pants',
    description: 'Utility-inspired cargo pants with a modern streetwear edge. Features multiple pockets, adjustable ankle cuffs, and a relaxed fit through the hip and thigh.',
    price: 3499,
    category: 'Streetwear',
    brand: 'VideStore',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Khaki', hex: '#C3B091' }, { name: 'Black', hex: '#000000' }, { name: 'Camo', hex: '#78866B' }],
    stock: 45,
    isNewArrival: true,
    isBestSeller: true,
    material: '100% Cotton Twill',
    images: [
      { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80', public_id: 'cargo1' },
    ],
    ratings: 4.6,
    numReviews: 41,
    tags: ['cargo', 'streetwear', 'pants', 'utility'],
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'videstore2027@gmail.com',
      password: 'VideStore2027',
      role: 'admin',
      phone: '+91 9876543210',
    });
    console.log('👑 Admin created: videstore2027@gmail.com / VideStore2027');

    // Create test user
    await User.create({
      name: 'Test Customer',
      email: 'user@videstore.in',
      password: 'User@123',
      role: 'user',
      phone: '+91 9876543211',
    });
    console.log('👤 Test user created: user@videstore.in / User@123');

    // Create products
    const products = sampleProducts.map(p => ({ ...p, createdBy: adminUser._id }));
    await Product.insertMany(products);
    console.log(`✅ ${products.length} products seeded`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('📌 Admin Login: videstore2027@gmail.com / VideStore2027');
    console.log('📌 User Login:  user@videstore.in / User@123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDB();