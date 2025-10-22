import React from 'react';
import { Star } from 'lucide-react';

const AverageRating = ({ rating, reviewCount, size = 'sm' }) => {
  const numericRating = parseFloat(rating) || 0;
  
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
      const filled = index < Math.floor(numericRating);
      const halfFilled = index === Math.floor(numericRating) && numericRating % 1 >= 0.5;
      
      return (
        <div key={index} className="relative">
          <Star 
            className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`} 
          />
          <Star 
            className={`absolute inset-0 ${sizeClasses[size]} transition-colors ${
              filled 
                ? 'text-yellow-400 fill-current' 
                : halfFilled 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300 dark:text-gray-600'
            }`}
            style={
              halfFilled 
                ? { clipPath: 'inset(0 50% 0 0)' }
                : undefined
            }
          />
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
        {numericRating.toFixed(1)}
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