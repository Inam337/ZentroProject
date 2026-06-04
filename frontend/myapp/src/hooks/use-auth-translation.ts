import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import type { TranslationFunction } from '@/validation-schemas';

/** react-intl helper for auth forms and Zod schemas */
export function useAuthTranslation() {
  const intl = useIntl();
  const t: TranslationFunction = useCallback(
    (id, defaultMessage, values) =>
      intl.formatMessage({ id, defaultMessage }, values),
    [intl],
  );
  const i18nT = useCallback(
    (id: string, defaultMessage?: string) =>
      intl.formatMessage({
        id,
        defaultMessage: defaultMessage ?? id,
      }),
    [intl],
  );
  const resolveAuthMessage = useCallback(
    (message: string) => (message.startsWith('auth.') ? i18nT(message) : message),
    [i18nT],
  );

  return { t, i18nT, resolveAuthMessage };
}
