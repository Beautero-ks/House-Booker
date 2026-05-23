import { useLanguage } from '../hooks/useLanguage';
import { ROUTES } from '../constants/routes';
import { Search, ShieldCheck, CreditCard, CalendarCheck, FileText } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const features = [
    {
      icon: <ShieldCheck size={32} className="text-primary mb-4" />,
      title: t('home_feature_verified'),
      desc: t('home_feature_verified_desc')
    },
    {
      icon: <CreditCard size={32} className="text-primary mb-4" />,
      title: t('home_feature_payment'),
      desc: t('home_feature_payment_desc')
    },
    {
      icon: <CalendarCheck size={32} className="text-primary mb-4" />,
      title: t('home_feature_booking'),
      desc: t('home_feature_booking_desc')
    },
    {
      icon: <FileText size={32} className="text-primary mb-4" />,
      title: t('home_feature_contract'),
      desc: t('home_feature_contract_desc')
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Hero background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900 bg-opacity-60"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight max-w-4xl mx-auto animate-fade-in">
            {t('home_hero_title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            {t('home_hero_subtitle')}
          </p>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-full shadow-lg flex items-center max-w-2xl mx-auto">
            <div className="flex-grow flex items-center pl-4">
              <Search className="text-gray-400 mr-2" size={20} />
              <input 
                type="text" 
                placeholder={t('home_search_placeholder')}
                className="w-full py-3 focus:outline-none text-gray-700 bg-transparent"
              />
            </div>
            <Button size="lg" className="rounded-full px-8" onClick={() => navigate(ROUTES.SEARCH)}>
              {t('home_search_btn')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow text-center flex flex-col items-center">
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
