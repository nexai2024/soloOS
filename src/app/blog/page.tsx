import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const metadata = {
  title: 'Blog',
  description: 'Read our latest articles and updates',
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
      viewCount: true,
      Categories: {
        include: { Category: true },
      },
      Tags: {
        include: { Tag: true },
      },
    },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Blog</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-12">
          Latest articles, updates, and insights
        </p>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 dark:text-slate-400">No posts published yet.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {posts.map((post) => (
              <article key={post.id} className="group">
                <Link href={`/blog/${post.slug}`} className="block">
                  {post.featuredImage && (
                    <div className="mb-4 overflow-hidden rounded-xl">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    {post.Categories.map(({ Category }) => (
                      <span
                        key={Category.id}
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: Category.color + '20', color: Category.color }}
                      >
                        {Category.name}
                      </span>
                    ))}
                    {post.publishedAt && (
                      <time className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    {post.Tags.slice(0, 3).map(({ Tag }) => (
                      <span
                        key={Tag.id}
                        className="text-xs text-slate-500 dark:text-slate-400"
                      >
                        #{Tag.name}
                      </span>
                    ))}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
