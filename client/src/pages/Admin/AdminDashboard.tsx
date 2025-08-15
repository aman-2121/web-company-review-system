import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [companies, setCompanies] = useState<Company[]>([]); 
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('approved');
  const [showAddModal, setShowAddModal] = useState(false);
  const [types, setTypes] = useState([]);
  const [newCompany, setNewCompany] = useState({
    name: '',
    address: '',
    typeId: '',
    imageUrl: ''
  });
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [newType, setNewType] = useState({ name: '' });

  useEffect(() => {
    fetchData();
  }, []);
const fetchData = async () => {
  try {
    const [companiesRes, pendingRes, typesRes] = await Promise.all([
      axios.get('/api/companies').catch(() => ({ data: { companies: [] } })),
      axios.get('/api/companies/pending').catch(() => ({ data: [] })),
      axios.get('/api/types').catch(() => ({ data: [] }))
    ]);

    setCompanies(companiesRes.data?.companies || []);
    setPendingCompanies(Array.isArray(pendingRes.data) ? pendingRes.data : []);
    setTypes(typesRes.data || []);
  } catch (error) {
    console.error('Error fetching data:', error);
    toast.error('Failed to load dashboard data');
  } finally {
    setLoading(false);
  }
};

  const handleApprove = async (companyId) => {
    try {
      await axios.patch(`/api/companies/approve/${companyId}`);
      toast.success('Company approved successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve company');
    }
  };

  const handleDelete = async (companyId, isPending = false) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await axios.delete(`/api/companies/${companyId}`);
        toast.success('Company deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete company');
      }
    }
  };

const handleAddCompany = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();

    // Append form fields
    formData.append('name', newCompany.name);
    formData.append('address', newCompany.address);
    formData.append('typeId', newCompany.typeId);

    // Append image file (if selected)
    if (newCompany.imageUrl instanceof File) {
      formData.append('image', newCompany.imageUrl);
    }

    // Send formData instead of JSON
    const response = await fetch('http://localhost:5000/api/companies', {
      method: 'POST',
      body: formData,
      credentials: 'include', // Required for cookies (auth)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add company');
    }

    toast.success(data.message || 'Company added successfully');
    setShowAddModal(false);

    // Reset form
    setNewCompany({ name: '', address: '', typeId: '', imageUrl: '' });

    // Refresh company list
    fetchData();
  } catch (error) {
    console.error('Add company error:', error);
    toast.error(error.message || 'Failed to add company');
  }
};

  const handleAddType = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/types', newType);
      toast.success('Type added successfully');
      setShowAddTypeModal(false);
      setNewType({ name: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add type');
    }
  };

  const CompanyTable = ({ companies, isPending = false }) => (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Reviews
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
           
    {(companies || []).map((company) => {
      const reviewCount = company?.Reviews?.length || 0;
      const avgRating = reviewCount > 0 
        ? (company.Reviews.reduce((sum, r) => sum + (r?.rating || 0), 0) / reviewCount).toFixed(1)
        : 'N/A';

              return (
                <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {company.imageUrl ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={`http://localhost:5000${company.imageUrl}`} 
                            alt={company.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {company.name}
                        </div>
                        {company.address && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {company.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      {company.type?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {reviewCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {avgRating}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/companies/${company.id}`}
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {isPending && (
                        <button
                          onClick={() => handleApprove(company.id)}
                          className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(company.id, isPending)}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {companies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isPending ? 'No pending companies' : 'No companies found'}
          </p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage companies and moderate content
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Companies
                </p>
              {/* Total Companies */}
{/* Total Companies */}
<p className="text-2xl font-bold text-gray-900 dark:text-white">
  {companies?.length || 0}
</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Approval
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingCompanies.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Reviews
                </p>
{/* Total Reviews */}
<p className="text-2xl font-bold text-gray-900 dark:text-white">
  {companies?.reduce((sum, c) => sum + (c.Reviews?.length || 0), 0) || 0}
</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <Link 
              to="/admin/reports"
              className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 p-2 -m-2 rounded-lg transition-colors"
            >
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Reported Reviews
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  View Reports →
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </button>
          <button
            onClick={() => setShowAddTypeModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Type
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approved'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Approved Companies ({companies.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Pending Approval ({pendingCompanies.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'approved' ? (
          <CompanyTable companies={companies} />
        ) : (
          <CompanyTable companies={pendingCompanies} isPending={true} />
        )}

        {/* Add Company Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add New Company
              </h3>
              <form onSubmit={handleAddCompany} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newCompany.address}
                    onChange={(e) => setNewCompany({...newCompany, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={newCompany.typeId}
                    onChange={(e) => setNewCompany({...newCompany, typeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image
                  </label>
                 

                  <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setNewCompany((prev) => ({ ...prev, imageUrl: file }));
                      }}
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"

                    />
                    </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add Company
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Type Modal */}
        {showAddTypeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add New Type
              </h3>
              <form onSubmit={handleAddType} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type Name
                  </label>
                  <input
                    type="text"
                    value={newType.name}
                    onChange={(e) => setNewType({...newType, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddTypeModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add Type
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;