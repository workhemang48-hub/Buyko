import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, size = 14, showCount = false, count = 0 }) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= rounded ? 'fill-orange-400 text-orange-400' : 'text-white/15'}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-buyko-text-dim">
          {rating > 0 ? `${rating.toFixed(1)} (${count})` : 'No reviews yet'}
        </span>
      )}
    </div>
  );
}