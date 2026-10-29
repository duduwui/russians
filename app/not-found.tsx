import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#ebf0f4] p-4 text-center">
      <h2 className="text-4xl font-black text-slate-800 mb-2">404</h2>
      <p className="text-sm text-slate-600 mb-4">Page Not Found / پەڕەکە نەدۆزرایەوە</p>
      <Link
        href="/"
        className="px-4 py-2 bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold rounded"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
