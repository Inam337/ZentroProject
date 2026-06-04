import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';

import { AppConstants } from '@/common/AppConstants';
import AppButton from '@/components/ui/AppButton';
import FieldError from '@/components/ui/FieldError';
import LayoutCenter from '@/components/layouts/LayoutCenter';
import PasswordInput from '@/components/ui/PasswordInput';
import { useAuthTranslation } from '@/hooks/use-auth-translation';
import { useAuthStore } from '@/stores/auth';
import {
  createLoginSchema,
  loginFormDefaultValues,
  type LoginFormData,
} from '@/validation-schemas';

import AuthFormLayout from './AuthFormLayout';

export default function LoginPage() {
  const { t, i18nT, resolveAuthMessage } = useAuthTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const loginSchema = useMemo(() => createLoginSchema(t), [t]);  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginFormDefaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(data.email, data.password);

      if (result.success) {
        navigate(AppConstants.Routes.Private.Dashboard, { replace: true });

        return;
      }

      setError(
        resolveAuthMessage(
          result.error ?? 'auth.login.errors.invalidCredentials',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LayoutCenter>
      <AuthFormLayout
        title={i18nT('auth.login.title')}
        subtitle={i18nT('auth.login.subtitle')}
        footer={(
          <>
            <p className="text-sm text-gray-600 text-center">
              {i18nT('auth.common.noAccount')}
              {' '}
              <Link
                to={AppConstants.Routes.Public.Register}
                className="text-primary font-medium hover:underline"
              >
                {i18nT('auth.common.registerLink')}
              </Link>
            </p>
            <Link
              to={AppConstants.Routes.Public.ForgotPassword}
              className="text-sm text-gray-500 hover:text-gray-800 text-center"
            >
              {i18nT('auth.login.forgotPasswordLink')}
            </Link>
          </>
        )}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center w-full space-y-4"
          noValidate
        >
          <div className="w-full">
            <label
              className="text-sm font-medium"
              htmlFor="email"
            >
              {i18nT('auth.login.emailLabel')}
            </label>
            <input
              id="email"
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder={i18nT('auth.login.emailPlaceholder')}
              className="w-full px-3 py-2 border rounded mt-1"
            />
            <FieldError msg={errors.email?.message} />
          </div>

          <div className="w-full">
            <label
              className="text-sm font-medium"
              htmlFor="password"
            >
              {i18nT('auth.login.passwordLabel')}
            </label>
            <div className="mt-1">
              <PasswordInput
                name="password"
                register={register}
                placeholder={i18nT('auth.login.passwordPlaceholder')}
              />
            </div>
            <FieldError msg={errors.password?.message} />
          </div>

          <FieldError msg={error} />

          <AppButton
            type="submit"
            color="primary"
            loading={isSubmitting}
          >
            {i18nT('auth.login.submit')}
          </AppButton>
        </form>
      </AuthFormLayout>
    </LayoutCenter>
  );
}
