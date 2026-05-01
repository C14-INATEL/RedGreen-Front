import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useId, useRef, useState } from 'react';
import {
  LogIn,
  LogOut,
  Trash2,
  UserRoundPen,
  type LucideIcon,
} from 'lucide-react';
import CassinoLogo from '@ui/CassinoLogo';
import DeleteAccountModal from '@ui/DeleteAccountModal';
import EditProfileModal from '@ui/EditProfileModal';
import type { HUDProps } from '@domain/types';

type MenuItem = {
  Label: string;
  Icon: LucideIcon;
  OnSelect: () => void;
  Tone?: 'default' | 'destructive';
};

const UserAvatar = ({ IsActive = false }: { IsActive?: boolean }) => (
  <div
    className={`relative flex h-14 w-14 items-center justify-center border-[3px] transition-colors ${
      IsActive
        ? 'border-cassino-gold bg-[#3d3110]'
        : 'border-cassino-gold/80 bg-card hover:bg-card/90'
    }`}
    style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.45)' }}
  >
    <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
      <rect x="5" y="2" width="6" height="6" fill="hsl(var(--cassino-gold))" />
      <rect x="4" y="8" width="8" height="4" fill="hsl(var(--cassino-gold))" />
      <rect x="5" y="12" width="2" height="2" fill="hsl(var(--cassino-gold))" />
      <rect x="9" y="12" width="2" height="2" fill="hsl(var(--cassino-gold))" />
    </svg>
    <div className="absolute -bottom-0.5 -left-0.5 h-3 w-3 border-2 border-background bg-accent-green" />
  </div>
);

const HUD = ({
  IsLoggedIn,
  PlayerName,
  Chips,
  OnLogin,
  OnLogout,
}: HUDProps) => {
  const [IsMenuOpen, SetIsMenuOpen] = useState(false);
  const [IsEditProfileOpen, SetIsEditProfileOpen] = useState(false);
  const [IsDeleteAccountOpen, SetIsDeleteAccountOpen] = useState(false);
  const UserMenuId = useId();
  const UserMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!IsMenuOpen) return undefined;

    const HandlePointerDown = (Event: PointerEvent) => {
      if (!UserMenuRef.current?.contains(Event.target as Node)) {
        SetIsMenuOpen(false);
      }
    };

    const HandleKeyDown = (Event: KeyboardEvent) => {
      if (Event.key === 'Escape') SetIsMenuOpen(false);
    };

    document.addEventListener('pointerdown', HandlePointerDown);
    document.addEventListener('keydown', HandleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', HandlePointerDown);
      document.removeEventListener('keydown', HandleKeyDown);
    };
  }, [IsMenuOpen]);

  const CloseMenu = () => SetIsMenuOpen(false);

  const HandleLogout = () => {
    CloseMenu();
    OnLogout();
  };

  const MenuItems: MenuItem[] = [
    {
      Label: 'Editar perfil',
      Icon: UserRoundPen,
      OnSelect: () => {
        CloseMenu();
        SetIsEditProfileOpen(true);
      },
    },
    {
      Label: 'Excluir conta',
      Icon: Trash2,
      OnSelect: () => {
        CloseMenu();
        SetIsDeleteAccountOpen(true);
      },
      Tone: 'destructive',
    },
    {
      Label: 'Sair',
      Icon: LogOut,
      OnSelect: HandleLogout,
    },
  ];

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed left-0 right-0 top-0 z-50 grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4 bg-card/80 px-4 backdrop-blur-sm md:px-6 pixel-border"
        style={{ boxShadow: '0 4px 0px rgba(0,0,0,0.8)' }}
      >
        <div className="justify-self-start">
          {IsLoggedIn ? (
            <div ref={UserMenuRef} className="relative flex items-center gap-3">
              <motion.button
                type="button"
                onClick={() => SetIsMenuOpen((CurrentValue) => !CurrentValue)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cassino-gold/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-controls={UserMenuId}
                aria-expanded={IsMenuOpen}
                aria-haspopup="menu"
                aria-label={
                  IsMenuOpen
                    ? 'Fechar menu do usuario'
                    : 'Abrir menu do usuario'
                }
                data-testid="user-menu-toggle"
              >
                <UserAvatar IsActive={IsMenuOpen} />
              </motion.button>

              <div className="hidden min-w-0 flex-col sm:flex">
                <span className="max-w-[10rem] truncate font-display text-sm font-bold text-foreground">
                  {PlayerName}
                </span>
              </div>

              <AnimatePresence>
                {IsMenuOpen && (
                  <motion.div
                    id={UserMenuId}
                    role="menu"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 top-[calc(100%+0.75rem)] z-[60] w-[min(18.5rem,calc(100vw-2rem))] overflow-hidden border-[3px] border-[#9f741b] bg-[#5e441d] text-left"
                    style={{ boxShadow: '8px 8px 0px rgba(0,0,0,0.45)' }}
                    data-testid="user-menu"
                  >
                    <div className="absolute inset-y-0 left-0 w-[4px] bg-cassino-gold" />

                    <div className="border-b border-[#9f741b]/70 bg-[#213d18] px-4 py-3">
                      <div className="flex items-center gap-4">
                        <UserAvatar />
                        <div className="min-w-0">
                          <p className="truncate font-display text-xl font-bold text-foreground">
                            {PlayerName}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      {MenuItems.map(
                        ({ Label, Icon, OnSelect, Tone = 'default' }) => {
                          const IsDestructive = Tone === 'destructive';
                          return (
                            <button
                              key={Label}
                              type="button"
                              role="menuitem"
                              onClick={OnSelect}
                              className={`flex w-full items-center gap-4 border-b border-[#9f741b]/35 px-6 py-5 text-left transition-colors last:border-b-0 ${
                                IsDestructive
                                  ? 'text-cassino-red hover:bg-[#733322]'
                                  : 'text-foreground hover:bg-[#745628]'
                              }`}
                            >
                              <Icon
                                className="h-5 w-5 shrink-0"
                                strokeWidth={2.2}
                              />
                              <span className="font-mono text-[11px] uppercase tracking-[0.25em]">
                                {Label}
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              type="button"
              onClick={OnLogin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-card/60 px-4 py-2 text-cassino-gold transition-colors hover:bg-card/80 pixel-border"
            >
              <LogIn className="h-5 w-5" />
              <span className="font-display text-sm font-bold">Entrar</span>
            </motion.button>
          )}
        </div>

        <div className="justify-self-center">
          <CassinoLogo />
        </div>

        <div className="justify-self-end">
          {IsLoggedIn && Chips != null ? (
            <div className="flex items-center gap-3 bg-card/60 px-5 py-3 pixel-border-gold">
              <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
                <rect
                  x="4"
                  y="2"
                  width="8"
                  height="2"
                  fill="hsl(var(--cassino-gold))"
                />
                <rect
                  x="2"
                  y="4"
                  width="2"
                  height="2"
                  fill="hsl(var(--cassino-gold))"
                />
                <rect
                  x="12"
                  y="4"
                  width="2"
                  height="2"
                  fill="hsl(var(--cassino-gold))"
                />
                <rect
                  x="2"
                  y="6"
                  width="12"
                  height="4"
                  fill="hsl(var(--cassino-gold))"
                />
                <rect
                  x="6"
                  y="4"
                  width="4"
                  height="8"
                  fill="hsl(var(--cassino-gold) / 0.7)"
                />
                <rect
                  x="2"
                  y="10"
                  width="2"
                  height="2"
                  fill="hsl(var(--cassino-gold))"
                />
                <rect
                  x="12"
                  y="10"
                  width="2"
                  height="2"
                  fill="hsl(var(--cassino-gold))"
                />
                <rect
                  x="4"
                  y="12"
                  width="8"
                  height="2"
                  fill="hsl(var(--cassino-gold))"
                />
                <rect
                  x="7"
                  y="5"
                  width="2"
                  height="6"
                  fill="hsl(var(--background) / 0.5)"
                />
              </svg>
              <div className="flex flex-col items-end">
                <span className="font-body text-[8px] uppercase tracking-wider text-muted-foreground">
                  Fichas
                </span>
                <span className="font-mono text-lg font-bold text-foreground">
                  {Chips.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          ) : (
            <div aria-hidden="true" className="h-10 w-10" />
          )}
        </div>
      </motion.header>

      <EditProfileModal
        IsOpen={IsEditProfileOpen}
        OnClose={() => SetIsEditProfileOpen(false)}
      />

      <DeleteAccountModal
        IsOpen={IsDeleteAccountOpen}
        OnClose={() => SetIsDeleteAccountOpen(false)}
        OnDeleted={() => {
          SetIsDeleteAccountOpen(false);
          OnLogout();
        }}
      />
    </>
  );
};

export default HUD;
