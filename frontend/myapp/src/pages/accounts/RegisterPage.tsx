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
  createRegisterSchema,
  registerFormDefaultValues,
  type RegisterFormData,
} from '@/validation-schemas';

import AuthFormLayout from './AuthFormLayout';

export default function RegisterPage() {
  const { t, i18nT, resolveAuthMessage } = useAuthTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const registerUser = useAuthStore(state => state.register);
  const registerSchema = useMemo(() => createRegisterSchema(t), [t]);  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: registerFormDefaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (result.success) {
        navigate(AppConstants.Routes.Private.Dashboard, { replace: true });

        return;
      }

      setError(
        resolveAuthMessage(
          result.error ?? 'auth.register.errors.generic',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LayoutCenter>
      <AuthFormLayout
        title={i18nT('auth.register.title')}
        subtitle={i18nT('auth.register.subtitle')}
        footer={(
          <p className="text-sm text-gray-600 text-center">
            {i18nT('auth.common.hasAccount')}
            {' '}
            <Link
              to={AppConstants.Routes.Public.Login}
              className="text-primary font-medium hover:underline"
            >
              {i18nT('auth.common.loginLink')}
            </Link>
          </p>
        )}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-full space-y-4"
          noValidate
        >
          <div>
            <label
              className="text-sm font-medium"
              htmlFor="name"
            >
              {i18nT('auth.register.nameLabel')}
            </label>
            <input
              id="name"
              {...register('name')}
              type="text"
              autoComplete="name"
              placeholder={i18nT('auth.register.namePlaceholder')}
              className="w-full px-3 py-2 border rounded mt-1"
            />
            <FieldError msg={errors.name?.message} />
          </div>

          <div>
            <label
              className="text-sm font-medium"
              htmlFor="email"
            >
              {i18nT('auth.register.emailLabel')}
            </label>
            <input
              id="email"
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder={i18nT('auth.register.emailPlaceholder')}
              className="w-full px-3 py-2 border rounded mt-1"
            />
            <FieldError msg={errors.email?.message} />
          </div>

          <div>
            <label
              className="text-sm font-medium"
              htmlFor="password"
            >
              {i18nT('auth.register.passwordLabel')}
            </label>
            <PasswordInput
              name="password"
              register={register}
              className="mt-1"
              placeholder={i18nT('auth.register.passwordPlaceholder')}
            />
            <FieldError msg={errors.password?.message} />
          </div>

          <div>
            <label
              className="text-sm font-medium"
              htmlFor="confirmPassword"
            >
              {i18nT('auth.register.confirmPasswordLabel')}
            </label>
            <PasswordInput
              name="confirmPassword"
              register={register}
              className="mt-1"
              placeholder={i18nT('auth.register.confirmPasswordPlaceholder')}
            />
            <FieldError msg={errors.confirmPassword?.message} />
          </div>

          <FieldError msg={error} />

          <AppButton
            type="submit"
            color="primary"
            loading={isSubmitting}
          >
            {i18nT('auth.register.submit')}
          </AppButton>
        </form>
      </AuthFormLayout>
    </LayoutCenter>
  );
}
