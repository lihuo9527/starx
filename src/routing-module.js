import { Suspense, lazy } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';

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
            path: 'account',
            
        }
    ])
}