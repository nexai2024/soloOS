'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TiptapToolbar from './TiptapToolbar';
import type { TiptapContent } from '@/lib/marketing/types';

interface TiptapEditorProps {
  content: TiptapContent | null;
  onChange: (content: TiptapContent) => void;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange, placeholder = 'Start writing...' }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || { type: 'doc', content: [] },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as TiptapContent);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-slate dark:prose-invert max-w-none p-4 min-h-[400px] focus:outline-none',
      },
    },
  });

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 overflow-hidden">
      <TiptapToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
