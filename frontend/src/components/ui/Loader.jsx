
const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-primary ${sizes[size]}`}></div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center my-4">{spinner}</div>;
};

export default Loader;
