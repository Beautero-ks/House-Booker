import { useMemo, useState } from 'react';
import { MOCK_HOUSES } from '../constants/mockData';

const DEFAULT_FILTERS = {
  type: 'all',
  minPrice: '',
  maxPrice: '',
  rooms: '',
};

export const useHouseSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const filteredHouses = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return MOCK_HOUSES.filter((house) => {
      const matchesSearch =
        house.location.toLowerCase().includes(normalizedSearch) ||
        house.title.toLowerCase().includes(normalizedSearch);
      const matchesType = filters.type === 'all' || house.type === filters.type;
      const matchesMinPrice = !filters.minPrice || house.price >= Number(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || house.price <= Number(filters.maxPrice);
      const matchesRooms = !filters.rooms || house.rooms >= Number(filters.rooms);

      return matchesSearch && matchesType && matchesMinPrice && matchesMaxPrice && matchesRooms;
    });
  }, [filters, searchTerm]);

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
    resetFilters,
    searchTerm,
    setSearchTerm,
    updateFilter,
  };
};
