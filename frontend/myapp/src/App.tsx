import { IntlProvider } from 'react-intl';

import { flattenMessages } from '@/libs/flatten-messages';
import enMessages from '@/locales/en.json';
import AppRoutes from '@/routes/AppRoutes';

const messages = flattenMessages(enMessages as Record<string, unknown>);

export default function App() {
  return (
    <IntlProvider locale="en" defaultLocale="en" messages={messages}>
      <AppRoutes />
    </IntlProvider>
  );
}
