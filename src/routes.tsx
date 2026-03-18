import { Routes, Route } from 'react-router-dom';
import { paths } from './paths';
import Home from './presentation/pages/Home';

// Placeholder components - replace with actual pages
const Login = () => <div>Login</div>;
const Register = () => <div>Register</div>;
const Dashboard = () => <div>Dashboard</div>;
const SlotRoom = () => <div>Slot Room</div>;
const RouletteRoom = () => <div>Roulette Room</div>;

export const AppRoutes = () => (
  <Routes>
    <Route path={paths.home} element={<Home />} />
    <Route path={paths.login} element={<Login />} />
    <Route path={paths.register} element={<Register />} />
    <Route path={paths.dashboard} element={<Dashboard />} />
    <Route path={paths.slotRoom} element={<SlotRoom />} />
    <Route path={paths.rouletteRoom} element={<RouletteRoom />} />
  </Routes>
);
