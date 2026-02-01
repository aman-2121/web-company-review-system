import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AverageRating from '../../components/AverageRating';
import ReviewCard from '../../components/ReviewCard';
import ReviewForm from '../../components/ReviewForm';
import { MapPin, Building, Users, Star, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const CompanyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    fetchCompanyData();
  }, [id]);

  const fetchCompanyData = async () => {
    try {
      const response = await axios.get(`/api/companies/${id}`);
      setCompany(response.data);
      const reviewsData = response.data.Reviews || response.data.reviews || [];
      setReviews(reviewsData);
      
      // Find user's existing review
      if (user) {
        const existingReview = reviewsData.find(
          review => review.userId === user.id
        );
        setUserReview(existingReview || null);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
      if (error.response?.status === 404) {
        toast.error('Company not found');
      } else {
        console.log('Backend not connected - showing offline state');
        setCompany(null);
        setReviews([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = (newReview) => {
    if (editingReview) {
      // Update existing review
      setReviews(reviews.map(review => 
        review.id === newReview.id ? newReview : review
      ));
      setUserReview(newReview);
      setEditingReview(null);
    } else {
      // Add new review
      const reviewWithUser = {
        ...newReview,
        user: { id: user.id, name: user.name }
      };
      setReviews([reviewWithUser, ...reviews]);
      setUserReview(reviewWithUser);
    }
    fetchCompanyData(); // Refresh to get updated averages
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
  };

  const handleDeleteReview = (reviewId) => {
    setReviews(reviews.filter(review => review.id !== reviewId));
    if (userReview?.id === reviewId) {
      setUserReview(null);
    }
  };

  const handleReportReview = (reviewId) => {
    setReviews(reviews.map(review =>
      review.id === reviewId ? { ...review, isReported: true } : review
    ));
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          {/* Company Image */}
          <div className="h-64 bg-gradient-to-br from-blue-500 to-blue-600 relative">
            {company.imageUrl ? (
              <img
                src={company.imageUrl}
                alt={company.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building className="h-20 w-20 text-white" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>

          {/* Company Info */}
          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {company.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
                  {company.type && (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                      <Building className="h-4 w-4 mr-1" />
                      {company.type.name}
                    </span>
                  )}
                  {company.address && (
                    <span className="inline-flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {company.address}
                    </span>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reviews.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Reviews
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average Rating
                </div>
              </div>
              <div className="text-center sm:block hidden">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reviews.filter(r => r.rating >= 4).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
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
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                existingReview={editingReview || userReview}
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