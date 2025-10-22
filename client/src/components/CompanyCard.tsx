import React from 'react';

import {
  Building,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import AverageRating from './AverageRating';

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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group hover:border-blue-300 dark:hover:border-blue-600">
        {/* Image */}
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
          {company.imageUrl ? (
            <img
               src={`http://localhost:5000${company.imageUrl}`} 

              alt={company.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600">
              <Building className="h-12 w-12 text-white opacity-90" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 bg-white dark:bg-gray-800">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              {company.name}
            </h3>
            {company.type && (
                                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                                   
                                    {company.type.name}
                                  </span>
            )}
          </div>

          {company.address && (
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{company.address}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <AverageRating 
              rating={displayRating} 
              reviewCount={displayReviewCount} 
              size="sm" 
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CompanyCard;