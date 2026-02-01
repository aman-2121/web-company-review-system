import React, { useState, useEffect } from 'react';
import {
  Building,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import AverageRating from './AverageRating';

interface CompanyCardProps {
  company: any;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  const [companyData, setCompanyData] = useState(company);
  const [loading, setLoading] = useState(false);

  // ✅ ADD THE getImageUrl FUNCTION HERE
  const getImageUrl = (imageUrl?: string): string | null => {
    if (!imageUrl) return null;
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a relative path, prepend the backend URL
    return `http://localhost:5000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  // Function to fetch complete company data
  useEffect(() => {
    const fetchCompanyData = async () => {
      // Always fetch complete company data if we have company ID
      if (company.id) {
        try {
          setLoading(true);
          const response = await fetch(`http://localhost:5000/api/companies/${company.id}`);

          if (response.ok) {
            const completeCompanyData = await response.json();
            setCompanyData(completeCompanyData);
          }
        } catch (error) {
          console.error('Error fetching company data:', error);
          // Keep original company data if fetch fails
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCompanyData();
  }, [company.id]);

  // Use the fetched data or fallback to original company data
  const displayCompany = companyData || company;
  
  const reviews = displayCompany.Reviews || displayCompany.reviews || [];
  const reviewCount = displayCompany.reviewCount || reviews.length || 0;
  const averageRating = displayCompany.averageRating || (reviews.length > 0
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
    : 0);
  
  // Fallback for missing data
  const displayRating = averageRating || 0;
  const displayReviewCount = reviewCount || 0;

  // Show loading skeleton if data is being fetched
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
        <div className="w-full h-48 bg-gray-300 dark:bg-gray-600"></div>
        <div className="p-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <Link to={`/companies/${displayCompany.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group hover:border-blue-300 dark:hover:border-blue-600">
        {/* Image */}
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
          {displayCompany.imageUrl ? (
            <img
              // ✅ USE THE FUNCTION HERE
              src={getImageUrl(displayCompany.imageUrl) || ''}
              alt={displayCompany.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
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
              {displayCompany.name}
            </h3>
            {displayCompany.type && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                {displayCompany.type.name}
              </span>
            )}
          </div>

          {displayCompany.address && (
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{displayCompany.address}</span>
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