'use client';

import type { TiptapContent, TiptapNode } from '@/lib/marketing/types';

interface BlogPreviewProps {
  content: TiptapContent | null;
  title: string;
  featuredImage?: string | null;
}

function renderNode(node: TiptapNode, index: number): React.ReactNode {
  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case 'doc':
      return <div key={index}>{children}</div>;

    case 'paragraph':
      return (
        <p key={index} className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          {children || <br />}
        </p>
      );

    case 'heading': {
      const level = (node.attrs?.level as number) || 1;
      const classes: Record<number, string> = {
        1: 'text-3xl font-bold text-slate-900 dark:text-white mt-8 mb-4',
        2: 'text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-3',
        3: 'text-xl font-semibold text-slate-900 dark:text-white mt-5 mb-2',
      };
      const Tag = `h${level}` as React.ElementType;
      return (
        <Tag key={index} className={classes[level] || classes[1]}>
          {children}
        </Tag>
      );
    }

    case 'bulletList':
      return (
        <ul key={index} className="list-disc list-inside mb-4 space-y-1 text-slate-700 dark:text-slate-300">
          {children}
        </ul>
      );

    case 'orderedList':
      return (
        <ol key={index} className="list-decimal list-inside mb-4 space-y-1 text-slate-700 dark:text-slate-300">
          {children}
        </ol>
      );

    case 'listItem':
      return <li key={index}>{children}</li>;

    case 'blockquote':
      return (
        <blockquote
          key={index}
          className="border-l-4 border-blue-500 pl-4 py-2 mb-4 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-r-lg"
        >
          {children}
        </blockquote>
      );

    case 'codeBlock':
      return (
        <pre
          key={index}
          className="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg p-4 mb-4 overflow-x-auto text-sm font-mono"
        >
          <code>{children}</code>
        </pre>
      );

    case 'image':
      return (
        <figure key={index} className="mb-6">
          <img
            src={node.attrs?.src as string}
            alt={(node.attrs?.alt as string) || ''}
            className="rounded-lg max-w-full mx-auto"
          />
          {node.attrs?.title ? (
            <figcaption className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
              {String(node.attrs.title)}
            </figcaption>
          ) : null}
        </figure>
      );

    case 'horizontalRule':
      return <hr key={index} className="border-slate-200 dark:border-slate-700 my-8" />;

    case 'hardBreak':
      return <br key={index} />;

    case 'text': {
      let element: React.ReactNode = node.text || '';

      if (node.marks) {
        for (const mark of node.marks) {
          switch (mark.type) {
            case 'bold':
              element = <strong key={`bold-${index}`}>{element}</strong>;
              break;
            case 'italic':
              element = <em key={`italic-${index}`}>{element}</em>;
              break;
            case 'strike':
              element = <s key={`strike-${index}`}>{element}</s>;
              break;
            case 'code':
              element = (
                <code
                  key={`code-${index}`}
                  className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-sm font-mono text-pink-600 dark:text-pink-400"
                >
                  {element}
                </code>
              );
              break;
            case 'link':
              element = (
                <a
                  key={`link-${index}`}
                  href={mark.attrs?.href as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                >
                  {element}
                </a>
              );
              break;
          }
        }
      }

      return element;
    }

    default:
      return children ? <div key={index}>{children}</div> : null;
  }
}

export default function BlogPreview({ content, title, featuredImage }: BlogPreviewProps) {
  return (
    <article className="max-w-3xl mx-auto">
      {/* Featured Image */}
      {featuredImage && (
        <div className="mb-8">
          <img
            src={featuredImage}
            alt={title}
            className="w-full h-64 md:h-96 object-cover rounded-xl"
          />
        </div>
      )}

      {/* Title */}
      {title && (
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">
          {title}
        </h1>
      )}

      {/* Content */}
      {content && content.content ? (
        <div>{content.content.map((node, i) => renderNode(node, i))}</div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <p>No content to preview</p>
        </div>
      )}
    </article>
  );
}
