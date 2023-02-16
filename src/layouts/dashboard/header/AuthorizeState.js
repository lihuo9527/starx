// @mui
import {
  Badge
} from '@mui/material';
// components
import Iconify from '../../../components/Iconify';
import { IconButtonAnimate } from '../../../components/animate';
import dewuLink from '../../../assets/images/dewu_link.png';
import Image from '../../../components/Image';

// ----------------------------------------------------------------------

export default function AuthorizeState() {
  return (
      <Image src={dewuLink} sx={{width: 40, height: 40 }} />
  );
}
