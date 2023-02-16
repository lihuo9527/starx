import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Link, Typography } from '@mui/material';
import { fDateTime } from '../../../utils/formatTime';
// hooks
import useLocales from '../../../hooks/useLocales';
import useAuth from '../../../hooks/useAuth';
// routes
// components
import MyAvatar from '../../../components/MyAvatar';
import * as api from '../../../services/api-client';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: theme.palette.grey[500_12],
  transition: theme.transitions.create('opacity', {
    duration: theme.transitions.duration.shorter,
  }),
}));

// ----------------------------------------------------------------------

NavbarAccount.propTypes = {
  isCollapse: PropTypes.bool,
};

export default function NavbarAccount({ isCollapse }) {
  const { user } = useAuth();
  const { getI18nText } = useLocales('layouts.dashboard.navbar');

  return (
    <Link underline="none" color="inherit" >
      <RootStyle
        sx={{
          ...(isCollapse && {
            bgcolor: 'transparent',
          }),
        }}
      >
        <MyAvatar />

        <Box
          sx={{
            ml: 2,
            transition: (theme) =>
              theme.transitions.create('width', {
                duration: theme.transitions.duration.shorter,
              }),
            ...(isCollapse && {
              ml: 0,
              width: 0,
            }),
          }}
        >
          <Typography variant="subtitle2" noWrap>
            {user?.name}
          </Typography>
          {/* <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            识别码：{user?.identificationCode}
          </Typography>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            会员等级：{user?.memberLeave}
          </Typography> */}
        </Box>
      </RootStyle>
    </Link>
  );
}
