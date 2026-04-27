import os

content = r"""import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Edit2,
  Flag,
  MessageCircle,
  MoreHorizontal,
  Send,
  Shield,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import AverageRating from './AverageRating';

const ReviewCard = ({ review, onEdit, onDelete, onReport }: any) => {
  const { user, isAdmin } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [likes, setLikes] = useState(review.likes || 0);
  const [dislikes, setDislikes] = useState(review.dislikes || 0);
  const [userVote, setUserVote] = useState(review.userVote || null);

  // Reply state
  const [replies, setReplies] = useState(review.ReviewReplies || []);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editReplyText, setEditReplyText] = useState('');

  const isOwner = user?.id === review.userId;
  const canEdit = isOwner && !review.isReported;
  const canDelete = isOwner || isAdmin;
  const canReport = user && !isOwner && !review.isReported;

  const formatDate = (dateString: string) => {
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
        setLikes(res.data.likes);
        setDislikes(res.data.dislikes);
        setUserVote(res.data.userVote);
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

  const handleVote = async (voteType: string) => {
    if (!user) return toast.error('Please login to vote');

    const numericVote = voteType === 'like' ? 1 : -1;

    try {
      const response = await axios.post(`/api/reviews/${review.id}/vote`, {
        vote: numericVote
      });

      setLikes(response.data.likes);
      setDislikes(response.data.dislikes);
      setUserVote(response.data.userVote);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to vote');
    }
  };

  // Reply handlers
  const handleAddReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    try {
      const response = await axios.post(`/api/reviews/${review.id}/replies`, {
        message: replyText.trim()
      });
      setReplies([...replies, response.data.reply]);
      setReplyText('');
      setShowReplyForm(false);
      toast.success('Reply added successfully');
    } catch (error) {
      toast.error('Failed to add reply');
    }
  };

  const handleUpdateReply = async (replyId: number) => {
    if (!editReplyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    try {
      const response = await axios.put(`/api/reviews/${review.id}/replies/${replyId}`, {
        message: editReplyText.trim()
      });
      setReplies(replies.map((r: any) => r.id === replyId ? response.data.reply : r));
      setEditingReplyId(null);
      setEditReplyText('');
      toast.success('Reply updated successfully');
    } catch (error) {
      toast.error('Failed to update reply');
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      try {
        await axios.delete(`/api/reviews/${review.id}/replies/${replyId}`);
        setReplies(replies.filter((r: any) => r.id !== replyId));
        toast.success('Reply deleted successfully');
      } catch (error) {
        toast.error('Failed to delete reply');
      }
    }
  };

  const startEditReply = (reply: any) => {
    setEditingReplyId(reply.id);
    setEditReplyText(reply.message);
  };

  const cancelEditReply = () => {
    setEditingReplyId(null);
    setEditReplyText('');
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

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {review.comment}
      </p>

      {/* Like/Dislike Buttons */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={() => handleVote('like')}
          className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
            userVote === 'like'
              ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
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
          <ThumbsDown className="h-4 w-4" />
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

      {/* Admin Replies */}
      {replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {replies.map((reply: any) => (
            <div key={reply.id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                    {reply.admin?.name || 'Admin'}
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {formatDate(reply.createdAt)}
                  </span>
                </div>
                {isAdmin && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => startEditReply(reply)}
                      className="p-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      title="Edit reply"
                    >
                      <Edit2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteReply(reply.id)}
                      className="p-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      title="Delete reply"
                    >
                      <Trash2 className="h-3 w-3 text-red-500 dark:text-red-400" />
                    </button>
                  </div>
                )}
              </div>
              
              {editingReplyId === reply.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editReplyText}
                    onChange={(e) => setEditReplyText(e.target.value)}
                    className="w-full p-2 text-sm border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={cancelEditReply}
                      className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateReply(reply.id)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
              ) : (
                <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                  {reply.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin Reply Button */}
      {isAdmin && !showReplyForm && (
        <div className="mt-4">
          <button
            onClick={() => setShowReplyForm(true)}
            className="inline-flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{replies.length > 0 ? 'Add another reply' : 'Reply to this review'}</span>
          </button>
        </div>
      )}

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Admin Reply</span>
          </div>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply to this review..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex justify-end space-x-3 mt-3">
            <button
              onClick={() => {
                setShowReplyForm(false);
                setReplyText('');
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddReply}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>Send Reply</span>
            </button>
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
      )}
    </div>
  );
};

export default ReviewCard;
"""

filepath = r'c:/Users/DBU/company/review/client/src/components/ReviewCard.tsx'
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'File written successfully to {filepath}')
