import { Suspense, lazy } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';
// layouts
// import MainLayout from 'src/layouts/main';
import DashboardLayout from 'src/layouts/dashboard';
import LogoOnlyLayout from 'src/layouts/LogoOnlyLayout';
import { PATH_AFTER_LOGIN } from 'src/config';
// components
import LoadingScreen from 'src/components/LoadingScreen';


// ----------------------------------------------------------------------

const Loadable = (Component) => (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();

  return (
    <Suspense fallback={<LoadingScreen isDashboard={pathname.includes('/dashboard')} />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: 'auth',
      children: [
        { path: 'login', element: (<Login />) }],
    },
    {
      path: '/',
      element: (
        <DashboardLayout />
      ),
      children: [
        { path: '', element: <Navigate to="/appointment-information" replace /> },
        { path: 'appointment-information', element: <AppointmentInformation /> },
        { path: 'inventory-manage', element: <InventoryManage /> },
        { path: 'shelf-manage', element: <ShelfManage /> },
        { path: 'order-manege', element: <OrderManege /> },
        { path: 'user-info', element: <UserInfo /> },
        { path: 'user-bill', element: <BillInfo /> },
        { path: 'work-order', element: <WorkOrder /> },
      ],
    },
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: '500', element: <Page500 /> },
        { path: '404', element: <NotFound /> },
        { path: '403', element: <Forbidden /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

// IMPORT COMPONENTS

// Authentication
const Login = Loadable(lazy(() => import('src/pages/auth/Login')));
const AppointmentInformation = Loadable(lazy(() => import('src/pages/appointmentInfo/appointmentInfo')));
const InventoryManage = Loadable(lazy(() => import('src/pages/InventoryManage/InventoryManage')));
const ShelfManage = Loadable(lazy(() => import('src/pages/shelfManage/shelfManage')));
const OrderManege = Loadable(lazy(() => import('src/pages/orderManage/orderManage')));
const UserInfo = Loadable(lazy(() => import('src/pages/userInfo/userInfo')));
const WorkOrder = Loadable(lazy(() => import('src/pages/workOrder/workOrder')));
const BillInfo = Loadable(lazy(() => import('src/pages/billInfo/billInfo')));
const Page500 = Loadable(lazy(() => import('src/pages/Page500')));
const NotFound = Loadable(lazy(() => import('src/pages/Page404')));
const Forbidden = Loadable(lazy(() => import('src/pages/Page403')));
