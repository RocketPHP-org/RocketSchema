'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();
  const t = useTranslations('schema');

  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      {t('back')}
    </Button>
  );
}
