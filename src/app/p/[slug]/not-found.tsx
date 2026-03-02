export default function PublicProductNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Product not found
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          The product page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
}
