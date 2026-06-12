import { Routes, Route } from 'react-router-dom';
import { paths } from './paths';
import Login from './presentation/pages/Login';
import { GambitRoom } from './presentation/pages/GambitRoom';
import { SlotMachineRoom } from './presentation/pages/SlotMachineRoom';
import GuestRoute from './presentation/ui/GuestRoute';
import Home from './presentation/pages/Home';
import { SlotMachineTablesRoom } from './presentation/pages/SlotMachineTablesRoom';
import { SessionExpiredListener } from './presentation/ui/SessionExpiredListener';
import { GambitTablesRoom } from './presentation/pages/GambitTablesRoom';

const Dashboard = () => <div>Dashboard</div>;
const Register = () => <div>Register</div>;
const RouletteRoom = () => <div>Roulette Room</div>;

export const AppRoutes = () => (
  <>
    <SessionExpiredListener />
    <Routes>
      <Route path={paths.home} element={<Home />} />

      <Route
        path={paths.login}
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path={paths.register}
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      <Route path={paths.dashboard} element={<Dashboard />} />
      <Route path={paths.slotmachineroom} element={<SlotMachineRoom />} />
      <Route path={paths.slotmachinetables} element={<SlotMachineTablesRoom />} />
      <Route path={paths.gambitRoom} element={<GambitRoom />} />
      <Route path={paths.gambitTablesRoom} element={<GambitTablesRoom />} />
      <Route path={paths.rouletteRoom} element={<RouletteRoom />} />
    </Routes>
  </>
);
