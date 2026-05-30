const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-6 text-center sm:p-12">
      {icon}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && <p className="max-w-prose text-sm text-gray-500 sm:text-base">{description}</p>}
      {action}
    </div>
  );
};

export default EmptyState;
