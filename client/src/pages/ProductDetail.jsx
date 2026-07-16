import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById } from '../api/products';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import StarRating from '../components/StarRating';
import { Star } from 'lucide-react';
import {
  getProductReviews,
  getReviewEligibility,
  createReview,
  updateReview,
  deleteReview,
} from '../api/reviews';
import { Skeleton } from '../components/Skeleton';
import Spinner from '../components/Spinner';

export default function ProductDetail({ showToast }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState('');
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);

  const [reviews, setReviews] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(false);

  const goToImage = (index) => {
    setSlideDirection(index > selectedImage ? 1 : -1);
    setSelectedImage(index);
  };
  useEffect(() => {
    if (!product?.images || product.images.length < 2) return;

    const interval = setInterval(() => {
      setSelectedImage((prev) => {
        const next = (prev + 1) % product.images.length;
        setSlideDirection(1);
        return next;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [product?.images]);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const loadReviews = async () => {
    try {
      const data = await getProductReviews(id);
      setReviews(data);
    } catch (err) {
      // silently ignore, reviews list just stays empty
    }
  };

  useEffect(() => {
    loadReviews();
  }, [id]);

  useEffect(() => {
    if (user) {
      getReviewEligibility(id)
        .then(setEligibility)
        .catch(() => setEligibility(null));
    } else {
      setEligibility(null);
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <Skeleton className="aspect-square rounded-xl w-full" />
            <div className="flex gap-3 mt-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-16 h-16 rounded-lg" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-7 w-3/4 mb-3" />
            <Skeleton className="h-4 w-32 mb-5" />
            <Skeleton className="h-6 w-24 mb-6" />
            <div className="space-y-2 mb-8">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex gap-2 mb-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-14 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <p className="text-buyko-text-dim mb-4">{error || 'Product not found.'}</p>
        <Link to="/" className="text-orange-400 hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setSavingReview(true);
    try {
      if (editingReview) {
        await updateReview(id, reviewRating, reviewComment.trim());
        showToast?.('Review updated');
      } else {
        await createReview(id, reviewRating, reviewComment.trim());
        showToast?.('Review submitted');
      }
      setReviewComment('');
      setReviewRating(5);
      setEditingReview(false);
      await loadReviews();
      const updatedEligibility = await getReviewEligibility(id);
      setEligibility(updatedEligibility);
      const refreshedProduct = await getProductById(id);
      setProduct(refreshedProduct);
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Could not save review');
    } finally {
      setSavingReview(false);
    }
  };

  const handleEditClick = () => {
    if (eligibility?.review) {
      setReviewRating(eligibility.review.rating);
      setReviewComment(eligibility.review.comment);
      setEditingReview(true);
    }
  };

  const handleDeleteReview = async () => {
    try {
      await deleteReview(id);
      showToast?.('Review deleted');
      setEditingReview(false);
      setReviewComment('');
      setReviewRating(5);
      await loadReviews();
      const updatedEligibility = await getReviewEligibility(id);
      setEligibility(updatedEligibility);
      const refreshedProduct = await getProductById(id);
      setProduct(refreshedProduct);
    } catch (err) {
      showToast?.('Could not delete review');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (product.sizes?.length > 0 && !selectedSize) {
      setSizeError('Please select a size.');
      return;
    }

    setAdding(true);
    try {
      await addToCart(product._id, selectedSize, 1);
      showToast?.('Added to cart');
    } catch (err) {
      showToast?.('Could not add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="rounded-xl overflow-hidden bg-black/20 relative">
            {product.images?.[selectedImage] ? (
              <img
                key={selectedImage}
                src={product.images[selectedImage]}
                alt={product.name}
                style={{
                  animation: `${slideDirection === 1 ? 'slideInFromRight' : 'slideInFromLeft'} 0.35s ease-out`,
                }}
                className="w-full h-auto block"
              />
            ) : (
              <div className="aspect-square flex items-center justify-center">
                <span className="text-white/60 text-sm">No image</span>
              </div>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-3 mt-4">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-orange-400' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-buyko-text-dim uppercase tracking-widest mb-2">
            {product.category}
          </p>
          <h1 className="text-2xl font-semibold text-buyko-text mb-2">{product.name}</h1>

          {product.numReviews > 0 && (
            <div className="mb-3">
              <StarRating
                rating={product.averageRating}
                size={16}
                showCount
                count={product.numReviews}
              />
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-xl font-medium text-buyko-text">&#8377;{product.price}</span>
            {hasDiscount && (
              <>
                <span className="text-sm text-buyko-text-dim/50 line-through">
                  &#8377;{product.originalPrice}
                </span>
                <span className="bg-orange-400/15 text-orange-400 text-xs px-2 py-1 rounded-md">
                  {discountPercent}% off
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-buyko-text-dim leading-relaxed mb-6">
            {product.description}
          </p>

          {product.sizes?.length > 0 && (
            <div className="mb-8">
              <p className="text-xs text-buyko-text-dim mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const outOfStock = s.stock === 0;
                  const isSelected = selectedSize === s.size;

                  return (
                    <button
                      key={s.size}
                      disabled={outOfStock}
                      onClick={() => {
                        setSelectedSize(s.size);
                        setSizeError('');
                      }}
                      className={`text-sm px-4 py-2 rounded-md border transition-colors duration-200 ${
                        outOfStock
                          ? 'border-white/5 text-buyko-text-dim/30 line-through cursor-not-allowed'
                          : isSelected
                          ? 'border-orange-400 text-buyko-text'
                          : 'border-white/10 text-buyko-text-dim hover:border-white/20'
                      }`}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>

              {(() => {
                const selectedSizeEntry = product.sizes.find((s) => s.size === selectedSize);
                if (selectedSizeEntry && selectedSizeEntry.stock > 0 && selectedSizeEntry.stock <= 10) {
                  return (
                    <p className="text-xs text-rose-400 mt-2">
                      Only {selectedSizeEntry.stock} left!
                    </p>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {sizeError && (
            <p className="text-sm text-rose-400 mb-3">{sizeError}</p>
          )}

          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="w-full rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 text-white font-medium py-3 disabled:opacity-60"
          >
            {adding ? (
              <span className="inline-flex items-center justify-center gap-1.5">
                <Spinner size={14} /> Adding...
              </span>
            ) : (
              'Add to cart'
            )}
          </button>
        </div>
      </div>

      <div className="mt-16 max-w-2xl">
        <h2 className="text-lg font-medium text-buyko-text mb-6">Reviews</h2>

        {eligibility?.eligible && (
          <form onSubmit={handleReviewSubmit} className="border border-white/10 rounded-xl p-5 mb-8">
            <h3 className="text-sm font-medium text-buyko-text mb-4">
              {editingReview ? 'Edit your review' : 'Write a review'}
            </h3>

            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-0.5"
                >
                  <Star
                    size={22}
                    className={star <= reviewRating ? 'fill-orange-400 text-orange-400' : 'text-white/15'}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              rows={3}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-buyko-text mb-4 focus:outline-none focus:border-orange-400/50"
            />

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={savingReview}
                className="text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 text-white disabled:opacity-60"
              >
                {savingReview ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Spinner size={12} /> Saving...
                  </span>
                ) : editingReview ? (
                  'Update review'
                ) : (
                  'Submit review'
                )}
              </button>

              {eligibility?.hasReviewed && !editingReview && (
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="text-sm text-orange-400 hover:underline"
                >
                  Edit your review
                </button>
              )}

              {eligibility?.hasReviewed && (
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  className="text-sm text-rose-400 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        )}

        {user && eligibility && !eligibility.eligible && (
          <p className="text-sm text-buyko-text-dim mb-8">
            Only customers who have received this product can leave a review.
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-buyko-text-dim">No reviews yet.</p>
        ) : (
          <div className="space-y-5">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-white/5 pb-5">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-medium text-buyko-text">
                    {review.user?.name || 'Anonymous'}
                  </span>
                  <StarRating rating={review.rating} size={12} />
                </div>
                <p className="text-xs text-buyko-text-dim mb-2">
                  {new Date(review.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-sm text-buyko-text-dim leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}