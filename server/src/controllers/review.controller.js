import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const recalculateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });

  const numReviews = reviews.length;
  const averageRating =
    numReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
      : 0;

  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(averageRating * 10) / 10,
    numReviews,
  });
};

const hasDeliveredOrder = async (userId, productId) => {
  const order = await Order.findOne({
    user: userId,
    orderStatus: 'delivered',
    'items.product': productId,
  });
  return !!order;
};

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    const eligible = await hasDeliveredOrder(req.user._id, productId);
    if (!eligible) {
      return res.status(403).json({
        message: 'You can only review products from delivered orders',
      });
    }

    const existing = await Review.findOne({ user: req.user._id, product: productId });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment: comment.trim(),
    });

    await recalculateProductRating(productId);

    const populatedReview = await Review.findById(review._id).populate('user', 'name');
    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({ user: req.user._id, product: productId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }

    if (comment) {
      review.comment = comment.trim();
    }

    await review.save();
    await recalculateProductRating(productId);

    const populatedReview = await Review.findById(review._id).populate('user', 'name');
    res.json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { productId } = req.params;

    const review = await Review.findOneAndDelete({ user: req.user._id, product: productId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await recalculateProductRating(productId);

    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params;

    const eligible = await hasDeliveredOrder(req.user._id, productId);
    const existingReview = await Review.findOne({ user: req.user._id, product: productId });

    res.json({ eligible, hasReviewed: !!existingReview, review: existingReview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};