import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PublicWaitlistForm from "@/components/products/PublicWaitlistForm";

export default async function PublicProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) notFound();

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      ProductChangelog: { orderBy: { releasedAt: "desc" } },
      DevelopmentPhase: { include: { PhaseTask: true } },
    },
  });

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-indigo-600">
                {product.isPublic ? "Live product" : "Draft product"}
              </p>
              <h1 className="text-4xl font-bold text-slate-900 mt-2">
                {product.name}
              </h1>
              {product.tagline && (
                <p className="text-lg text-slate-600 mt-3">{product.tagline}</p>
              )}
              {product.description && (
                <p className="text-sm text-slate-500 mt-4">
                  {product.description}
                </p>
              )}
            </div>
            {product.logoUrl && (
              <img
                src={product.logoUrl}
                alt={`${product.name} logo`}
                className="w-20 h-20 object-contain rounded-xl border border-slate-200 bg-white"
              />
            )}
          </div>
          {!product.isPublic && (
            <div className="mt-6 rounded-lg bg-amber-50 text-amber-700 text-sm px-3 py-2">
              This page is in draft mode. Publish it from the product settings
              when you're ready to share full details.
            </div>
          )}
        </div>

        <PublicWaitlistForm slug={product.slug} />

        {product.isPublic && (
          <>
            {(product.slogan || product.shortDescription) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                {product.slogan && (
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {product.slogan}
                  </h2>
                )}
                {product.shortDescription && (
                  <p className="text-slate-600 mt-3">
                    {product.shortDescription}
                  </p>
                )}
              </div>
            )}

            {product.showChangelog && product.ProductChangelog.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Changelog
                </h3>
                {product.ProductChangelog.map((entry) => (
                  <div
                    key={entry.id}
                    className="border-b border-slate-200 pb-4 last:border-0"
                  >
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{entry.version}</span>
                      <span>
                        {new Date(entry.releasedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-slate-900 font-medium mt-1">
                      {entry.title}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {entry.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {product.showPhases && product.DevelopmentPhase.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Development
                </h3>
                {product.DevelopmentPhase.map((phase) => (
                  <div key={phase.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-slate-900">
                        {phase.name}
                      </div>
                      <span className="text-xs text-slate-500">
                        {phase.PhaseTask.length} tasks
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
