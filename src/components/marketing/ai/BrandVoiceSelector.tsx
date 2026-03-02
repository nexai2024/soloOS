'use client';

import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { fetchGet } from '@/lib/fetch';
import type { BrandVoiceData } from '@/lib/marketing/types';

interface BrandVoiceSelectorProps {
  selected: BrandVoiceData | null;
  onSelect: (voice: BrandVoiceData | null) => void;
}

export default function BrandVoiceSelector({ selected, onSelect }: BrandVoiceSelectorProps) {
  const [voices, setVoices] = useState<BrandVoiceData[]>([]);

  useEffect(() => {
    fetchGet<BrandVoiceData[]>('/api/brand-voices').then((res) => {
      if (res.ok) {
        setVoices(res.data);
        const defaultVoice = res.data.find((v) => v.isDefault);
        if (defaultVoice && !selected) onSelect(defaultVoice);
      }
    });
  }, []);

  if (voices.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Volume2 className="h-4 w-4 text-slate-400 shrink-0" />
      <select
        value={selected?.id || ''}
        onChange={(e) => {
          const voice = voices.find((v) => v.id === e.target.value) || null;
          onSelect(voice);
        }}
        className="flex-1 px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
      >
        <option value="">No brand voice</option>
        {voices.map((voice) => (
          <option key={voice.id} value={voice.id}>
            {voice.name} {voice.isDefault ? '(default)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
