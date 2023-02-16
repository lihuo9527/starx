import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
// @mui
import { useTheme } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Button,
  InputAdornment,
  Grid,
} from '@mui/material';
// components
import { FormProvider } from 'src/components/hook-form';
import DynamicForm from './DynamicForm';
import Iconify from '../Iconify';

// ----------------------------------------------------------------------

SearchForm.propTypes = {
  defaultValues: PropTypes.object.isRequired,
  formConfig: PropTypes.array.isRequired,
  onSearch: PropTypes.func,
  getI18nText: PropTypes.func,
  sx: PropTypes.object,
};

export default function SearchForm({
  defaultValues,
  formConfig,
  onSearch,
  getI18nText,
  sx = {},
}) {
  // const isMountedRef = useIsMountedRef();
  const theme = useTheme();

  const methods = useForm({
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  // 翻译文案
  const getComponentText = useCallback((key, type = '') => {
    if (!getI18nText) return '';
    return getI18nText(key, type, undefined, 'components.app.search');
  }, [getI18nText]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSearch)}>
      <Grid container spacing={3} sx={{
        py: 2.5,
        px: 3,
        flexWrap: 'wrap',
        '.MuiInputBase-input, .MuiSelect-select': {
          height: 40,
          boxSizing: 'border-box'
        },
        ...sx,
      }}>
        {useMemo(() => <DynamicForm formConfig={formConfig} layout="Grid"
          getI18nText={getI18nText}
          size="small"
          sx={{
            width: 186,
          }}
          props={{
            input: {
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon={'eva:search-fill'} sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                  </InputAdornment>
                )
              }
            }
          }} />, [formConfig, getI18nText])}

        <Grid item>
          <Stack direction="row" spacing={3} sx={{
            height: '100%',
            minHeight: 40 
          }}>
            <LoadingButton type="submit" variant="outlined" loading={isSubmitting} sx={{ width: 104 }} >
              {getComponentText('search', 'button')}
            </LoadingButton>
            <Button variant="outlined" sx={{
              width: 57,
              minWidth: 'auto',
              height: '100%',
              color: theme.palette.text.primary,
              borderColor: theme.palette.divider,
            }} onClick={() => {
              reset();
              onSearch();
            }}>{getComponentText('reset', 'button')}</Button>
          </Stack>
        </Grid>
      </Grid>

    </FormProvider>
  );
}
