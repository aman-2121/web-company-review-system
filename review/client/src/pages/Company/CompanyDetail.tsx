import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Building, MapPin, Star, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';

import AverageRating from '../../components/AverageRating';
import ReviewCard from '../../components/ReviewCard';
import ReviewForm from '../../components/ReviewForm';
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
  typeId?: string;
  Reviews?: Review[];
  reviews?: Review[];
  isApproved?: boolean;
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
  const [showFullDescription, setShowFullDescription] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);

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
      
      console.log('Company data:', companyData);
      
      setCompany(companyData);
      
      const reviewsData = companyData.Reviews || companyData.reviews || [];
      setReviews(reviewsData);
      
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

    if (!editingReview && userReview) {
      toast.error('You have already reviewed this company. You can edit your existing review.');
      return;
    }

    if (editingReview) {
      setReviews(reviews.map(review => 
        review.id === newReview.id ? newReview : review
      ));
      setUserReview(newReview);
      setEditingReview(null);
      toast.success('Review updated successfully');
    } else {
      const reviewWithUser: Review = {
        ...newReview,
        id: `temp-${Date.now()}`,
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
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    return `http://localhost:5000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  // Check if description needs "See More"
  const needsSeeMore = company?.description && company.description.length > 200;
  const displayDescription = company?.description ? 
    (showFullDescription ? company.description : company.description.slice(0, 200) + (company.description.length > 200 ? '...' : ''))
    : '';

  // Calculate average rating and review count
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const reviewCount = reviews.length;

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
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 transform hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition-all duration-200 transform hover:-translate-x-1 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Companies
        </Link>

        {/* Company Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl">
          {/* Company Image */}
          <div className="h-64 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 relative overflow-hidden">
            {company.imageUrl && !imageError ? (
              <>
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                )}
                <img
                  src={getImageUrl(company.imageUrl) || ''}
                  alt={company.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building className="h-20 w-20 text-white opacity-90" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            
            {/* Floating Rating Badge */}
            <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
              <div className="mb-4 sm:mb-0 flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                  {company.name}
                </h1>
                
                {/* Company Type and Address */}
                <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-4">
                  {company.type && (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 cursor-default">
                      <Building className="h-4 w-4 mr-1" />
                      {company.type.name}
                    </span>
                  )}
                  {company.address && (
                    <span className="inline-flex items-center text-sm transition-colors duration-200 hover:text-gray-800 dark:hover:text-gray-200">
                      <MapPin className="h-4 w-4 mr-1" />
                      {company.address}
                    </span>
                  )}
                </div>

                {/* Company Description with See More */}
                {company.description && (
                  <div className="mb-4 group">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed transition-all duration-300">
                      {displayDescription}
                    </p>
                    {needsSeeMore && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="inline-flex items-center mt-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-all duration-200 transform hover:scale-105 group"
                      >
                        {showFullDescription ? (
                          <>
                            Show Less
                            <ChevronUp className="h-4 w-4 ml-1 transition-transform duration-200" />
                          </>
                        ) : (
                          <>
                            See More
                            <ChevronDown className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-y-0.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Contact Information */}
                <div className="space-y-2">
                  {company.phoneNumber && (
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:text-gray-900 dark:hover:text-white">
                      <Phone className="h-4 w-4 mr-2 text-gray-500 transition-colors duration-200" />
                      <span className="font-medium mr-2">Phone:</span>
                      <a 
                        href={`tel:${company.phoneNumber}`}
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-all duration-200 transform hover:translate-x-0.5"
                      >
                        {company.phoneNumber}
                      </a>
                    </div>
                  )}
                  
                  {company.email && (
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:text-gray-900 dark:hover:text-white">
                      <Mail className="h-4 w-4 mr-2 text-gray-500 transition-colors duration-200" />
                      <span className="font-medium mr-2">Email:</span>
                      <a 
                        href={`mailto:${company.email}`}
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-all duration-200 transform hover:translate-x-0.5"
                      >
                        {company.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating Section */}
              <div className="text-center sm:text-right sm:ml-6 transition-all duration-300">
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <AverageRating
                    rating={averageRating}
                    reviewCount={reviewCount}
                    size="lg"
                  />
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:shadow-lg">
              {[
                { value: reviewCount, label: 'Total Reviews', color: 'blue' },
                { value: averageRating.toFixed(1), label: 'Average Rating', color: 'green' },
                { value: reviews.filter(r => r.rating >= 4).length, label: '4+ Star Reviews', color: 'yellow' },
                { value: reviews.filter(r => r.rating <= 2).length, label: 'Critical Reviews', color: 'purple' }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="text-center p-3 rounded-lg bg-white dark:bg-gray-600 shadow-sm border border-gray-100 dark:border-gray-500 transition-all duration-300 hover:shadow-md hover:scale-105 cursor-default group"
                >
                  <div className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 transition-transform duration-200 group-hover:scale-110`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1 transition-colors duration-200">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                Customer Reviews ({reviewCount})
              </h2>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div 
                    key={`review-${review.id}`}
                    className="transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <ReviewCard
                      review={review}
                      onEdit={handleEditReview}
                      onDelete={handleDeleteReview}
                      onReport={handleReportReview}
                      currentUserId={user?.id}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4 transition-colors duration-200" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                  No reviews yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">
                  Be the first to share your experience with this company!
                </p>
                {!user && (
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105"
                  >
                    Login to Review
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Review Form Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 transition-all duration-300">
              <div className="transform hover:scale-105 transition-transform duration-300">
                <ReviewForm
                  companyId={company.id}
                  existingReview={editingReview}
                  onSubmit={handleReviewSubmit}
                  onCancel={() => setEditingReview(null)}
                  user={user}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;