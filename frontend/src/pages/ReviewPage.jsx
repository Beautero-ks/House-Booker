import { useLanguage } from '../hooks/useLanguage';
import { MOCK_REVIEWS } from '../constants/mockData';
import { Star } from 'lucide-react';
import Button from '../components/ui/Button';

const RatingBar = ({ stars, count, total }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className="w-4 font-medium">{stars}</span>
    <Star size={12} className="text-yellow-400 fill-current" />
    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(count / total) * 100}%` }}></div>
    </div>
    <span className="w-6 text-right text-gray-500">{count}</span>
  </div>
);

const ReviewPage = () => {
  const { t } = useLanguage();
  const houseTitle = "Studio moderne à Dschang";
  const globalRating = 4.5;
  const reviewCount = MOCK_REVIEWS.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('review_title')}</h1>
          <p className="text-gray-500">{houseTitle}</p>
        </div>
        <Button>{t('review_leave')}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Global Rating Summary */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-max">
          <h3 className="font-semibold text-gray-900 mb-4">{t('review_global')}</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-5xl font-bold text-gray-900">{globalRating}</span>
          </div>
          <div className="flex text-yellow-400 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={20} className={s <= Math.floor(globalRating) ? 'fill-current' : 'text-gray-300'} />
            ))}
          </div>
          <p className="text-sm text-gray-500 mb-6">({reviewCount} avis)</p>

          <div className="space-y-2">
            <RatingBar stars="5" count={15} total={23} />
            <RatingBar stars="4" count={6} total={23} />
            <RatingBar stars="3" count={1} total={23} />
            <RatingBar stars="2" count={1} total={23} />
            <RatingBar stars="1" count={0} total={23} />
          </div>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2 space-y-4">
          {MOCK_REVIEWS.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={review.userImage} alt={review.userName} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                    <p className="text-xs text-gray-500">{t('review_stayed')} {review.date}</p>
                  </div>
                </div>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className={s <= review.rating ? 'fill-current' : 'text-gray-300'} />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
