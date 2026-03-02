'use client';

import type { NewsletterBlock } from '@/lib/marketing/types';
import TextBlock from './blocks/TextBlock';
import ImageBlock from './blocks/ImageBlock';
import ButtonBlock from './blocks/ButtonBlock';
import DividerBlock from './blocks/DividerBlock';
import SpacerBlock from './blocks/SpacerBlock';
import SocialLinksBlock from './blocks/SocialLinksBlock';
import HeaderBlock from './blocks/HeaderBlock';
import FooterBlock from './blocks/FooterBlock';
import HtmlBlock from './blocks/HtmlBlock';
import VideoBlock from './blocks/VideoBlock';
import ColumnsBlock from './blocks/ColumnsBlock';

interface BlockRendererProps {
  block: NewsletterBlock;
  isSelected: boolean;
  onUpdate: (updates: { content?: Record<string, unknown>; styles?: Record<string, unknown> }) => void;
}

export default function BlockRenderer({ block, isSelected, onUpdate }: BlockRendererProps) {
  const handleUpdate = (updates: { content?: Record<string, unknown>; styles?: Record<string, unknown> }) => {
    const merged: { content?: Record<string, unknown>; styles?: Record<string, unknown> } = {};
    if (updates.content) {
      merged.content = { ...block.content, ...updates.content };
    }
    if (updates.styles) {
      merged.styles = { ...block.styles, ...updates.styles };
    }
    onUpdate(merged);
  };

  const content = block.content as Record<string, unknown>;
  const styles = block.styles as Record<string, unknown>;

  switch (block.type) {
    case 'text':
      return <TextBlock content={content as { text?: string; alignment?: string }} styles={styles} onUpdate={handleUpdate} />;
    case 'image':
      return <ImageBlock content={content as { src?: string; alt?: string; link?: string }} styles={styles} onUpdate={handleUpdate} />;
    case 'button':
      return <ButtonBlock content={content as { text?: string; url?: string; alignment?: string; backgroundColor?: string; textColor?: string; borderRadius?: number }} styles={styles} onUpdate={handleUpdate} />;
    case 'divider':
      return <DividerBlock content={content as { color?: string; thickness?: number; style?: string }} styles={styles} onUpdate={handleUpdate} />;
    case 'spacer':
      return <SpacerBlock content={content as { height?: number }} styles={styles} onUpdate={handleUpdate} />;
    case 'social-links':
      return <SocialLinksBlock content={content as { twitter?: string; linkedin?: string; github?: string; website?: string }} styles={styles} onUpdate={handleUpdate} />;
    case 'header':
      return <HeaderBlock content={content as { logoUrl?: string; title?: string }} styles={styles} onUpdate={handleUpdate} />;
    case 'footer':
      return <FooterBlock content={content as { companyName?: string; address?: string; unsubscribeText?: string }} styles={styles} onUpdate={handleUpdate} />;
    case 'html':
      return <HtmlBlock content={content as { html?: string }} styles={styles} onUpdate={handleUpdate} />;
    case 'video':
      return <VideoBlock content={content as { url?: string; thumbnailUrl?: string }} styles={styles} onUpdate={handleUpdate} />;
    case 'columns':
      return <ColumnsBlock content={content as { columns?: { text: string }[]; columnCount?: number }} styles={styles} onUpdate={handleUpdate} />;
    default:
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
          Unknown block type: {block.type}
        </div>
      );
  }
}
