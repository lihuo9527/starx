import * as Yup from 'yup';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Link, Stack, Alert, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/system';
// routes
import { PATH_AUTH } from '../../../routes/paths';
// hooks
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
import useLocales from '../../../hooks/useLocales';
import { useDispatch } from '../../../redux/store';
import { setGlobalMessage } from '../../../redux/slices/global';
// components
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField, RHFCheckbox } from '../../../components/hook-form';
import * as api from '../../../services/api-client';


// ----------------------------------------------------------------------

export default function LoginForm(props) {
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const returnUrl = params.getAll("returnUrl")[0];
  const { login } = useAuth();
  const navigate = useNavigate();
  const isMountedRef = useIsMountedRef();
  const theme = useTheme();
  const { getI18nText } = useLocales('sections.auth.login');

  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required(getI18nText('username', 'required')),
    password: Yup.string().required(getI18nText('password', 'required')),
  });

  const defaultValues = {
    username: '',
    password: '',
    remember: true,
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    const { username, password, remember } = data;
    try {
      const result = await api.userLogin({
        phone: data.username,
        password: data.password,
        isAdmin: true,
      });
      if (result.msg === 'success') {
        localStorage.setItem('accessToken', result.token);
        const url = returnUrl ? `/${returnUrl}` : '/appointment-information';
        window.location.href = url;
      } else {
        dispatch(
          setGlobalMessage({
            variant: 'error',
            msg: result.msg,
          })
        );
      }
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <RHFTextField name="username" label={getI18nText('username', 'label')}
          placeholder={getI18nText('username', 'required')} />

        <RHFTextField
          name="password"
          label={getI18nText('password', 'label')}
          type={showPassword ? 'text' : 'password'}
          placeholder={getI18nText('password', 'required')}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <RHFCheckbox name="remember" label={getI18nText('remember', 'label')} />
        {/* <Link component={RouterLink} variant="subtitle2" to={PATH_AUTH.register}>
          {getI18nText('register', 'button')}
        </Link> */}

      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
        {getI18nText('login', 'button')}
      </LoadingButton>
    </FormProvider>
  );
}
