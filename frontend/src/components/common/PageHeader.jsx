export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">{title}</h1>
        {description ? <p className="text-sm text-slate-400">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
