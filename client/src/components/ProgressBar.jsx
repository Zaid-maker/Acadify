function ProgressBar({ value, label = "Progress" }) {
  const safeValue = Math.max(0, Math.min(100, value));

  const getColor = () => {
    if (safeValue < 30) return "bg-rose-500";
    if (safeValue < 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="font-bold text-slate-950">{safeValue}%</span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`${getColor()} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
