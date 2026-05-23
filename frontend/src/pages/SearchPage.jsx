import { useLanguage } from '../hooks/useLanguage';
import HouseCard from '../components/common/houses/HouseCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import EmptyState from '../components/common/EmptyState';
import { useHouseSearch } from '../hooks/useHouseSearch';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const SearchPage = () => {
  const { t } = useLanguage();
  const { filters, filteredHouses, resetFilters, searchTerm, setSearchTerm, updateFilter } = useHouseSearch();

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-1/4 md:sticky md:top-24 h-max bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6 border-b pb-4">
          <SlidersHorizontal size={20} className="text-primary" />
          <h2 className="text-lg font-semibold">{t('search_filters')}</h2>
        </div>

        <div className="space-y-6">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('search_location')}</label>
            <Input 
              placeholder={t('search_location_placeholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('search_type')}</label>
            <select 
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={filters.type}
              onChange={(e) => updateFilter('type', e.target.value)}
            >
              <option value="all">{t('search_type_all')}</option>
              <option value="room">{t('search_type_room')}</option>
              <option value="studio">{t('search_type_studio')}</option>
              <option value="apartment">{t('search_type_apartment')}</option>
              <option value="villa">{t('search_type_villa')}</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('search_price')}</label>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                placeholder="Min" 
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
              />
              <span className="text-gray-400">-</span>
              <Input 
                type="number" 
                placeholder="Max" 
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
              />
            </div>
          </div>

          {/* Rooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('search_min_rooms')}</label>
            <Input 
              type="number" 
              placeholder={t('search_rooms_placeholder')} 
              min="1"
              value={filters.rooms}
              onChange={(e) => updateFilter('rooms', e.target.value)}
            />
          </div>

          <Button fullWidth className="mt-4" onClick={() => {}}>
            {t('search_apply')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="w-full md:w-3/4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {filteredHouses.length} {t('search_results')}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{t('search_sort')}:</span>
            <select className="text-sm border-none bg-transparent font-medium focus:outline-none cursor-pointer">
              <option>{t('search_sort_relevance')}</option>
              <option>{t('search_sort_price_asc')}</option>
              <option>{t('search_sort_price_desc')}</option>
              <option>{t('search_sort_rating')}</option>
            </select>
          </div>
        </div>

        {filteredHouses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouses.map((house) => (
              <HouseCard key={house.id} house={house} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Filter size={48} className="text-gray-300 mb-4" />}
            title={t('search_empty_title')}
            description={t('search_empty_description')}
            action={
              <Button variant="outline" className="mt-6" onClick={resetFilters}>
                {t('search_reset')}
              </Button>
            }
          />
        )}
      </main>
    </div>
  );
};

export default SearchPage;
