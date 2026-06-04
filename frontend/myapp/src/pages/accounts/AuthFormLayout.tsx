import type { ReactNode } from 'react';

import Card from '@/components/ui/Card';

type AuthFormLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthFormLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthFormLayoutProps) {
  return (
    <Card className="w-full max-w-md px-6 py-6">
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle
          ? (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )
          : null}
      </header>
      <Card.Body>{children}</Card.Body>
      {footer ? (
        <Card.Footer>
          <div className="flex flex-col gap-2">{footer}</div>
        </Card.Footer>
      ) : null}
    </Card>
  );
}
