import { Link } from 'react-router-dom';

export function AuthLayout({ title, subtitle, footerText, footerLinkText, footerLinkTo, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="gradient-frame w-full max-w-md rounded-3xl p-px">
        <div className="rounded-3xl bg-slate-950/95 p-6 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>

          <div className="mt-6 space-y-4">{children}</div>

          <p className="mt-6 text-center text-sm text-slate-400">
            {footerText}{' '}
            <Link to={footerLinkTo} className="font-semibold text-cyan-300 hover:text-cyan-200">
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
