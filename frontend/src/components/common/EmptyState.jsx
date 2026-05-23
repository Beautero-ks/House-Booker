const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="bg-white p-12 rounded-xl border border-gray-100 text-center flex flex-col items-center justify-center">
      {icon}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-gray-500">{description}</p>}
      {action}
    </div>
  );
};

export default EmptyState;
