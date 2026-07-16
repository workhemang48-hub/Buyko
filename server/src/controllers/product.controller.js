import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, subCategory, bestseller, featured, sizes, images } = req.body;

    if (!name || !description || !price || !category || !subCategory) {
      return res.status(400).json({ message: 'Please provide name, description, price, category, and subCategory' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      originalPrice,
      category,
      subCategory,
      bestseller,
      featured,
      sizes,
      images,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, price, originalPrice, category, subCategory, bestseller, featured, sizes, images } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (originalPrice !== undefined) product.originalPrice = originalPrice;
    if (category !== undefined) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (bestseller !== undefined) product.bestseller = bestseller;
    if (featured !== undefined) product.featured = featured;
    if (sizes !== undefined) product.sizes = sizes;
    if (images !== undefined) product.images = images;

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};