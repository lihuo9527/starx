import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import Image from '../Image';
import { fc, textOverflow } from '../../assets/css/commonStyle';
import { IconButtonAnimate } from '../animate';

SizeItem.propTypes = {
  size: PropTypes.object,
  isSelected: PropTypes.bool,
  onClick:PropTypes.func
};
export default function SizeItem({ size,onClick }) {
  const theme = useTheme();
  const background = size.isSelected ? { background: theme.palette.primary.main } : { background: theme.palette.grey[300] };
  return (
    <Box
      onClick={onClick}
      sx={{
        ...fc,
        p: '4px 10px',
        height: '30px',
        borderRadius: '8px',
        ...background,
        cursor: 'pointer',
        mr: '8px',
        mb: '8px',
        transition:'all .3s'
      }}
    >
      <Typography color={size.isSelected ? theme.palette.grey[0] : theme.palette.grey[800]} variant="subtitle2">
        {size.size}
      </Typography>
    </Box>
  );
}
