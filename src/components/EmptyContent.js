import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';
//
import Image from './Image';
import { DocIllustration } from '../assets';
import useLocales from '../hooks/useLocales';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  height: '100%',
  display: 'flex',
  textAlign: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(6, 0),
}));

// ----------------------------------------------------------------------

EmptyContent.propTypes = {
  title: PropTypes.string,
  img: PropTypes.string,
  description: PropTypes.string,
};

export default function EmptyContent({ title, description, img, ...other }) {
  const { getI18nText } = useLocales('components.empty');
  return (
    <RootStyle {...other}>
      {img ? <Image
        disabledEffect
        visibleByDefault
        alt="empty content"
        src={img || 'https://minimal-assets-api.vercel.app/assets/illustrations/illustration_empty_content.svg'}
        sx={{ height: 240, mb: 3 }}
      /> : <DocIllustration sx={{ width: 1, maxWidth: 200 }} /> }
      <Typography variant="h6" gutterBottom mt={2} sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
        {title !== undefined ? title : getI18nText('noData')}
      </Typography>

      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      )}
    </RootStyle>
  );
}
