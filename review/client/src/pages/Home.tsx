import {
  useEffect,
  useState,
} from 'react';

import { Link } from 'react-router-dom';
import SearchFilterBar from '../components/SearchFilterBar';
import CompanyCard from '../components/CompanyCard';
import { Building2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Home = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ type: '', rating: '' });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [companies, searchTerm, filters]);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/companies');
      // Backend returns { companies: [...], total: number }
      const companiesData = response.data.companies || [];
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching companies:', error);
      // Set empty array to prevent "not iterable" error
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Ensure companies is always an array
    let filtered = Array.isArray(companies) ? [...companies] : [];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(company =>
        company.typeId === parseInt(filters.type)
      );
    }

    // Rating filter
    if (filters.rating) {
      const minRating = parseInt(filters.rating);
      filtered = filtered.filter(company => {
        const reviews = company.Reviews || company.reviews || [];
        if (!reviews || reviews.length === 0) return false;
        const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        return avgRating >= minRating;
      });
    }

    setFilteredCompanies(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:text-white mb-4">
            Company Reviews
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Discover what employees really think about their companies. Read authentic reviews and make informed career decisions.
          </p>
        </div>

        {/* Search and Filters */}
        <SearchFilterBar
          onSearch={handleSearch}
          onFilter={handleFilter}
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No companies found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filters.type || filters.rating
                ? 'Try adjusting your search or filters'
                : 'No companies have been added yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;