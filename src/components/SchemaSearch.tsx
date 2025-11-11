'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SchemaSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function SchemaSearch({ value, onChange }: SchemaSearchProps) {
  const t = useTranslations('home.search');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Autofocus on mount
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative max-w-2xl mx-auto">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={t('placeholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 pl-12 text-lg rounded-full shadow-lg border-2 focus-visible:ring-2 focus-visible:ring-primary"
      />
    </div>
  );
}
