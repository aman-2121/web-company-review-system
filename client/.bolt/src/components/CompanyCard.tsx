import React from 'react';
import { Link } from 'react-router-dom';
import AverageRating from './AverageRating';
import { MapPin, Building } from 'lucide-react';

const CompanyCard = ({ company }) => {
  const reviews = company.Reviews || company.reviews || [];
  const reviewCount = company.reviewCount || reviews.length || 0;
  const averageRating = company.averageRating || (reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0);
  
  // Fallback for missing data
  const displayRating = averageRating || 0;
  const displayReviewCount = reviewCount || 0;

  return (
    <Link to={`/companies/${company.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden group">
        {/* Image */}
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
          {company.imageUrl ? (
            <img
              src={company.imageUrl}
              alt={company.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
              <Building className="h-12 w-12 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
              {company.name}
            </h3>
            {company.type && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full shrink-0">
                {company.type.name}
              </span>
            )}
          </div>

          {company.address && (
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{company.address}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <AverageRating 
              rating={displayRating} 
              reviewCount={displayReviewCount} 
              size="sm" 
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {displayReviewCount} {displayReviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CompanyCard;