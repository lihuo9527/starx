import PropTypes from 'prop-types';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import {
  Toolbar,
  Tooltip,
  IconButton,
  Typography,
  InputAdornment,
  TextField,
  MenuItem,
  Stack,
  Button, Box,
} from '@mui/material';
// components
import { DatePicker } from '@mui/lab';
import Iconify from '../../../../components/Iconify';
import InputStyle from '../../../../components/InputStyle';

// ----------------------------------------------------------------------

const RootStyle = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
}));

// ----------------------------------------------------------------------

ProductListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onDeleteProducts: PropTypes.func,
  optionsService: PropTypes.arrayOf(PropTypes.string),
};

export default function ProductListToolbar({ numSelected, filterName, onFilterName, onDeleteProducts,optionsService }) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const INPUT_WIDTH = 160;
  return (
    <Stack>

      <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ py: 2.5, px: 3 }}>
        <InputStyle
          label='单据编号'
          stretchStart={240}
          value={filterName}
          onChange={(event) => onFilterName(event.target.value)}
          placeholder="CGDD00000000722"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon={'eva:search-fill'} sx={{ color: 'text.disabled', width: 20, height: 20 }} />
              </InputAdornment>
            ),
          }}
        />
      <InputStyle
        label='商品信息'
        stretchStart={240}
        value={filterName}
        onChange={(event) => onFilterName(event.target.value)}
        placeholder="请输入"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon={'eva:search-fill'} sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          ),
        }}
      />
      <InputStyle
        label='供应商'
        stretchStart={240}
        value={filterName}
        onChange={(event) => onFilterName(event.target.value)}
        placeholder="请输入"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon={'eva:search-fill'} sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          ),
        }}
      />
      <InputStyle
        label='操作员'
        fullWidth
        select
        placeholder="请选择"
        SelectProps={{
          MenuProps: {
            sx: { '& .MuiPaper-root': { maxHeight: 260 } },
          },
        }}
        sx={{
          maxWidth: { md: INPUT_WIDTH },
          textTransform: 'capitalize',
        }}
      >
        {['45','admin'].map((option) => (
          <MenuItem
            key={option}
            value={option}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 0.75,
              typography: 'body2',
              textTransform: 'capitalize',
            }}
          >
            {option}
          </MenuItem>
        ))}
      </InputStyle>
      <DatePicker
        label="单据日期"
        placeholder="请选择"
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            sx={{
              maxWidth: { md: INPUT_WIDTH },
            }}
          />
        )}
      />
      <Button  variant='outlined'>
        查询
      </Button>

      <Button  >
        重置
      </Button>

    </Stack>
      <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{pt:3, px: 3,pb:2.5,justifyContent:'space-between' }}>
        <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
          新增采购订单
        </Button>
        <Box >
          <Button startIcon={<Iconify icon="eva:plus-fill" />} >
            审核
          </Button>
          <Button  startIcon={<Iconify icon="eva:plus-fill" />}>
            反审核
          </Button>
          <Button startIcon={<Iconify icon="eva:plus-fill" />} >
            删除
          </Button>
        </Box>
        </Stack>
    </Stack>
  );
}
