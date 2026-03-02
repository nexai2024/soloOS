import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProductCard } from "@/components/products/ProductCard";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const products = await prisma.product.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      Project: {
        select: { id: true, title: true, status: true },
      },
      _count: {
        select: {
          WaitlistEntry: true,
          ProductChangelog: true,
          AdCampaign: true,
          SocialPost: true,
        },
      },
    },
  });

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Products</h1>
        <Link
          href="/products/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No products yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Create your first product to start building your public launch page.
          </p>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            + New Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
