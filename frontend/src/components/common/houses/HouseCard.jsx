import { Link } from 'react-router-dom';
import { MapPin, Star, BedDouble, Bath, Wifi, Car, Tv, Coffee, Droplet, Snowflake } from 'lucide-react';
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={house.images[0]} 
          alt={house.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-semibold shadow-sm flex items-center gap-1">
          <Star size={14} className="text-yellow-400 fill-current" />
          {house.rating} <span className="text-gray-500 font-normal">({house.reviewsCount})</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-semibold text-lg text-gray-900 leading-tight line-clamp-2">{house.title}</h3>
        </div>

        <div className="flex items-center text-gray-500 text-sm mb-3 gap-1">
          <MapPin size={14} />
          <span className="truncate">{house.location}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <BedDouble size={16} />
            <span>{house.rooms} {t('common_rooms')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={16} />
            <span>{house.bathrooms} {t('common_bathrooms')}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {house.amenities.slice(0, 3).map((amenity, idx) => (
            <div key={idx} className="flex items-center gap-1 bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-md border border-gray-100">
              {amenityIcons[amenity]}
              <span className="capitalize">{t(`common_${amenity}`)}</span>
            </div>
          ))}
          {house.amenities.length > 3 && (
            <div className="text-xs text-gray-500 self-center">+{house.amenities.length - 3}</div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t flex justify-between items-center">
          <div>
            <span className="font-bold text-lg text-gray-900">{formatPrice(house.price)}</span>
            <span className="text-sm text-gray-500"> {t('search_per_night')}</span>
          </div>
          <Link 
            to={ROUTES.HOUSE_DETAIL_LINK(house.id)}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Détails
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HouseCard;
