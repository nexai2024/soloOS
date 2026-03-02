import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import BlogContentRenderer from './BlogContentRenderer';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: 'PUBLISHED' },
    select: { title: true, seoTitle: true, seoDescription: true, excerpt: true, featuredImage: true },
  });

  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || '',
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || '',
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = await prisma.blogPost.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: {
      Categories: { include: { Category: true } },
      Tags: { include: { Tag: true } },
    },
  });

  if (!post) notFound();

  // Increment view count (fire and forget)
  prisma.blogPost.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link
          href="/blog"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-8 inline-block"
        >
          &larr; Back to blog
        </Link>

        {post.featuredImage && (
          <div className="mb-8 overflow-hidden rounded-xl">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-80 object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
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

        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        <article className="prose prose-slate dark:prose-invert prose-lg max-w-none">
          <BlogContentRenderer content={post.content} />
        </article>

        {post.Tags.length > 0 && (
          <div className="flex items-center gap-2 mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Tags:</span>
            {post.Tags.map(({ Tag }) => (
              <span
                key={Tag.id}
                className="text-sm px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full"
              >
                #{Tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
