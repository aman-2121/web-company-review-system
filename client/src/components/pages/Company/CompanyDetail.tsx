import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Building, MapPin, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';

import AverageRating from '../../../components/AverageRating';
import ReviewCard from '../../../components/ReviewCard';
import ReviewForm from '../../../components/ReviewForm';
import { useAuth } from '../../context/AuthContext';

// Proper interfaces
interface CompanyType {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  user?: User;
  isReported?: boolean;
  createdAt?: string;
}

interface Company {
  id: string;
  name: string;
  description?: string;
  address?: string;
  imageUrl?: string;
  phoneNumber?: string;
  email?: string;
  type?: CompanyType;
  Reviews?: Review[];
  reviews?: Review[];
}

// Axios error type
interface AxiosError {
  response?: {
    status: number;
    data: unknown;
  };
  code?: string;
  message: string;
}

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    if (id) {
      fetchCompanyData();
    }
  }, [id, user]);

  const fetchCompanyData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<Company>(`/api/companies/${id}`);
      const companyData = response.data;
      
      setCompany(companyData);
      
      // Handle different possible review structures from backend
      const reviewsData = companyData.Reviews || companyData.reviews || [];
      setReviews(reviewsData);
      
      // Find user's existing review
      if (user && user.id) {
        const existingReview = reviewsData.find(
          (review: Review) => review.userId === user.id
        );
        setUserReview(existingReview || null);
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching company:', axiosError);
      
      if (axiosError.response?.status === 404) {
        toast.error('Company not found');
      } else if (axiosError.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else if (axiosError.code === 'NETWORK_ERROR' || axiosError.message?.includes('Network Error')) {
        console.log('Backend not connected - showing offline state');
        toast.error('Cannot connect to server. Showing offline data.');
      } else {
        toast.error('Failed to load company details');
      }
      
      setCompany(null);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = (newReview: Review): void => {
    if (!user) {
      toast.error('You must be logged in to submit a review');
      return;
    }

    // Check if user already has a review to prevent duplicates
    if (!editingReview && userReview) {
      toast.error('You have already reviewed this company. You can edit your existing review.');
      return;
    }

    if (editingReview) {
      // Update existing review
      setReviews(reviews.map(review => 
        review.id === newReview.id ? newReview : review
      ));
      setUserReview(newReview);
      setEditingReview(null);
      toast.success('Review updated successfully');
    } else {
      // Add new review with proper user data
      const reviewWithUser: Review = {
        ...newReview,
        id: `temp-${Date.now()}`, // Temporary ID for frontend
        user: {
          id: user.id,
          name: user.name || 'Anonymous',
          email: user.email || ''
        },
        userId: user.id,
        createdAt: new Date().toISOString()
      };
      setReviews([reviewWithUser, ...reviews]);
      setUserReview(reviewWithUser);
      toast.success('Review submitted successfully');
    }
    
    // Refresh to get updated averages from backend
    fetchCompanyData();
  };

  const handleEditReview = (review: Review): void => {
    setEditingReview(review);
  };

  const handleDeleteReview = (reviewId: string): void => {
    setReviews(reviews.filter(review => review.id !== reviewId));
    if (userReview?.id === reviewId) {
      setUserReview(null);
    }
    toast.success('Review deleted successfully');
  };

  const handleReportReview = (reviewId: string): void => {
    setReviews(reviews.map(review =>
      review.id === reviewId ? { ...review, isReported: true } : review
    ));
    toast.success('Review reported successfully');
  };

  // Helper function to get proper image URL
  const getImageUrl = (imageUrl?: string): string | null => {
    if (!imageUrl) return null;
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a relative path, prepend the backend URL
    return `http://localhost:5173${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Company Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The company you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Link>

        {/* Company Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          {/* Company Image */}
          <div className="h-64 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 relative">
            {company.imageUrl ? (
              <img
                src={getImageUrl(company.imageUrl) || ''}
                alt={company.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building className="h-20 w-20 text-white opacity-90" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          </div>

          {/* Company Info */}
          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {company.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-4">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                    <Building className="h-4 w-4 mr-1" />
                    {company.type?.name || 'Not specified'}
                  </span>
                  {company.address && (
                    <span className="inline-flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {company.address}
                    </span>
                  )}
                </div>

                {/* Additional Company Details */}
                <div className="space-y-2">
                  {company.description && (
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Description:</span> {company.description}
                    </div>
                  )}
                  {company.phoneNumber && (
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">📞 Phone:</span> {company.phoneNumber}
                    </div>
                  )}
                  {company.email && (
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">✉️ Email:</span> <a href={`mailto:${company.email}`} className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">{company.email}</a>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center sm:text-right">
                <AverageRating
                  rating={averageRating}
                  reviewCount={reviews.length}
                  size="lg"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-white">
                  {reviews.length}
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-400">
                  Total Reviews
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-white">
                  {averageRating.toFixed(1)}
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-400">
                  Average Rating
                </div>
              </div>
              <div className="text-center sm:block hidden">
                <div className="text-2xl font-bold text-purple-600 dark:text-white">
                  {reviews.filter(r => r.rating >= 4).length}
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-400">
                  4+ Star Reviews
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Reviews ({reviews.length})
              </h2>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <ReviewCard
                    key={`review-${review.id}`}
                    review={review}
                    onEdit={handleEditReview}
                    onDelete={handleDeleteReview}
                    onReport={handleReportReview}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be the first to review this company!
                </p>
              </div>
            )}
          </div>

          {/* Review Form Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ReviewForm
                companyId={company.id}
                existingReview={editingReview}
                onSubmit={handleReviewSubmit}
                onCancel={() => setEditingReview(null)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;