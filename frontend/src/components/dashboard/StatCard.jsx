const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  color = "indigo",
}) => {
  const styles = {
    indigo: {
      icon: "bg-indigo-50 text-indigo-600 ring-indigo-100",
      line: "from-indigo-500 to-violet-500",
    },

    emerald: {
      icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
      line: "from-emerald-500 to-teal-500",
    },

    amber: {
      icon: "bg-amber-50 text-amber-600 ring-amber-100",
      line: "from-amber-500 to-orange-500",
    },

    violet: {
      icon: "bg-violet-50 text-violet-600 ring-violet-100",
      line: "from-violet-500 to-fuchsia-500",
    },
  };

  const style = styles[color] || styles.indigo;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_-25px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-25px_rgba(15,23,42,0.45)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${style.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r ${style.line} transition-all duration-500 group-hover:w-full`}
      />
    </div>
  );
};

export default StatCard;