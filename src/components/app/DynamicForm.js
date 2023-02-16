import PropTypes from 'prop-types';
import { Fragment, useCallback } from 'react';
// @mui
import {
  Box,
  Grid,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { RHFSelect, RHFTextField } from '../hook-form';
import RHFDateRanger from '../hook-form/RHFDateRanger';
// components

// ----------------------------------------------------------------------

DynamicForm.propTypes = {
  size: PropTypes.string, // 尺寸
  sx: PropTypes.object, // 共用的样式
  formConfig: PropTypes.array.isRequired,
  getI18nText: PropTypes.func,
  layout: PropTypes.oneOf(['Stack', 'Grid']),
  // 各控件额外样式
  props: PropTypes.object,
};

export default function DynamicForm({
  formConfig,
  getI18nText,
  sx = {},
  size = 'normal',
  layout = 'Stack',
  props = {},
}) {

  // 翻译文案
  const getText = useCallback(
    (key, type = 'placeholder', mKey = undefined, itemType = undefined) => {
      if (!getI18nText) return '';
      switch (type) {
        case 'required':
        case 'placeholder':
          return getI18nText(key, type, `请${itemType === 'select' ? '选择' : '输入'}${getI18nText(key, 'label')}`, mKey);
        default:
          return getI18nText(key, type, undefined, mKey);
      }
    },
    [getI18nText]
  );

  return <>
    {formConfig?.map((items, index) => {
      // 一行多个
      const group = Object.prototype.toString.call(items) === '[object Array]' ? items : [items];
      if (layout === 'Stack') return <FormGroup key={index} group={group} sx={sx} size={size} getText={getText} props={props} />
      return <Grid item key={index}>
        <FormGroup group={group} sx={sx} size={size} getText={getText} props={props} />
      </Grid>
    })}
  </>;
}



//
FormGroup.propTypes = {
  group: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  size: PropTypes.string,
  sx: PropTypes.object,
  props: PropTypes.object,
  getText: PropTypes.func,
}

function FormGroup({
  group,
  size,
  sx,
  props: {
    input: inputProps = {},
  },
  getText,
}) {

  return <Stack components="div" direction="row" spacing={2}>
    {group.map(item => {
      const { id, dataKey, type = 'input', props = {}, options = [], validation = () => { } } = item;

      const commonProps = {
        name: dataKey,
        key: dataKey,
        rules: validation(getText),
        label: getText(id, 'label'),
        placeholder: getText(id, 'placeholder', undefined, type),
        size,
        sx: {
          flex: 1,
          ...sx,
        },
        ...props,
      }

      switch (type) {
        case 'input':
          return <RHFTextField {...commonProps} {...inputProps} />
        case 'select':
          return <RHFSelect {...commonProps} SelectProps={{
            native: false,
            MenuProps: {
              sx: {
                maxHeight: 210,
              }
            },
          }}>
            <MenuItem value={''} sx={{ padding: 0 }}> </MenuItem>
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label || getText(option.value, `options.${dataKey}`)}
              </MenuItem>
            ))}
          </RHFSelect>
        case 'dateRange':
          return <RHFDateRanger {...commonProps} label={[getText(`${id}_start`, 'label'), getText(`${id}_end`, 'label')]} />
        default:
          return null;
      }
    })}
  </Stack>
};
