import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { IsBirthDateFormatValid, IsValidBirthDate } from '../../validators';
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

interface EditProfileModalProps {
  IsOpen: boolean;
  OnClose: () => void;
  OnSuccess?: () => void;
}

const FormatDateToBR = (IsoDate: string): string => {
  if (!IsoDate) return '';
  const Match = IsoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!Match) return '';
  return `${Match[3]}/${Match[2]}/${Match[1]}`;
};

const FormatDateToISO = (BrDate: string): string => {
  const [Day, Month, Year] = BrDate.split('/');
  return `${Year}-${Month}-${Day}`;
};

const EditProfileModal = ({ IsOpen, OnClose, OnSuccess }: EditProfileModalProps) => {
  const StoredUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') ?? '{}');
    } catch {
      return {};
    }
  })();

  const [Name, SetName] = useState<string>(StoredUser.Name ?? '');
  const [BirthDate, SetBirthDate] = useState<string>(
    FormatDateToBR(StoredUser.BirthDate ?? '')
  );
  const [Password, SetPassword] = useState('');
  const [ConfirmPassword, SetConfirmPassword] = useState('');
  const [ShowPassword, SetShowPassword] = useState(false);
  const [ShowConfirmPassword, SetShowConfirmPassword] = useState(false);
  const [IsLoading, SetIsLoading] = useState(false);
  const [ToastMessage, SetToastMessage] = useState('');
  const [SuccessMessage, SetSuccessMessage] = useState('');

  const CloseToast = () => SetToastMessage('');

  const HandleClose = () => {
    SetToastMessage('');
    SetSuccessMessage('');
    SetPassword('');
    SetConfirmPassword('');
    OnClose();
  };

  const HandleSubmit = async () => {
    if (!Name.trim()) {
      SetToastMessage('REQUIRED FIELD\nENTER YOUR NAME.');
      return;
    }

    if (!BirthDate.trim()) {
      SetToastMessage('REQUIRED FIELD\nENTER YOUR BIRTH DATE.');
      return;
    }

    if (!IsBirthDateFormatValid(BirthDate)) {
      SetToastMessage('ERROR\nFORMAT: DD/MM/YYYY');
      return;
    }

    if (!IsValidBirthDate(BirthDate)) {
      SetToastMessage('ERROR\nINVALID DATE.');
      return;
    }

    if (Password && Password.length < 8) {
      SetToastMessage('ERROR\nPASSWORD MUST BE AT LEAST 8 CHARACTERS.');
      return;
    }

    if (Password && Password !== ConfirmPassword) {
      SetToastMessage('ERROR\nPASSWORDS DO NOT MATCH.');
      return;
    }

    if (ConfirmPassword && !Password) {
      SetToastMessage('ERROR\nENTER YOUR NEW PASSWORD.');
      return;
    }

    SetIsLoading(true);
    SetToastMessage('');
    SetSuccessMessage('');

    try {
      const Payload: Record<string, string> = {
        Name: Name.trim(),
        BirthDate: FormatDateToISO(BirthDate),
      };

      if (Password) {
        Payload.Password = Password;
      }

      const Response = await apiClient.patch('/user', Payload);

      const UpdatedUser = { ...StoredUser, ...Response.data };
      localStorage.setItem('user', JSON.stringify(UpdatedUser));

      SetSuccessMessage('PROFILE UPDATED SUCCESSFULLY!');
      SetPassword('');
      SetConfirmPassword('');

      if (OnSuccess) OnSuccess();

      setTimeout(() => {
        OnClose();
      }, 1000);
    } catch (Err) {
      const ErrorMessage =
        (Err as { message?: string })?.message ?? 'ERROR UPDATING PROFILE.';
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
              className="pointer-events-auto w-full max-w-md"
            >
              <div className="auth-panel relative">
                <button
                  onClick={HandleClose}
                  className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                <h2 className="font-display text-lg font-semibold text-white text-center mb-1">
                  Edit Profile
                </h2>
                <p className="text-white/80 text-xs text-center mb-6">
                  Nickname cannot be changed
                </p>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nickname"
                    value={StoredUser.Nickname ?? ''}
                    disabled
                    className="auth-input opacity-40 cursor-not-allowed"
                  />

                  <input
                    type="text"
                    placeholder="Name"
                    value={Name}
                    onChange={(e) => {
                      SetName(e.target.value);
                      SetToastMessage('');
                      SetSuccessMessage('');
                    }}
                    className="auth-input"
                  />

                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={BirthDate}
                    onChange={(e) => {
                      const RawValue = e.target.value.replace(/\D/g, '').slice(0, 8);
                      let FormattedValue = RawValue;
                      if (RawValue.length > 2 && RawValue.length <= 4) {
                        FormattedValue = `${RawValue.slice(0, 2)}/${RawValue.slice(2)}`;
                      } else if (RawValue.length > 4) {
                        FormattedValue = `${RawValue.slice(0, 2)}/${RawValue.slice(2, 4)}/${RawValue.slice(4)}`;
                      }
                      SetBirthDate(FormattedValue);
                      SetToastMessage('');
                      SetSuccessMessage('');
                    }}
                    inputMode="numeric"
                    maxLength={10}
                    className="auth-input"
                  />

                  <div className="relative">
                    <input
                      type={ShowPassword ? 'text' : 'password'}
                      placeholder="New password (optional)"
                      value={Password}
                      onChange={(e) => {
                        SetPassword(e.target.value);
                        SetToastMessage('');
                        SetSuccessMessage('');
                      }}
                      className="auth-input pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => SetShowPassword(!ShowPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                      aria-label={ShowPassword ? 'Hide password' : 'Show password'}
                    >
                      {ShowPassword ? EyeClosedIcon : EyeOpenIcon}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={ShowConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={ConfirmPassword}
                      onChange={(e) => {
                        SetConfirmPassword(e.target.value);
                        SetToastMessage('');
                        SetSuccessMessage('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && HandleSubmit()}
                      className="auth-input pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => SetShowConfirmPassword(!ShowConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                      aria-label={ShowConfirmPassword ? 'Hide confirmation' : 'Show confirmation'}
                    >
                      {ShowConfirmPassword ? EyeClosedIcon : EyeOpenIcon}
                    </button>
                  </div>

                  {SuccessMessage && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-[10px] uppercase tracking-widest text-[hsl(120,50%,45%)]"
                      style={{ fontFamily: '"Press Start 2P", "Courier New", monospace' }}
                    >
                      {SuccessMessage}
                    </motion.p>
                  )}

                  <button
                    onClick={HandleSubmit}
                    disabled={IsLoading}
                    className="auth-button mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {IsLoading ? 'Saving...' : 'Save changes'}
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
                  aria-label="Close"
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

export default EditProfileModal;