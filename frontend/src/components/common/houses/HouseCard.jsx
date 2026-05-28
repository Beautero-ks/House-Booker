import { Link } from 'react-router-dom';
import { MapPin, Star, BedDouble, Bath, Wifi, Car, Tv, Coffee, Droplet, Snowflake, ImageOff } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';
import { formatPrice } from '../../../utils/formatters';
import { useLanguage } from '../../../hooks/useLanguage';

const amenityIcons = {
  wifi: <Wifi size={16} />,
  parking: <Car size={16} />,
  kitchen: <Coffee size={16} />,
  tv: <Tv size={16} />,
  pool: <Droplet size={16} />,
  ac: <Snowflake size={16} />
};

const HouseCard = ({ house }) => {
  const { t } = useLanguage();
  const amenities = Array.isArray(house.amenities) ? house.amenities : [];
  const images = house.images?.length ? house.images : [];
  const coverImage = images[0];
  const isRoomType = String(house.type || '').toLowerCase() === 'chambre';
  const showRooms = !isRoomType && Number(house.rooms) > 0;
  const showBathrooms = Number(house.bathrooms) > 0;
  const showKitchens = Number(house.kitchens) > 0;
  const showToilets = Number(house.toilets) > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full group">
      <div className="relative aspect-[4/3] overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={house.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-400">
            <ImageOff size={28} />
            <span className="mt-2 text-xs">Aucune photo</span>
          </div>
        )}
        {(house.rating != null || house.reviewsCount != null) && (
          <div className="absolute top-2 right-2 bg-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span>
              {house.rating != null ? house.rating : ''}
              {house.reviewsCount != null && (
                <span className="text-gray-500 font-normal">({house.reviewsCount})</span>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1.5 gap-2">
          <h3 className="font-semibold text-sm text-gray-900 leading-tight line-clamp-2">{house.title}</h3>
        </div>

        <div className="flex items-center text-gray-500 text-xs mb-2 gap-1">
          <MapPin size={12} />
          <span className="truncate">{house.location}</span>
        </div>

        {(showRooms || showBathrooms || showKitchens || showToilets) && (
          <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-600 mb-3">
            {showRooms && (
              <div className="flex items-center gap-1">
                <BedDouble size={13} />
                <span>{house.rooms} {t('common_rooms')}</span>
              </div>
            )}
            {showBathrooms && (
              <div className="flex items-center gap-1">
                <Bath size={13} />
                <span>{house.bathrooms} {t('common_bathrooms')}</span>
              </div>
            )}
            {showKitchens && (
              <div className="flex items-center gap-1">
                <Coffee size={13} />
                <span>{house.kitchens} {t('common_kitchens')}</span>
              </div>
            )}
            {showToilets && (
              <div className="flex items-center gap-1">
                <Bath size={13} />
                <span>{house.toilets} {t('common_toilets')}</span>
              </div>
            )}
          </div>
        )}

        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {amenities.slice(0, 2).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-gray-50 text-gray-600 text-[11px] px-1.5 py-1 rounded-md border border-gray-100">
                {amenityIcons[amenity]}
                <span className="capitalize">{t(`common_${amenity}`)}</span>
              </div>
            ))}
            {amenities.length > 2 && (
              <div className="text-xs text-gray-500 self-center">+{amenities.length - 2}</div>
            )}
          </div>
        )}

        <div className="mt-auto pt-3 border-t flex justify-between items-center gap-2">
          <div>
            <span className="font-bold text-sm text-gray-900">{formatPrice(house.price)}</span>
            <span className="block text-[11px] text-gray-500">{t('search_per_night')}</span>
          </div>
          <Link
            to={ROUTES.HOUSE_DETAIL_LINK(house.id)}
            className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm hover:shadow-md"
          >
            Détails
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HouseCard;
