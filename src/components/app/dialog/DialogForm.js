import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
// @mui
import {
  Stack, Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
// hook
// import useLocales from 'src/hooks/useLocales';
// components
import { FormProvider } from 'src/components/hook-form';
import DialogContainer from './DialogContainer';
import DynamicForm from '../DynamicForm';
// ----------------------------------------------------------------------

DialogForm.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  defaultValues: PropTypes.object.isRequired, // 表单默认值
  formConfig: PropTypes.array.isRequired, // 表单配置
  onSubmit: PropTypes.func,
  getI18nText: PropTypes.func, // 翻译
  children: PropTypes.node, // 额外node
  dialogProps: PropTypes.object,
  formParams: PropTypes.object,
};

export default function DialogForm({
  open,
  title,
  defaultValues,
  formConfig,
  getI18nText,
  onSubmit,
  children,
  dialogProps: {
    actionCancel = {},
    actionConfirm = {},
    sx = {},
    ...otherDialogProps
  } = {},
}) {
  // const isMountedRef = useIsMountedRef();
  const formRef = useRef(null);

  const methods = useForm({
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) reset(defaultValues);
  }, [defaultValues, reset, open]);

  // 翻译文案
  // const getText = useCallback(
  //   (key, type = 'placeholder', mKey = undefined, otherValue = '') => {
  //     if (!getI18nText) return '';
  //     switch (type) {
  //       case 'required':
  //       case 'placeholder':
  //         return getI18nText(key, type, `请输入${getI18nText(key, 'label')}查询`, mKey);
  //       default:
  //         return getI18nText(key, type, undefined, mKey);
  //     }
  //   },
  //   [getI18nText]
  // );

  return <DialogContainer open={open}
    title={title}
    actions={['cancel', 'confirm']}
    {...otherDialogProps}
    sx={{
      width: 720,
      ...sx,
    }}
    actionCancel={{
      fn: () => { },
      ...actionCancel,
    }}
    actionConfirm={{
      isSubmitting,
      fn: () => {
        handleSubmit(onSubmit)(formRef.current);
      },
      ...actionConfirm,
    }}>
    <FormProvider formRef={formRef} methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} direction="column" sx={{
        py: 2.5,
        px: 3,
      }}>
        <DynamicForm formConfig={formConfig} 
          getI18nText={getI18nText}
          props={{
            input: {
              // InputLabelProps: {
              //   shrink: true,
              // }
            }
          }} />
      </Stack>

      {/* 为了使回车有效 */}
      <Button type="submit" sx={{ display: 'none'}}>no see</Button>
    </FormProvider>
    {children}
  </DialogContainer>
}
