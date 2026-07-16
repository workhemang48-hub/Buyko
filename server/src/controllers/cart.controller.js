import Cart from '../models/Cart.js';

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/cart  (body: { productId, size, quantity })
export const addToCart = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;
    if (!productId || !size || !quantity) {
      return res.status(400).json({ message: 'productId, size, and quantity are required' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, size, quantity });
    }

    await cart.save();
    const populatedCart = await cart.populate('items.product');
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/cart/:itemId  (body: { quantity })
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'A valid quantity is required' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.quantity = Number(quantity);
    await cart.save();
    const populatedCart = await cart.populate('items.product');
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/cart/:itemId
export const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();
    const populatedCart = await cart.populate('items.product');
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};