const StatCard = ({ title, value, icon, colorClass = 'bg-blue-50 text-primary' }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
