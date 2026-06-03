import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/Card';
import { useAuthStore } from '@/stores/auth';
import LayoutCenter from '@/components/layouts/LayoutCenter';
import AppButton from '@/components/ui/AppButton';
import FieldError from '@/components/ui/FieldError';
import { AppConstants } from '@/common/AppConstants';
import { useLoaderStore } from '@/stores/loader';
import PasswordInput from '@/components/ui/PasswordInput';

const loginSchema = z.object({
  email: z.email(AppConstants.Strings.Errors.InvalidField('Email')),
  password: z
    .string()
    .min(
      AppConstants.Validations.PasswordLength,
      AppConstants.Strings.Errors.MinLength('Password', AppConstants.Validations.PasswordLength),
    ),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [error, setError] = useState<string>(null);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const isLoading = useLoaderStore(state => state.isLoading());
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  const onSubmit = async (data: LoginForm) => {
    setError(null);

    const success = await login(data.email, data.password);

    if (success) {
      navigate(AppConstants.Routes.Private.Dashboard, { replace: true });
    } else {
      setError(AppConstants.Strings.Errors.InvalidCredentials);
    }
  };

  return (
    <LayoutCenter>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center w-full space-y-4"
            noValidate
          >
            <div className="w-full">
              <input
                {...register('email')}
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 border rounded"
              />
              <FieldError msg={errors.email?.message} />
            </div>

            <div className="w-full">
              <PasswordInput
                name="password"
                register={register}
              />
              <FieldError msg={errors.password?.message} />
            </div>

            <div className="w-full">
              <FieldError
                msg={
                  error
                    ? AppConstants.Strings.Errors.InvalidCredentials
                    : null
                }
              />
            </div>

            <AppButton
              color="primary"
              loading={isLoading}
            >
              Submit
            </AppButton>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <Link
            to={AppConstants.Routes.Public.ForgotPassword}
            className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            Forgot Password?
          </Link>
        </CardFooter>
      </Card>
    </LayoutCenter>
  );
}
