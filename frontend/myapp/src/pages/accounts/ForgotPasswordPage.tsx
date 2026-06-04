import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';

import { AppConstants } from '@/common/AppConstants';
import AppButton from '@/components/ui/AppButton';
import FieldError from '@/components/ui/FieldError';
import LayoutCenter from '@/components/layouts/LayoutCenter';
import { useAuthTranslation } from '@/hooks/use-auth-translation';
import {
  createForgotPasswordSchema,
  forgotPasswordFormDefaultValues,
  type ForgotPasswordFormData,
} from '@/validation-schemas';

import AuthFormLayout from './AuthFormLayout';

export default function ForgotPasswordPage() {
  const { t, i18nT } = useAuthTranslation();
  const [submitted, setSubmitted] = useState(false);
  const forgotPasswordSchema = useMemo(() => createForgotPasswordSchema(t), [t]);  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: forgotPasswordFormDefaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });  const onSubmit = () => {
    setSubmitted(true);
  };

  return (
    <LayoutCenter>
      <AuthFormLayout
        title={i18nT('auth.forgotPassword.title')}
        subtitle={i18nT('auth.forgotPassword.subtitle')}
        footer={(
          <Link
            to={AppConstants.Routes.Public.Login}
            className="text-sm text-gray-500 hover:text-gray-800 text-center"
          >
            {i18nT('auth.common.backToLogin')}
          </Link>
        )}
      >
        {submitted
          ? (
              <div className="space-y-3 text-sm text-gray-700">
                <p className="font-medium">{i18nT('auth.forgotPassword.infoTitle')}</p>
                <p>{i18nT('auth.forgotPassword.infoMessage')}</p>
              </div>
            )
          : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col w-full space-y-4"
                noValidate
              >
                <div>
                  <label
                    className="text-sm font-medium"
                    htmlFor="email"
                  >
                    {i18nT('auth.forgotPassword.emailLabel')}
                  </label>
                  <input
                    id="email"
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    placeholder={i18nT('auth.forgotPassword.emailPlaceholder')}
                    className="w-full px-3 py-2 border rounded mt-1"
                  />
                  <FieldError msg={errors.email?.message} />
                </div>

                <AppButton
                  type="submit"
                  color="primary"
                >
                  {i18nT('auth.forgotPassword.submit')}
                </AppButton>
              </form>
            )}
      </AuthFormLayout>
    </LayoutCenter>
  );
}
