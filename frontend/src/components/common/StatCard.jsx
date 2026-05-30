const StatCard = ({ title, value, icon, colorClass = 'bg-blue-50 text-primary' }) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="min-w-0">
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="break-words text-xl font-bold text-gray-900 sm:text-2xl">{value}</h3>
      </div>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${colorClass}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
