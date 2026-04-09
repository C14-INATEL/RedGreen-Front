import { Navigate } from 'react-router-dom';
import { paths } from '../../paths';

interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute = ({ children }: GuestRouteProps) => {
  const token = localStorage.getItem('authToken');

  if (token) {
    return <Navigate to={paths.home} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
