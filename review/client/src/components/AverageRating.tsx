import React from 'react';
import { Star } from 'lucide-react';

interface AverageRatingProps {
  rating: number | string;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showEmptyStars?: boolean;
}

const AverageRating: React.FC<AverageRatingProps> = ({ 
  rating, 
  reviewCount, 
  size = 'md',
  showEmptyStars = true
}) => {
  const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  const validRating = !isNaN(numericRating) ? numericRating : 0;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const starPosition = index + 1;
      const filled = starPosition <= Math.floor(validRating);
      const halfFilled = !filled && starPosition - 0.5 <= validRating;
      
      // More precise fill calculation
      let fillPercentage = '0%';
      if (filled) {
        fillPercentage = '100%';
      } else if (halfFilled) {
        fillPercentage = '50%';
      } else if (validRating > index && validRating < index + 1) {
        // For partial fills beyond just 0.5 increments
        fillPercentage = `${(validRating - index) * 100}%`;
      }

      return (
        <div key={index} className="relative inline-block">
          {/* Background star (always shown if showEmptyStars is true) */}
          {showEmptyStars && (
            <Star
              className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`}
              fill="currentColor"
            />
          )}
          
          {/* Foreground star (filled portion) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: fillPercentage }}
          >
            <Star
              className={`${sizeClasses[size]} text-yellow-400`}
              fill="currentColor"
            />
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-0.5">
        {renderStars()}
      </div>
      <span className={`${textSizeClasses[size]} font-medium text-gray-700 dark:text-gray-300`}>
        {validRating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className={`${textSizeClasses[size]} text-gray-500 dark:text-gray-400`}>
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default AverageRating;