import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { ROUTES } from '../../constants/routes';
import { Home, Mail, Phone, MapPin } from 'lucide-react';

const SOCIAL_LINKS = [
  { label: 'Facebook', shortLabel: 'F', href: '#' },
  { label: 'X', shortLabel: 'X', href: '#' },
  { label: 'Instagram', shortLabel: 'I', href: '#' },
];

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Home className="text-primary" size={28} />
              <span className="text-xl font-bold tracking-tight">HouseBooker</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {t('footer_about_desc')}
            </p>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="w-8 h-8 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center text-sm font-semibold"
                >
                  {link.shortLabel}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer_links')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to={ROUTES.HOME} className="hover:text-primary transition-colors">{t('nav_home')}</Link></li>
              <li><Link to={ROUTES.SEARCH} className="hover:text-primary transition-colors">{t('nav_listings')}</Link></li>
              <li><Link to={ROUTES.ABOUT} className="hover:text-primary transition-colors">{t('footer_about')}</Link></li>
              <li><Link to={ROUTES.CONTACT} className="hover:text-primary transition-colors">{t('nav_contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('nav_contact')}</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span>Dschang, Cameroun</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-primary" />
                <span>+237 680 312 241</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-primary" />
                <span>contact@housebooker.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer_legal')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to={ROUTES.TERMS} className="hover:text-primary transition-colors">{t('footer_terms')}</Link></li>
              <li><Link to={ROUTES.PRIVACY} className="hover:text-primary transition-colors">{t('footer_privacy')}</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} HouseBooker. {t('footer_rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
