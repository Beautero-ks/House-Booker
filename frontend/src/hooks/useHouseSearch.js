import { useEffect, useMemo, useState } from 'react';
import { getHouses } from '../services/houseApi';

const DEFAULT_FILTERS = {
  type: 'all',
  minPrice: '',
  maxPrice: '',
  rooms: '',
};

export const useHouseSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHouses = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getHouses();
      setHouses(result);
    } catch (err) {
      setError(err);
      setHouses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial backend fetch for the search page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHouses();
  }, []);

  const filteredHouses = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return houses.filter((house) => {
      const houseType = String(house.type || '').toLowerCase();
      const matchesSearch =
        house.location.toLowerCase().includes(normalizedSearch) ||
        house.title.toLowerCase().includes(normalizedSearch);
      const matchesType = filters.type === 'all' || houseType === filters.type;
      const matchesMinPrice = !filters.minPrice || house.price >= Number(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || house.price <= Number(filters.maxPrice);
      const matchesRooms = !filters.rooms || house.rooms >= Number(filters.rooms);

      return matchesSearch && matchesType && matchesMinPrice && matchesMaxPrice && matchesRooms;
    });
  }, [filters, houses, searchTerm]);

  const updateFilter = (name, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters(DEFAULT_FILTERS);
  };

  return {
    filters,
    filteredHouses,
    loading,
    error,
    refetch: loadHouses,
    resetFilters,
    searchTerm,
    setSearchTerm,
    updateFilter,
  };
};
