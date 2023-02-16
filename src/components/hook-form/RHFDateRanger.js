// 20220503
import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { FormHelperText } from '@mui/material';
import { DateRangePicker, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import useLocales from 'src/hooks/useLocales';

// ----------------------------------------------------------------------

RHFDateRanger.propTypes = {
  name: PropTypes.string,
  label: PropTypes.array,
  size: PropTypes.string,
  sx: PropTypes.object,
};

export default function RHFDateRanger({ name, size, sx, label = [], ...other }) {
  const { control } = useFormContext();
  const { getI18nText } = useLocales('components.hook-form.RHFDateRanger');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateRangePicker
            startText={label[0] || getI18nText('start', 'label')}
            endText={label[1] || getI18nText('end', 'label')}
            inputFormat="yyyy-MM-dd"
            mask="____-__-__"
            value={field.value}
            onChange={field.onChange}
            error={!!error}
            helperText={
              <FormHelperText error sx={{ px: 2, textTransform: 'capitalize' }}>
                {error?.message}
              </FormHelperText>
            }
            {...other}
            renderInput={(startProps, endProps) => <>
              <TextField {...startProps} size={size} sx={sx} autoComplete="off" />
              <Box sx={{ mx: 1 }}>-</Box>
              <TextField {...endProps} size={size} sx={sx} autoComplete="off" />
            </>}
          />
        </LocalizationProvider>
      )}
    />
  );
}
