import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import {
  Building2,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isDark, toggleDarkMode] = useDarkMode();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newCompany, setNewCompany] = useState({
    name: '',
    description: '',
    address: '',
    phoneNumber: '',
    email: '',
    typeId: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    address: '',
    phoneNumber: '',
    email: '',
    typeId: '',
    imageUrl: '',
  });

  const isAdmin = user && (user.role === 'admin' || user.isAdmin === true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const typesRes = await axios.get('/api/types').catch(() => ({ data: [] }));
      setTypes(typesRes.data || []);
    } catch (error) {
      console.error('Error fetching types:', error);
      toast.error('Failed to load types');
    } 
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  // Validation functions
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Company name is required';
        } else if (value.trim().length < 2) {
          error = 'Company name must be at least 2 characters long';
        } else if (value.trim().length > 100) {
          error = 'Company name must be less than 100 characters';
        }
        break;

      case 'description':
        if (value && value.length > 500) {
          error = 'Description must be less than 500 characters';
        }
        break;

      case 'phoneNumber':
        if (value && !/^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[\d\s\-\(\)]{10,}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          error = 'Please enter a valid phone number';
        }
        break;

      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'typeId':
        if (!value) {
          error = 'Please select a company type';
        }
        break;

      case 'imageUrl':
        if (value instanceof File) {
          const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
          const maxSize = 5 * 1024 * 1024; // 5MB
          
          if (!validTypes.includes(value.type)) {
            error = 'Please upload a valid image (JPEG, PNG, GIF, WebP)';
          } else if (value.size > maxSize) {
            error = 'Image size must be less than 5MB';
          }
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {
      name: validateField('name', newCompany.name),
      description: validateField('description', newCompany.description),
      address: '',
      phoneNumber: validateField('phoneNumber', newCompany.phoneNumber),
      email: validateField('email', newCompany.email),
      typeId: validateField('typeId', newCompany.typeId),
      imageUrl: validateField('imageUrl', newCompany.imageUrl),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleInputChange = (field, value) => {
    setNewCompany(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateField('imageUrl', file);
      if (error) {
        setErrors(prev => ({
          ...prev,
          imageUrl: error
        }));
        e.target.value = ''; // Clear the file input
      } else {
        handleInputChange('imageUrl', file);
      }
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', newCompany.name.trim());
      formData.append('description', newCompany.description?.trim() || '');
      formData.append('address', newCompany.address?.trim() || '');
      formData.append('phoneNumber', newCompany.phoneNumber?.trim() || '');
      formData.append('email', newCompany.email?.trim() || '');
      formData.append('typeId', newCompany.typeId);
      
      if (newCompany.imageUrl instanceof File) {
        formData.append('image', newCompany.imageUrl);
      }

      const response = await fetch('http://localhost:5000/api/companies', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to suggest company');
      }

      toast.success(data.message || 'Company suggestion sent successfully!');
      setShowSuggestModal(false);
      
      // Reset form
      setNewCompany({ 
        name: '', 
        description: '', 
        address: '', 
        phoneNumber: '', 
        email: '', 
        typeId: '', 
        imageUrl: '' 
      });
      setErrors({
        name: '',
        description: '',
        address: '',
        phoneNumber: '',
        email: '',
        typeId: '',
        imageUrl: '',
      });
    } catch (error) {
      console.error('Suggest company error:', error);
      toast.error(error.message || 'Failed to suggest company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewCompany({ 
      name: '', 
      description: '', 
      address: '', 
      phoneNumber: '', 
      email: '', 
      typeId: '', 
      imageUrl: '' 
    });
    setErrors({
      name: '',
      description: '',
      address: '',
      phoneNumber: '',
      email: '',
      typeId: '',
      imageUrl: '',
    });
    setShowSuggestModal(false);
  };

  const UserAvatar = ({ user }) => (
    <div className="w-8 h-8 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
      {user.name.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  CompanyReview
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                Companies
              </Link>

              {!isAdmin && (
                <button
                  onClick={() => setShowSuggestModal(true)}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Suggest Company
                </button>
              )}
              
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {user ? (
                <>
                  {/* Desktop User Menu */}
                  <div className="hidden md:block relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <UserAvatar user={user} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.name}
                      </span>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                          {isAdmin && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>

                        {/* Add Admin */}
                        {isAdmin && (
                          <Link
                            to="/admin/add-admin"
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="h-4 w-4" />
                            <span>Add Admin</span>
                          </Link>
                        )}

                        {/* Change Password */}
                        <Link
                          to="/change-password"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Change Password</span>
                        </Link>

                        {/* Sign out */}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mobile menu button */}
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </button>
                </>
              ) : (
                <>
                  {/* Desktop Auth Buttons */}
                  <div className="hidden md:flex items-center space-x-3">
                    <Link
                      to="/login"
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                    >
                      Register
                    </Link>
                  </div>

                  {/* Mobile menu button */}
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <div className="space-y-2">
                <Link
                  to="/"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Companies
                </Link>

                {!isAdmin && (
                  <button
                    onClick={() => {
                      setShowSuggestModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    Suggest Company
                  </button>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}

                {user ? (
                  <>
                    <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 mt-2 pt-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <UserAvatar user={user} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Add Admin (Mobile) */}
                    {isAdmin && (
                      <Link
                        to="/admin/add-admin"
                        className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center space-x-2"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Add Admin</span>
                      </Link>
                    )}

                    {/* Change Password (Mobile) */}
                    <Link
                      to="/change-password"
                      onClick={() => setShowMobileMenu(false)}
                      className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center space-x-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Change Password</span>
                    </Link>

                    {/* Sign out (Mobile) */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Suggest Company Modal */}
      {showSuggestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Suggest a Company
            </h3>
            <form onSubmit={handleAddCompany} className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter company name"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    ({newCompany.description?.length || 0}/500)
                  </span>
                </label>
                <textarea
                  value={newCompany.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Brief description of the company..."
                  rows={3}
                  maxLength={500}
                />
                {errors.description && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.description}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={newCompany.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company address"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newCompany.phoneNumber || ''}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phoneNumber 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newCompany.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="company@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type *
                </label>
                <select
                  value={newCompany.typeId}
                  onChange={(e) => handleInputChange('typeId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.typeId 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                >
                  <option value="">Select Type</option>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.typeId && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.typeId}</p>
                )}
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
                  onChange={handleFileChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.imageUrl 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.imageUrl ? (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.imageUrl}</p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Optional: Upload a company logo or image (JPEG, PNG, GIF, WebP, max 5MB)
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Suggest Company'}
                </button>
              </div>
            </form>
          </div>
        </div> 
      )}
    </>
  );
};

export default Navbar;