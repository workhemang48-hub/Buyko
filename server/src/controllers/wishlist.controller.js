import Wishlist from '../models/Wishlist.js';

export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const toggleWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
    } else {
      const alreadySaved = wishlist.products.some(
        (id) => id.toString() === productId
      );

      if (alreadySaved) {
        wishlist.products = wishlist.products.filter(
          (id) => id.toString() !== productId
        );
      } else {
        wishlist.products.push(productId);
      }

      await wishlist.save();
    }

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
    res.json(populatedWishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};