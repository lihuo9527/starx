import { memo, useEffect, useState } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { Container, AppBar } from '@mui/material';
import useAuth from '../../../hooks/useAuth';
// config
import { HEADER } from '../../../config';
// components
import { NavSectionHorizontal } from '../../../components/nav-section';
import SvgIconStyle from '../../../components/SvgIconStyle';
//

// ----------------------------------------------------------------------

const RootStyle = styled(AppBar)(({ theme }) => ({
  transition: theme.transitions.create('top', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  width: '100%',
  position: 'fixed',
  zIndex: theme.zIndex.appBar,
  padding: theme.spacing(1, 0),
  boxShadow: theme.customShadows.z8,
  top: HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT,
  backgroundColor: theme.palette.background.default,
}));

const getIcon = (name) => <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const ICONS = {
  blog: getIcon('ic_blog'),
  cart: getIcon('ic_cart'),
  chat: getIcon('ic_chat'),
  mail: getIcon('ic_mail'),
  user: getIcon('ic_user'),
  clock: getIcon('ic_clock'),
  kanban: getIcon('ic_kanban'),
  banking: getIcon('ic_banking'),
  calendar: getIcon('ic_calendar'),
  ecommerce: getIcon('ic_ecommerce'),
  analytics: getIcon('ic_analytics'),
  dashboard: getIcon('ic_dashboard'),
  booking: getIcon('ic_booking'),
  file: getIcon('ic_file'),
  archive: getIcon('ic_archive'),
  agenda: getIcon('ic_view-agenda'),
};
// ----------------------------------------------------------------------

function NavbarHorizontal() {
  // const { user, isSub } = useAuth();

  const [menus, setMenus] = useState([
    {
      subheader: 'management',
      items: [
        // MANAGEMENT : USER
        {
          title: '预约信息',
          path: 'appointment-information',
          icon: ICONS.clock,
        },
        // MANAGEMENT : E-COMMERCE
        {
          title: '库存管理',
          path: 'inventory-manage',
          icon: ICONS.archive,
        },
        {
          title: '货架管理',
          path: 'shelf-manage',
          icon: ICONS.agenda,
        },
        {
          title: '订单管理',
          path: 'order-manege',
          icon: ICONS.cart,
        },
        {
          title: '用户资料',
          path: '/user',
          icon: ICONS.user,
          children: [
            {
              title: '用户信息',
              path: 'user-info',
            },
            {
              title: '账单信息',
              path: 'user-bill',
            }
          ]
        },
        {
          title: '我的工单',
          path: 'work-order',
          icon: ICONS.file,
        },
      ]
    },
  ]);
  // useEffect(() => {
  //   if (user) {
  //     setMenus(getAuthNav(isSub, user.menus));
  //   }
  // }, [user, isSub]);

  return (
    <RootStyle>
      <Container maxWidth={false}>
        <NavSectionHorizontal navConfig={menus} />
      </Container>
    </RootStyle>
  );
}

export default memo(NavbarHorizontal);
