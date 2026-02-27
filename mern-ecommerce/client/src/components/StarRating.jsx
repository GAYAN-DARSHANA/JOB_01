// components/StarRating.jsx
import { Star } from 'lucide-react';

export function StarRating({ rating, maxStars = 5, size = 'md', interactive = false, onRate }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  return (
    <div className="flex gap-1">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const filled = starValue <= rating;
        
        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`${sizes[size]} ${
                filled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
}

export function RatingDisplay({ rating, reviewCount, size = 'md' }) {
  return (
    <div className="flex items-center gap-2">
      <StarRating rating={Math.round(rating)} size={size} />
      <span className="text-slate-600 font-medium">
        {rating} ({reviewCount} reviews)
      </span>
    </div>
  );
}