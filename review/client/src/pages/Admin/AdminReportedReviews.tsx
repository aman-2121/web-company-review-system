import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Eye,
  Trash2,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import AverageRating from '../../components/AverageRating';

const AdminReportedReviews = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/reviews/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reportId, reviewId) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/reviews/reports/${reportId}`);
        toast.success('Review deleted and report resolved');
        fetchReports();
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  const handleDismissReport = async (reportId) => {
    if (window.confirm('Are you sure you want to dismiss this report? The review will remain visible.')) {
      try {
        await axios.delete(`/api/reviews/reports/${reportId}/dismiss`);
        toast.success('Report dismissed');
        fetchReports();
      } catch (error) {
        toast.error('Failed to dismiss report');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading reported reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Reported Reviews
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Review and moderate reported content
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Total Reports: {reports.length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {reports.filter(r => !r.resolved).length} pending review
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {reports.length > 0 ? (
          <div className="space-y-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  {/* Report Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Report #{report.id}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Reported by {report.user?.name || 'Anonymous'} on {formatDate(report.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                        Pending Review
                      </span>
                    </div>
                  </div>

                  {/* Report Reason */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Report Reason:
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-800 dark:text-gray-200">
                        {report.reason}
                      </p>
                    </div>
                  </div>

                  {/* Reported Review */}
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {report.review?.user?.name || 'Anonymous User'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(report.review?.createdAt)}
                          </p>
                        </div>
                      </div>
                      <AverageRating rating={report.review?.rating || 0} size="sm" />
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {report.review?.comment}
                    </p>

                    {report.review?.company && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Review for: 
                        <Link 
                          to={`/companies/${report.review.company.id}`}
                          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 ml-1"
                        >
                          {report.review.company.name}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleDeleteReview(report.id, report.reviewId)}
                      className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Review
                    </button>
                    
                    <button
                      onClick={() => handleDismissReport(report.id)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Dismiss Report
                    </button>

                    {report.review?.company && (
                      <Link
                        to={`/companies/${report.review.company.id}`}
                        className="inline-flex items-center px-4 py-2 text-blue-500 border border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Company
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No reports found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              All reviews are clean! No reports need your attention.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportedReviews;