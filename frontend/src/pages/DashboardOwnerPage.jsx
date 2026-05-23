import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { MOCK_STATS_OWNER, MOCK_BOOKINGS } from '../constants/mockData';
import { formatPrice } from '../utils/formatters';
import { Home, Calendar, Users, DollarSign, Settings, MessageSquare, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import Button from '../components/ui/Button';
import StatCard from '../components/common/StatCard';

const DashboardOwnerPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview'); // overview, bookings, listings

  return (
    <div className="flex min-h-[calc(100vh-140px)] bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">{t('dashboard_owner_role')}</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Home size={18} /> {t('dashboard_owner_overview')}
          </button>
          <button onClick={() => setActiveTab('listings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'listings' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Home size={18} /> {t('dashboard_owner_listings')}
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bookings' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Calendar size={18} /> {t('dashboard_bookings')}
          </button>
          <Link to={ROUTES.MESSAGES} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
            <MessageSquare size={18} /> {t('msg_title')} <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">2</span>
          </Link>
          <Link to={ROUTES.REVIEWS} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
            <Star size={18} /> {t('review_title')}
          </Link>
        </nav>
        <div className="p-4 border-t">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
            <Settings size={18} /> {t('dashboard_owner_settings')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('dashboard_title')}</h1>
            <p className="text-gray-500">{t('dashboard_subtitle')}</p>
          </div>
          <Button>{t('dashboard_add_listing')}</Button>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title={t('dashboard_listings')} value={MOCK_STATS_OWNER.totalListings} icon={<Home size={24} />} />
              <StatCard title={t('dashboard_bookings')} value={MOCK_STATS_OWNER.monthlyBookings} icon={<Calendar size={24} />} colorClass="bg-green-50 text-green-600" />
              <StatCard title={t('dashboard_occupancy')} value={`${MOCK_STATS_OWNER.occupancyRate}%`} icon={<Users size={24} />} colorClass="bg-green-50 text-green-600" />
              <StatCard title={t('dashboard_revenue')} value={formatPrice(MOCK_STATS_OWNER.monthlyRevenue)} icon={<DollarSign size={24} />} colorClass="bg-green-50 text-green-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-6">{t('dashboard_chart_title')}</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                  {MOCK_STATS_OWNER.chartData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 group">
                      <div className="w-full bg-blue-100 rounded-t-sm relative group-hover:bg-primary transition-colors" style={{ height: `${(d.bookings / 10) * 100}%` }}>
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">{d.bookings}</div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2 rotate-45 md:rotate-0">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">{t('dashboard_recent')}</h3>
                  <a href="#" className="text-sm text-primary hover:underline">{t('dashboard_view_all')}</a>
                </div>
                <div className="space-y-4">
                  {MOCK_BOOKINGS.map(booking => (
                    <div key={booking.id} className="flex flex-col p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-sm line-clamp-1">{booking.houseTitle}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {booking.status === 'CONFIRMED' ? t('dashboard_confirmed') : t('dashboard_pending')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 mb-1">{booking.guestName}</span>
                      <span className="text-xs text-gray-400">{booking.startDate} - {booking.endDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== 'overview' && (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center flex items-center justify-center h-[400px]">
             <h3 className="text-xl text-gray-400">{t('dashboard_tab_placeholder', { tab: activeTab })}</h3>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardOwnerPage;
