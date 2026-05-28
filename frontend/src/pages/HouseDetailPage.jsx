import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { ROUTES } from '../constants/routes';
import { MapPin, Star, Share2, Heart, Users, BedDouble, Bath, Wifi, Car, Coffee, Tv, Droplet, Snowflake, ArrowLeft, ImageOff } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/common/EmptyState';
import { getHouseById } from '../services/houseApi';

const amenityIcons = {
  wifi: <Wifi size={20} />,
  parking: <Car size={20} />,
  kitchen: <Coffee size={20} />,
  tv: <Tv size={20} />,
  pool: <Droplet size={20} />,
  ac: <Snowflake size={20} />
};

const HouseDetailPage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guests, setGuests] = useState(1);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadHouse = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getHouseById(id);
        if (mounted) {
          setHouse(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setHouse(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadHouse();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleBook = () => {
    navigate(ROUTES.BOOKING_LINK(house.id), { state: { guests, checkIn, checkOut } });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Loader />
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="container mx-auto px-4 py-20">
        <EmptyState
          icon={<MapPin size={48} className="text-gray-300 mb-4" />}
          title="Logement introuvable"
          description={error?.message || 'Le backend n’a retourné aucun logement pour cet identifiant.'}
          action={
            <Button variant="outline" onClick={() => navigate(ROUTES.SEARCH)}>
              {t('detail_back_to_search')}
            </Button>
          }
        />
      </div>
    );
  }

  const images = house.images || [];
  const amenities = house.amenities || [];
  const isRoomType = String(house.type || '').toLowerCase() === 'chambre';
  const hasRooms = !isRoomType && Number(house.rooms) > 0;
  const hasBathrooms = Number(house.bathrooms) > 0;
  const hasKitchens = Number(house.kitchens) > 0;
  const hasToilets = Number(house.toilets) > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link to={ROUTES.SEARCH} className="inline-flex items-center text-gray-600 hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> {t('detail_back_to_search')}
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{house.title}</h1>
          <div className="flex items-center text-sm text-gray-600 gap-4">
            <span className="flex items-center gap-1">
              <Star size={16} className="text-yellow-400 fill-current" />
              <span className="font-semibold text-gray-900">{house.rating}</span>
              <span className="underline">({house.reviewsCount} {t('detail_reviews')})</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={16} /> {house.location}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors font-medium text-gray-700">
            <Share2 size={18} /> {t('detail_share')}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors font-medium text-gray-700">
            <Heart size={18} /> {t('detail_save')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[400px] mb-10 rounded-lg overflow-hidden relative group">
        {images.length > 0 ? (
          <>
            <div className="col-span-2 row-span-2 h-full cursor-pointer overflow-hidden">
              <img src={images[0]} alt={house.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            {images.slice(1).map((img, idx) => (
              <div key={idx} className="col-span-1 row-span-1 h-full cursor-pointer overflow-hidden">
                <img src={img} alt={`${house.title} ${idx + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
            {images.length < 4 && Array.from({ length: 4 - images.length }).map((_, idx) => (
              <div key={`empty-${idx}`} className="col-span-1 row-span-1 h-full bg-gray-100" />
            ))}
          </>
        ) : (
          <div className="col-span-4 row-span-2 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            <ImageOff size={48} />
            <span className="mt-3 text-sm font-medium">Aucune photo pour ce logement</span>
          </div>
        )}
        {images.length > 0 && (
          <button className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-gray-50 flex items-center gap-2">
            {t('detail_view_photos')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-6 pb-6 border-b text-gray-700">
            {hasRooms && (
              <div className="flex items-center gap-2"><BedDouble size={20} /> {house.rooms} {t('common_rooms')}</div>
            )}
            {hasBathrooms && (
              <div className="flex items-center gap-2"><Bath size={20} /> {house.bathrooms} {t('common_bathrooms')}</div>
            )}
            {hasKitchens && (
              <div className="flex items-center gap-2"><Coffee size={20} /> {house.kitchens} {t('common_kitchens')}</div>
            )}
            {hasToilets && (
              <div className="flex items-center gap-2"><Bath size={20} /> {house.toilets} {t('common_toilets')}</div>
            )}
            {hasRooms && (
              <div className="flex items-center gap-2"><Users size={20} /> {t('detail_max_guests')} {house.rooms * 2} {t('detail_guests_plural')}</div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">{t('detail_description')}</h2>
            <p className="text-gray-600 leading-relaxed">{house.description}</p>
          </div>

          <div className="pb-8 border-b">
            <h2 className="text-xl font-semibold mb-4">{t('detail_amenities')}</h2>
            <div className="grid grid-cols-2 gap-y-4">
              {amenities.length > 0 ? amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-3 text-gray-700">
                  {amenityIcons[amenity]}
                  <span className="capitalize">{t(`common_${amenity}`)}</span>
                </div>
              )) : (
                <p className="text-gray-500">Aucun équipement renseigné par le backend.</p>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Star className="text-yellow-400 fill-current" /> {house.rating || 0} ({house.reviewsCount || 0} {t('detail_reviews')})
            </h2>
            <p className="text-gray-500">Le service d’avis backend n’expose pas encore de données consommables par le frontend.</p>
          </div>
        </div>

        {/* Booking Widget */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-2xl font-bold text-gray-900">{formatPrice(house.price)}</span>
              <span className="text-gray-500">{t('detail_per_night')}</span>
            </div>

            <div className="border rounded-xl mb-6 overflow-hidden">
              <div className="flex border-b">
                <div className="w-1/2 p-3 border-r">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('detail_checkin')}</label>
                  <input 
                    type="date" 
                    className="w-full text-sm focus:outline-none" 
                    value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                  />
                </div>
                <div className="w-1/2 p-3">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('detail_checkout')}</label>
                  <input 
                    type="date" 
                    className="w-full text-sm focus:outline-none"
                    value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-3">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('detail_guests')}</label>
                <select 
                  className="w-full text-sm focus:outline-none bg-transparent"
                  value={guests}
                  onChange={e => setGuests(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num > 1 ? t('detail_guest_plural') : t('detail_guest_singular')}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button fullWidth size="lg" onClick={handleBook}>
              {t('detail_book_now')}
            </Button>
            
            <p className="text-center text-sm text-gray-500 mt-4">{t('detail_no_charge_notice')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseDetailPage;
