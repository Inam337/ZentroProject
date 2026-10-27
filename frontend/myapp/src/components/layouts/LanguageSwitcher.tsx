import { useCallback, useRef, useState } from 'react';

import { ChevronDown } from '@/components/icons/FluentIcons';
import { useDismiss } from '@/hooks/use-dismiss';
import { useT } from '@/hooks/use-t';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/libs/i18n';
import { cn } from '@/libs/utils';

const LOCALE_LABELS: Record<SupportedLocale, { short: string; name: string }> = {
  en: { short: 'EN', name: 'English' },
  ur: { short: 'اردو', name: 'اردو (Urdu)' },
};

function Globe({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.8 4 5.8 4 9s-1.4 6.2-4 9c-2.6-2.8-4-5.8-4-9s1.4-6.2 4-9Z" />
    </svg>
  );
}

export default function LanguageSwitcher() {
  const { t, locale, setLocale } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useDismiss(ref, open, close);

  return (
    <div
      ref={ref}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('i18n.language', 'Language')}
        className={cn(
          'flex h-10 items-center gap-2 rounded-full border border-[#D9E7E1] bg-white/80 px-3',
          'text-sm font-medium text-[#1A312C] transition-colors hover:bg-[#E1F0EA]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#428475]',
        )}
      >
        <Globe className="size-4 text-[#428475]" />
        <span>{LOCALE_LABELS[locale]?.short ?? locale.toUpperCase()}</span>
        <ChevronDown className={cn('size-4 text-gray-600 transition-transform', open && 'rotate-180')} />
      </button>

      {open
        ? (
            <ul
              role="listbox"
              aria-label={t('i18n.language', 'Language')}
              className="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl border border-[#D9E7E1] bg-white py-1 shadow-lg"
            >
              {SUPPORTED_LOCALES.map((code) => {
                const active = code === locale;

                return (
                  <li
                    key={code}
                    role="option"
                    aria-selected={active}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setLocale(code);
                        close();
                      }}
                      className={cn(
                        'flex w-full items-center justify-between gap-6 px-4 py-2.5 text-sm transition-colors',
                        active ? 'bg-[#E1F0EA] font-semibold text-[#1A312C]' : 'text-gray-800 hover:bg-gray-50',
                      )}
                    >
                      <span>{LOCALE_LABELS[code].name}</span>
                      {active ? <span aria-hidden="true" className="text-[#428475]">✓</span> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )
        : null}
    </div>
  );
}
