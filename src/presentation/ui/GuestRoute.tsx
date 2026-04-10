import { Navigate } from 'react-router-dom';
import { paths } from '../../paths';

interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute = ({ children }: GuestRouteProps) => {
  const Token = localStorage.getItem('authToken');

  if (Token) {
    return <Navigate to={paths.home} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
