import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const ReviewForm = ({ companyId, existingReview, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(existingReview?.isAnonymous || false);

  // Update form when existingReview changes
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
      setIsAnonymous(existingReview.isAnonymous || false);
    } else {
      setRating(0);
      setComment('');
      setIsAnonymous(false);
    }
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }



    setIsSubmitting(true);

    try {
      let response;
      if (existingReview) {
        // Update existing review
        response = await axios.put(`/api/reviews/${existingReview.id}`, {
          rating,
          comment: comment.trim(),
          isAnonymous
        });
        toast.success('Review updated successfully!');
      } else {
        // Create new review
        response = await axios.post('/api/reviews', {
          companyId,
          rating,
          comment: comment.trim(),
          isAnonymous
        });
        toast.success('Review submitted successfully!');
      }

      if (onSubmit) {
        onSubmit(response.data);
      }

      // Reset form if creating new review
      if (!existingReview) {
        setRating(0);
        setComment('');
        setIsAnonymous(false);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit review';
      if (message.includes('already reviewed') || message.includes('duplicate')) {
        toast.error('You have already reviewed this company. You can edit your existing review.');
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
      setIsAnonymous(existingReview.isAnonymous || false);
    } else {
      setRating(0);
      setComment('');
      setIsAnonymous(false);
    }
    if (onCancel) onCancel();
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center shadow-lg">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-400 mb-4 font-medium">
          Want to share your experience with this company?
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-500 mb-6">
          Join our community to write reviews and help others make informed decisions.
        </p>
        <div className="space-y-3">
          <Link
            to="/login"
            className="block w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Log In to Review
          </Link>
          <Link
            to="/register"
            className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Rating
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-all duration-200 focus:outline-none hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
            {rating === 1 ? 'Poor' : 
             rating === 2 ? 'Fair' : 
             rating === 3 ? 'Good' : 
             rating === 4 ? 'Very Good' : 'Excellent'}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this company..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {comment.length}/1000 characters
        </p>
      </div>

      {/* Anonymous Option */}
      <div className="mb-6">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Post anonymously (your name won't be shown)
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        {(existingReview || onCancel) && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;