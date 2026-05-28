import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useLocation } from 'react-router-dom';
import HouseCard from '../components/common/houses/HouseCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import EmptyState from '../components/common/EmptyState';
import { useHouseSearch } from '../hooks/useHouseSearch';
import { Search, Filter } from 'lucide-react';
import Loader from '../components/ui/Loader';

const SearchPage = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { error, filters, filteredHouses, loading, refetch, resetFilters, searchTerm, setSearchTerm, updateFilter } = useHouseSearch();
  const [showFilters, setShowFilters] = useState(false);
  const successMessage = location.state?.message;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 mt-2 lg:mt-3">
      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl">
        {successMessage && (
          <div className="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        )}

        <div className="mb-6 mx-auto w-full max-w-3xl">
          <div className="rounded-xl border border-gray-200 bg-white/95 p-2 shadow-md shadow-gray-200/60">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="w-full flex-1">
                <div className="rounded-lg overflow-hidden">
                  <Input
                    placeholder={t('search_location_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={Search}
                    className="w-full"
                    inputClassName="border-0 bg-gray-50 text-sm py-2.5 shadow-none focus:ring-1"
                  />
                </div>
              </div>

              <div className="flex w-full sm:w-auto items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters((s) => !s)}
                  className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 border border-gray-200 bg-white px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:border-primary hover:text-primary hover:shadow-md transition"
                >
                  <Filter size={16} />
                  <span className="text-sm">{t('search_filters')}</span>
                </button>

                <div className="hidden sm:flex items-center rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                  <span className="font-medium text-gray-700 mr-2">{filteredHouses.length}</span>
                  <span>{t('search_results')}</span>
                </div>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-md shadow-gray-200/50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('search_type')}</label>
                  <select
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    value={filters.type}
                    onChange={(e) => updateFilter('type', e.target.value)}
                  >
                    <option value="all">{t('search_type_all')}</option>
                    <option value="maison">{t('search_type_house')}</option>
                    <option value="chambre">{t('search_type_room')}</option>
                    <option value="studio">{t('search_type_studio')}</option>
                    <option value="appartement">{t('search_type_apartment')}</option>
                    <option value="villa">{t('search_type_villa')}</option>
                  </select>
                </div>

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

                <div className="flex items-end">
                  <Button fullWidth onClick={() => setShowFilters(false)}>
                    {t('search_apply')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20">
            <Loader />
          </div>
        ) : error ? (
          <EmptyState
            icon={<Filter size={48} className="text-gray-300 mb-4" />}
            title="Backend logement indisponible"
            description={error.message}
            action={
              <Button variant="outline" className="mt-6" onClick={refetch}>
                Réessayer
              </Button>
            }
          />
        ) : filteredHouses.length > 0 ? (
          <div className="mx-auto mt-6 grid w-full grid-cols-[repeat(auto-fit,minmax(220px,240px))] justify-center gap-5 items-stretch">
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
      
