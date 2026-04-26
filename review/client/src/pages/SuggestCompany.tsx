import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Upload } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface CompanyType {
  id: number;
  name: string;
}

const SuggestCompany = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    typeId: '',
    phoneNumber: '',
    email: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [types, setTypes] = useState<CompanyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(true);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await axios.get('/api/types');
      setTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching types:', error);
      toast.error('Failed to load company types');
    } finally {
      setTypesLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('address', formData.address);
      data.append('typeId', formData.typeId);
      data.append('description', formData.description);
      if (formData.phoneNumber) data.append('phoneNumber', formData.phoneNumber);
      if (formData.email) data.append('email', formData.email);
      if (image) data.append('image', image);

      const response = await axios.post('/api/companies', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(response.data?.message || 'Company submitted for admin approval!');
      setFormData({
        name: '',
        description: '',
        address: '',
        typeId: '',
        phoneNumber: '',
        email: ''
      });
      setImage(null);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to submit suggestion. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Suggest a Company
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Know a company that should be on our platform? Let us know!
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
              Your suggestion will be reviewed by an admin before appearing on the site.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter company address"
              />
            </div>

            <div>
              <label htmlFor="typeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="typeId"
                name="typeId"
                required
                value={formData.typeId}
                onChange={handleChange}
                disabled={typesLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">{typesLoading ? 'Loading categories...' : 'Select a category'}</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Tell us about this company..."
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., +1 (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="company@example.com"
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Image
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {image && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {image.name}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit Suggestion
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuggestCompany;

