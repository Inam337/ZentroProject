import { useIntl } from 'react-intl';

/** Shown while Zustand persist rehydrates auth state (avoids blank public/private routes). */
export default function AuthRouteFallback() {
  const intl = useIntl();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-500">
        {intl.formatMessage({
          id: 'common.text.loading',
          defaultMessage: 'Loading...',
        })}
      </p>
    </div>
  );
}
