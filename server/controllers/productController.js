import Product from '../models/Product.js';

// @desc    Get all products (with filters, sorting, search)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const { category, min, max, search, sort } = req.query;

  let query = {};

  // Category filter
  if (category && category !== 'All') {
    query.category = category;
  }

  // Price range filter
  if (min || max) {
    query.price = {};
    if (min) query.price.$gte = Number(min);
    if (max) query.price.$lte = Number(max);
  }

  // Keyword search filter (title or description)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    let apiQuery = Product.find(query);

    // Sorting (sort=price, sort=-price, sort=rating, or default newest first)
    if (sort) {
      if (sort === 'price') {
        apiQuery = apiQuery.sort({ price: 1 });
      } else if (sort === '-price') {
        apiQuery = apiQuery.sort({ price: -1 });
      } else if (sort === 'rating') {
        apiQuery = apiQuery.sort({ rating: -1 });
      }
    } else {
      apiQuery = apiQuery.sort({ createdAt: -1 });
    }

    const products = await apiQuery;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { 
    title, description, shortDescription, materials, dimensions, features, 
    price, mrp, discount, category, images, stock, rating, finishes 
  } = req.body;

  try {
    const product = await Product.create({
      title,
      description,
      shortDescription,
      materials,
      dimensions,
      features: features || [],
      price: Number(price),
      mrp: Number(mrp) || 0,
      discount: Number(discount) || 0,
      category,
      images: images || ['/images/placeholder.png'],
      stock: stock !== undefined ? Number(stock) : 10,
      rating: Number(rating) || 4.5,
      finishes: finishes || []
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const { 
    title, description, shortDescription, materials, dimensions, features, 
    price, mrp, discount, category, images, stock, rating, finishes 
  } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.title = title || product.title;
      product.description = description || product.description;
      product.shortDescription = shortDescription !== undefined ? shortDescription : product.shortDescription;
      product.materials = materials !== undefined ? materials : product.materials;
      product.dimensions = dimensions !== undefined ? dimensions : product.dimensions;
      product.features = features || product.features;
      product.price = price !== undefined ? Number(price) : product.price;
      product.mrp = mrp !== undefined ? Number(mrp) : product.mrp;
      product.discount = discount !== undefined ? Number(discount) : product.discount;
      product.category = category || product.category;
      product.images = images || product.images;
      product.stock = stock !== undefined ? Number(stock) : product.stock;
      product.rating = rating !== undefined ? Number(rating) : product.rating;
      product.finishes = finishes || product.finishes;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: req.params.id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
