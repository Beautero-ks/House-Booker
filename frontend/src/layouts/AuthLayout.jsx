import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <section className="min-h-[calc(100vh-18rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Outlet />
    </section>
  );
};

export default AuthLayout;
