import Link from "next/link";
import { Globe, Lock, Users, FileText } from "lucide-react";
import { Product } from "@/generated/prisma/client";

type ProductWithRelations = Product & {
  Project?: { id: string; title: string; status: string } | null;
  _count: {
    WaitlistEntry: number;
    ProductChangelog: number;
    AdCampaign: number;
    SocialPost: number;
  };
};

export function ProductCard({ product }: { product: ProductWithRelations }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: product.brandColor }}
          />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {product.name}
          </h3>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
            product.isPublic
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {product.isPublic ? (
            <>
              <Globe className="w-3 h-3" /> Public
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" /> Private
            </>
          )}
        </span>
      </div>

      {product.tagline && (
        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
          {product.tagline}
        </p>
      )}

      {product.Project && (
        <div className="mb-4">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
            {product.Project.title}
          </span>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {product._count.WaitlistEntry} waitlist
        </span>
        <span className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          {product._count.ProductChangelog} changelog
        </span>
      </div>
    </Link>
  );
}
