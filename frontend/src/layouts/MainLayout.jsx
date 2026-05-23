import { Outlet } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-main)]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
