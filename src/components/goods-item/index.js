import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Image from '../Image';
import { textOverflow } from '../../assets/css/commonStyle';
import { IconButtonAnimate } from '../animate';

GoodsItem.propTypes = {
  isSelected: PropTypes.bool,
  item: PropTypes.object,
  setSelectedGoods:PropTypes.func
};
export default function GoodsItem({ isSelected, item,setSelectedGoods }) {
  const theme = useTheme();
  const background = isSelected ? 'rgba(0, 171, 85, 0.08)' : 'none';
  return (
    <Stack
      onClick={setSelectedGoods&&setSelectedGoods}
      sx={{
        height: '96px',
        '&:hover': { background: 'rgba(0, 171, 85, 0.08)' },
        borderRadius: '12px',
        background,
        cursor: 'pointer',
        p:2
      }}
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
    >
      <Image src={item?.spuLogo} style={{objectFit:'contain'}} disabledEffect sx={{ borderRadius: 1.5, width: 64, height: 64, mr: 2, }} />
      <Stack direction="column">
        <Typography sx={{ maxWidth: 260, ...textOverflow }} color={theme.palette.grey[800]} variant="subtitle2">

          {item?.title}
        </Typography>
        <Typography sx={{ maxWidth: 260, ...textOverflow, mt: 1}} color={theme.palette.grey[600]} variant="body2">

          货号：{item?.articleNumber}
        </Typography>
      </Stack>
    </Stack>
  );
}
