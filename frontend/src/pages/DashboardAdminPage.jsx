import { useLanguage } from '../hooks/useLanguage';
import { MOCK_STATS_ADMIN } from '../constants/mockData';
import { formatPrice } from '../utils/formatters';
import { Users, Home, Calendar, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import StatCard from '../components/common/StatCard';

const STAT_COLORS = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
};

const DashboardAdminPage = () => {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[calc(100vh-140px)] bg-gray-50">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-gray-900 text-white hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold">HouseBooker Admin</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary rounded-lg text-sm font-medium">
            <Activity size={18} /> {t('admin_dashboard_nav')}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800">
            <Users size={18} /> {t('admin_users')}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800">
            <Home size={18} /> {t('admin_listings')}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800">
            <Calendar size={18} /> {t('admin_bookings')}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800">
            <DollarSign size={18} /> {t('admin_payments')}
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800">
            <div className="flex items-center gap-3"><AlertTriangle size={18} /> {t('admin_reports')}</div>
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">5</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin_title')}</h1>
          <p className="text-gray-500">{t('admin_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title={t('admin_users')} value={MOCK_STATS_ADMIN.totalUsers} icon={<Users size={24} />} colorClass={STAT_COLORS.blue} />
          <StatCard title={t('admin_listings')} value={MOCK_STATS_ADMIN.totalListings} icon={<Home size={24} />} colorClass={STAT_COLORS.purple} />
          <StatCard title={t('admin_bookings')} value={MOCK_STATS_ADMIN.totalBookings} icon={<Calendar size={24} />} colorClass={STAT_COLORS.orange} />
          <StatCard title={t('admin_revenue')} value={formatPrice(MOCK_STATS_ADMIN.totalRevenue)} icon={<DollarSign size={24} />} colorClass={STAT_COLORS.green} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6">{t('admin_bookings_last_days')}</h3>
            <div className="h-64 flex items-end justify-between gap-4">
              {MOCK_STATS_ADMIN.chartData.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 group">
                  <div className="w-full bg-blue-100 rounded-t-md relative group-hover:bg-primary transition-colors" style={{ height: `${(d.bookings / 60) * 100}%` }}>
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">{d.bookings}</div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6">{t('admin_top_listings')}</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                    <img src={`https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100&q=80`} alt="House" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm line-clamp-1">{t('admin_sample_listing')}</h4>
                    <p className="text-xs text-gray-500">{t('admin_booking_count', { count: 128 - i * 15 })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardAdminPage;
