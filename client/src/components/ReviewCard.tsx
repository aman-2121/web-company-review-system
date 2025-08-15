import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import {
  Edit2,
  Flag,
  MoreHorizontal,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import AverageRating from './AverageRating';

const ReviewCard = ({ review, onEdit, onDelete, onReport }) => {
  const { user, isAdmin } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [likes, setLikes] = useState(review.likes || 0);
  const [dislikes, setDislikes] = useState(review.dislikes || 0);
  const [userVote, setUserVote] = useState(review.userVote || null); // 'like', 'dislike', or null

  const isOwner = user?.id === review.userId;
  const canEdit = isOwner && !review.isReported;
  const canDelete = isOwner || isAdmin;
  const canReport = user && !isOwner && !review.isReported;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


useEffect(() => {
  if (!review?.id) return;

  axios.get(`/api/reviews/${review.id}/likes`)
    .then(res => {
      setLikes(res.data.likes);       // ✅ just the number
      setDislikes(res.data.dislikes); // ✅ set both if you want
      setUserVote(res.data.userVote); // keep track of the user’s vote
    })
    .catch(err => console.error(err));
}, [review?.id]);



  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }

    try {
      await axios.post(`/api/reviews/${review.id}/report`, {
        reason: reportReason
      });
      toast.success('Review reported successfully');
      setIsReporting(false);
      setReportReason('');
      setShowMenu(false);
      if (onReport) onReport(review.id);
    } catch (error) {
      toast.error('Failed to report review');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(`/api/reviews/${review.id}`);
        toast.success('Review deleted successfully');
        if (onDelete) onDelete(review.id);
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
    setShowMenu(false);
  };

const handleVote = async (voteType) => {
  if (!user) return toast.error('Please login to vote');

  // Convert to number before sending
  const numericVote = voteType === 'like' ? 1 : -1;

  try {
    const response = await axios.post(`/api/reviews/${review.id}/vote`, {
      vote: numericVote
    });

    setLikes(response.data.likes);
    setDislikes(response.data.dislikes);
    setUserVote(response.data.userVote);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to vote');
  }
};



  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {review.isAnonymous || !review.user ? 'Anonymous User' : review.user.name}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <AverageRating rating={review.rating} size="sm" />
          
          {user && (canEdit || canDelete || canReport) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10 min-w-32">
                  {canEdit && (
                    <button
                      onClick={() => {
                        onEdit(review);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  )}
                  
                  {canReport && (
                    <button
                      onClick={() => {
                        setIsReporting(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                    >
                      <Flag className="h-4 w-4" />
                      <span>Report</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {review.comment}
      </p>

      {/* Like/Dislike Buttons - NOW PROPERLY SHOWING */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={() => handleVote('like')}
          className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
            userVote === 'like'
              ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <ThumbsUp
  className="h-4 w-4"
  fill={userVote === 1 ? "currentColor" : "none"}
  color={userVote === 1 ? "red" : "currentColor"}
/>
          <span className="text-sm font-medium">{likes}</span>
        </button>
        
        <button
          onClick={() => handleVote('dislike')}
          className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
            userVote === 'dislike'
              ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <ThumbsDown
  className="h-4 w-4"
  fill={userVote === -1 ? "currentColor" : "none"}
  color={userVote === -1 ? "blue" : "currentColor"}
/>

          <span className="text-sm font-medium">{dislikes}</span>
        </button>
      </div>

      {review.isReported && (
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-sm text-orange-800 dark:text-orange-200 flex items-center">
            <Flag className="h-4 w-4 mr-2" />
            This review has been reported and is under review
          </p>
        </div>
      )}

      {/* Report Modal */}
      {isReporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Report Review
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Why are you reporting this review?
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please provide a reason for reporting this review..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setIsReporting(false);
                  setReportReason('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;