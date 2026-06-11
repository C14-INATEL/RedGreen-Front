import { Navigate } from 'react-router-dom';
import { paths } from '../../paths';
import { getToken } from '@/presentation/ui/Cookies';

interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute = ({ children }: GuestRouteProps) => {
  const Token = getToken();

  if (Token) {
    return <Navigate to={paths.home} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
