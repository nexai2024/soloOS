'use client';

import type { TiptapContent, TiptapNode } from '@/lib/marketing/types';

interface BlogContentRendererProps {
  content: unknown;
}

export default function BlogContentRenderer({ content }: BlogContentRendererProps) {
  if (!content) {
    return <p className="text-slate-500">No content available.</p>;
  }

  const tiptapContent = content as TiptapContent;
  if (!tiptapContent.content) return null;

  return <div>{tiptapContent.content.map((node, i) => renderNode(node, i))}</div>;
}

function renderNode(node: TiptapNode, index: number): React.ReactNode {
  const key = `node-${index}`;

  switch (node.type) {
    case 'paragraph':
      return (
        <p key={key}>
          {node.content?.map((child, i) => renderInline(child, i)) || '\u00A0'}
        </p>
      );

    case 'heading': {
      const level = (node.attrs?.level as number) || 2;
      const Tag = `h${level}` as React.ElementType;
      return (
        <Tag key={key}>
          {node.content?.map((child, i) => renderInline(child, i))}
        </Tag>
      );
    }

    case 'bulletList':
      return (
        <ul key={key}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </ul>
      );

    case 'orderedList':
      return (
        <ol key={key}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </ol>
      );

    case 'listItem':
      return (
        <li key={key}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </li>
      );

    case 'blockquote':
      return (
        <blockquote key={key}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </blockquote>
      );

    case 'codeBlock':
      return (
        <pre key={key}>
          <code className={node.attrs?.language ? `language-${node.attrs.language}` : ''}>
            {node.content?.map((child) => child.text).join('') || ''}
          </code>
        </pre>
      );

    case 'image':
      return (
        <figure key={key}>
          <img
            src={node.attrs?.src as string}
            alt={node.attrs?.alt as string || ''}
            title={node.attrs?.title as string || undefined}
          />
        </figure>
      );

    case 'horizontalRule':
      return <hr key={key} />;

    default:
      if (node.content) {
        return (
          <div key={key}>
            {node.content.map((child, i) => renderNode(child, i))}
          </div>
        );
      }
      return null;
  }
}

function renderInline(node: TiptapNode, index: number): React.ReactNode {
  if (node.type === 'text') {
    let element: React.ReactNode = node.text || '';

    if (node.marks) {
      for (const mark of node.marks) {
        switch (mark.type) {
          case 'bold':
            element = <strong key={`mark-${index}-bold`}>{element}</strong>;
            break;
          case 'italic':
            element = <em key={`mark-${index}-italic`}>{element}</em>;
            break;
          case 'strike':
            element = <s key={`mark-${index}-strike`}>{element}</s>;
            break;
          case 'code':
            element = <code key={`mark-${index}-code`}>{element}</code>;
            break;
          case 'link':
            element = (
              <a
                key={`mark-${index}-link`}
                href={mark.attrs?.href as string}
                target={mark.attrs?.target as string || '_blank'}
                rel="noopener noreferrer"
              >
                {element}
              </a>
            );
            break;
        }
      }
    }

    return <span key={`inline-${index}`}>{element}</span>;
  }

  if (node.type === 'hardBreak') {
    return <br key={`inline-${index}`} />;
  }

  return null;
}
