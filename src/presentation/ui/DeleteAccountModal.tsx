import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { apiClient } from '@infrastructure/http/client';

const EyeOpenIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    className="pointer-events-none"
    style={{ shapeRendering: 'crispEdges' }}
  >
    <path
      d="M2 12C3.8 9 7 6 12 6C17 6 20.2 9 22 12C20.2 15 17 18 12 18C7 18 3.8 15 2 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <rect x="10" y="10" width="4" height="4" fill="currentColor" />
  </svg>
);

const EyeClosedIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    className="pointer-events-none"
    style={{ shapeRendering: 'crispEdges' }}
  >
    <path
      d="M2 12C3.8 9 7 6 12 6C17 6 20.2 9 22 12C20.2 15 17 18 12 18C7 18 3.8 15 2 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <rect x="10" y="10" width="4" height="4" fill="currentColor" />
    <path
      d="M4 20L20 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  </svg>
);

interface DeleteAccountModalProps {
  IsOpen: boolean;
  OnClose: () => void;
  OnDeleted: () => void;
}

const DeleteAccountModal = ({
  IsOpen,
  OnClose,
  OnDeleted,
}: DeleteAccountModalProps) => {
  const [Password, SetPassword] = useState('');
  const [ShowPassword, SetShowPassword] = useState(false);
  const [IsLoading, SetIsLoading] = useState(false);
  const [ToastMessage, SetToastMessage] = useState('');

  const CloseToast = () => SetToastMessage('');

  const HandleClose = () => {
    SetPassword('');
    SetShowPassword(false);
    SetToastMessage('');
    OnClose();
  };

  const HandleDelete = async () => {
    if (!Password.trim()) {
      SetToastMessage('CAMPO OBRIGATORIO\nINFORME SUA SENHA.');
      return;
    }

    SetIsLoading(true);
    SetToastMessage('');

    try {
      await apiClient.delete('/user');

      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('dailyLoginSnapshot');

      OnDeleted();
    } catch (Err) {
      const ErrorMessage =
        (Err as { message?: string })?.message ?? 'ERRO AO EXCLUIR CONTA.';
      SetToastMessage(ErrorMessage.toUpperCase());
    } finally {
      SetIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {IsOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70"
            onClick={HandleClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-auto w-full max-w-sm"
            >
              <div className="auth-panel relative">
                <button
                  onClick={HandleClose}
                  className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="mb-4 flex justify-center">
                  <svg width="40" height="40" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="6"
                      y="1"
                      width="4"
                      height="2"
                      fill="hsl(var(--cassino-red))"
                    />
                    <rect
                      x="2"
                      y="3"
                      width="12"
                      height="2"
                      fill="hsl(var(--cassino-red))"
                    />
                    <rect
                      x="3"
                      y="5"
                      width="2"
                      height="9"
                      fill="hsl(var(--cassino-red))"
                    />
                    <rect
                      x="11"
                      y="5"
                      width="2"
                      height="9"
                      fill="hsl(var(--cassino-red))"
                    />
                    <rect
                      x="5"
                      y="5"
                      width="2"
                      height="9"
                      fill="hsl(var(--cassino-red) / 0.6)"
                    />
                    <rect
                      x="9"
                      y="5"
                      width="2"
                      height="9"
                      fill="hsl(var(--cassino-red) / 0.6)"
                    />
                    <rect
                      x="3"
                      y="14"
                      width="10"
                      height="1"
                      fill="hsl(var(--cassino-red))"
                    />
                  </svg>
                </div>

                <h2 className="font-display text-lg font-semibold text-white text-center mb-1">
                  Excluir conta
                </h2>
                <p className="text-white/60 text-xs text-center mb-6 leading-5">
                  Esta acao e permanente e nao pode ser desfeita.
                  <br />
                  Informe sua senha para confirmar.
                </p>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={ShowPassword ? 'text' : 'password'}
                      placeholder="Senha"
                      value={Password}
                      onChange={(e) => {
                        SetPassword(e.target.value);
                        SetToastMessage('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && HandleDelete()}
                      className="auth-input pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => SetShowPassword(!ShowPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                      aria-label={
                        ShowPassword ? 'Ocultar senha' : 'Mostrar senha'
                      }
                    >
                      {ShowPassword ? EyeClosedIcon : EyeOpenIcon}
                    </button>
                  </div>

                  <button
                    onClick={HandleDelete}
                    disabled={IsLoading}
                    className="w-full border-2 border-cassino-red/60 bg-cassino-red/20 py-4 font-display text-sm uppercase tracking-[0.2em] text-cassino-red transition-all shadow-[3px_3px_0px_rgba(0,0,0,0.4)] hover:bg-cassino-red/30 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {IsLoading ? 'Excluindo...' : 'Excluir conta'}
                  </button>

                  <button
                    onClick={HandleClose}
                    disabled={IsLoading}
                    className="w-full border-2 border-border/20 bg-secondary/40 py-3 font-display text-xs uppercase tracking-[0.2em] text-muted-foreground transition-all hover:bg-secondary/60 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {ToastMessage && (
              <motion.div
                initial={{ opacity: 0, x: 80, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 80, y: 20 }}
                transition={{ duration: 0.2 }}
                className="fixed bottom-6 right-6 z-[70] w-[390px] max-w-[calc(100vw-2rem)] border-[3px] border-[#ff6b6b] bg-[#ff2b2b] px-6 py-5 text-white shadow-[8px_8px_0px_#000000]"
                style={{ borderRadius: 0, imageRendering: 'pixelated' }}
              >
                <button
                  onClick={CloseToast}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center border-2 border-transparent text-[10px] text-white hover:border-white/40"
                  style={{ borderRadius: 0, imageRendering: 'pixelated' }}
                  aria-label="Fechar"
                >
                  X
                </button>
                <p
                  className="whitespace-pre-line uppercase text-[9px] leading-6 tracking-[0.18em]"
                  style={{
                    fontFamily: '"Press Start 2P", "Courier New", monospace',
                    textTransform: 'uppercase',
                    imageRendering: 'pixelated',
                  }}
                >
                  {ToastMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeleteAccountModal;
