export interface HUDProps {
  IsLoggedIn: boolean;
  PlayerName: string;
  Chips?: number;
  OnLogin: () => void;
  OnLogout: () => void;
}
