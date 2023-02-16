import { m } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Button, Typography, Container } from '@mui/material';
import useLocales from '../hooks/useLocales';
// components
import Page from '../components/Page';
import { MotionContainer, varBounce } from '../components/animate';
// assets
import { UploadIllustration } from '../assets';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10),
}));

// ----------------------------------------------------------------------

export default function Page404() {
  const { getI18nText } = useLocales();
  return (
    <Page title="404 Page Not Found" sx={{ height: 1 }}>
      <RootStyle>
        <Container component={MotionContainer}>
          <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
            <m.div variants={varBounce().in}>
              <Typography variant="h3" paragraph>
              Sorry, No Permissions!
              </Typography>
            </m.div>
            <Typography sx={{ color: 'text.secondary' }}>
            Sorry, You are not authorized to access this page.
            </Typography>

            <m.div variants={varBounce().in}>
              <UploadIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
            </m.div>

            <Button to="/" size="large" variant="contained" component={RouterLink}>
              {getI18nText('backToHome', 'button')}
            </Button>
          </Box>
        </Container>
      </RootStyle>
    </Page>
  );
}
