import { useLanguage } from '../../hooks/useLanguage';

const PlaceholderPage = ({ title, titleKey }) => {
  const { t } = useLanguage();
  const pageTitle = titleKey ? t(titleKey) : title;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold text-gray-400">{pageTitle} - {t('common_coming_soon')}</h1>
    </div>
  );
};

export default PlaceholderPage;
