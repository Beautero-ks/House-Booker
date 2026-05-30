import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <section className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <Outlet />
    </section>
  );
};

export default AuthLayout;
