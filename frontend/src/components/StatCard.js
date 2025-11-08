const StatCard = ({ icon: Icon, title, value, subtitle, color = 'emerald', trend }) => {
  const colorClasses = {
    emerald: 'from-emerald-400 to-emerald-600',
    blue: 'from-blue-400 to-blue-600',
    amber: 'from-amber-400 to-amber-600',
    rose: 'from-rose-400 to-rose-600',
    violet: 'from-violet-400 to-violet-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 mb-2">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`text-xs font-medium mt-2 ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.value}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
