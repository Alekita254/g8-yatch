
export default function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-32 px-4">
      <div className="w-24 h-24 rounded-[2rem] bg-app-elevated border border-app-border flex items-center justify-center mb-8 shadow-inner">
        <Icon className="w-10 h-10 text-app-muted" />
      </div>
      <h2 className="text-3xl font-black text-app-text mb-3 tracking-tight">{title}</h2>
      <p className="text-app-muted font-medium max-w-md mx-auto">{description}</p>
      <button className="mt-8 px-8 py-3 rounded-xl bg-app-card border border-app-border hover:border-brand-500 text-app-text font-bold transition-all">
        Notify me when ready
      </button>
    </div>
  );
}
