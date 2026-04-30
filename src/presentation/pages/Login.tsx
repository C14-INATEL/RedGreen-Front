import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CassinoLogo from '@ui/CassinoLogo';
import { IsBirthDateFormatValid, IsValidBirthDate } from '../../validators';

type Step = 'identify' | 'login' | 'signup';

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

const Login = () => {
  const [Step, SetStep] = useState<Step>('identify');
  const [Identifier, SetIdentifier] = useState('');
  const [Password, SetPassword] = useState('');
  const [ConfirmPassword, SetConfirmPassword] = useState('');
  const [Name, SetName] = useState('');
  const [Nickname, SetNickname] = useState('');
  const [BirthDate, SetBirthDate] = useState('');
  const [ToastMessage, SetToastMessage] = useState('');
  const [ShowPassword, SetShowPassword] = useState(false);
  const [ShowConfirmPassword, SetShowConfirmPassword] = useState(false);

  const CloseToast = () => SetToastMessage('');

  const IsValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const HandleContinue = async () => {
    const Email = Identifier.trim().toLowerCase();

    if (!Email) {
      SetToastMessage('CAMPO OBRIGATÓRIO\nINSIRA SEU EMAIL.');
      return;
    }

    if (!IsValidEmail(Email)) {
      SetToastMessage('ERRO\nPOR FAVOR, INSIRA UM EMAIL VÁLIDO.');
      return;
    }

    try {
      const url = `http://localhost:3000/auth/check-email?email=${encodeURIComponent(Email)}`;
      console.log('URL:', url);

      const Response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      console.log('STATUS:', Response.status);

      const Data = await Response.json();
      console.log('DATA:', Data);

      if (!Response.ok) {
        SetToastMessage('ERRO AO VERIFICAR EMAIL.');
        return;
      }

      const EmailTaken = Data?.taken;

      if (EmailTaken === true) {
        SetStep('login');
        SetToastMessage('');
        return;
      }

      if (EmailTaken === false) {
        SetStep('signup');
        SetToastMessage('');
        return;
      }
    } catch (error) {
      console.error('ERROR CHECKING EMAIL:', error);
      SetToastMessage('ERRO AO CONECTAR AO SERVIDOR.');
    }
  };

  const HandleLogin = async () => {
    try {
      if (!Identifier || !Password) {
        SetToastMessage('CAMPO OBRIGATÓRIO\nINSIRA SUA SENHA.');
        return;
      }

      const Response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          Email: Identifier,
          Password: Password,
        }),
      });

      const Data = await Response.json();
      console.log('LOGIN DATA:', Data);

      if (!Response.ok) {
        SetToastMessage('SENHA INVÁLIDA.');
        return;
      }

      const Token = Data?.Token;
      const User = Data?.User;

      if (Token) {
        localStorage.setItem('token', Token);
        localStorage.setItem('authToken', Token);
      }

      if (User) {
        localStorage.setItem('user', JSON.stringify(User));
      }

      SetToastMessage('');
      window.location.href = '/';
    } catch (error) {
      console.error('ERROR LOGGING IN:', error);
      SetToastMessage('ERRO AO CONECTAR AO SERVIDOR.');
    }
  };

  const HandleSignup = async () => {
    if (!Name.trim()) {
      SetToastMessage('CAMPO OBRIGATÓRIO\nINSIRA SEU NOME.');
      return;
    }

    if (!Nickname.trim()) {
      SetToastMessage('CAMPO OBRIGATÓRIO\nINSIRA SEU NICKNAME.');
      return;
    }

    if (!BirthDate.trim()) {
      SetToastMessage('CAMPO OBRIGATÓRIO\nINSIRA SUA DATA DE NASCIMENTO.');
      return;
    }

    if (!IsBirthDateFormatValid(BirthDate)) {
      SetToastMessage('ERRO\nFORMATO: DD/MM/YYYY');
      return;
    }

    if (!IsValidBirthDate(BirthDate)) {
      SetToastMessage('ERRO\nDATA INVÁLIDA.');
      return;
    }

    if (!Identifier.trim()) {
      SetToastMessage('CAMPO OBRIGATÓRIO\nINSIRA SEU EMAIL.');
      return;
    }

    if (!IsValidEmail(Identifier.trim().toLowerCase())) {
      SetToastMessage('ERRO\nPOR FAVOR, INSIRA UM EMAIL VÁLIDO.');
      return;
    }

    if (!Password.trim()) {
      SetToastMessage('CAMPO OBRIGATÓRIO\nINSIRA SUA SENHA.');
      return;
    }

    if (!ConfirmPassword.trim()) {
      SetToastMessage('CAMPO OBRIGATÓRIO\nCONFIRME SUA SENHA.');
      return;
    }

    if (Password !== ConfirmPassword) {
      SetToastMessage('ERRO\nAS SENHAS NÃO COINCIDEM.');
      return;
    }

    if (Password.length < 8) {
      SetToastMessage('ERRO\nA SENHA DEVE TER PELO MENOS 8 CARACTERES.');
      return;
    }

    try {
      const [day, month, year] = BirthDate.split('/');
      const FormattedBirthDate = `${year}-${month}-${day}`;

      const Response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Name: Name,
          BirthDate: FormattedBirthDate,
          Nickname: Nickname,
          Email: Identifier.trim().toLowerCase(),
          Password: Password,
          ChipBalance: 10000,
          DailyLoginStreak: 0,
          Active: true,
          UserType: 'User',
        }),
      });

      const Data = await Response.json();

      if (!Response.ok) {
        SetToastMessage(Data.message || 'ERRO AO CRIAR CONTA.');
        return;
      }

      SetToastMessage('');
      SetStep('login');
    } catch {
      SetToastMessage('ERRO AO CONECTAR AO SERVIDOR.');
    }
  };

  const ResetToIdentify = () => {
    SetStep('identify');
    SetIdentifier('');
    SetPassword('');
    SetConfirmPassword('');
    SetName('');
    SetNickname('');
    SetBirthDate('');
    SetShowPassword(false);
    SetShowConfirmPassword(false);
    SetToastMessage('');
  };

  const PanelVariants = {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.97 },
  };

  return (
    <div className="min-h-screen bg-background suit-pattern relative overflow-hidden flex items-center justify-center px-4">
      <button
        onClick={() => (window.location.href = '/')}
        className="back-button"
      >
        ← Voltar
      </button>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(150_40%_18%_/_0.5)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <CassinoLogo />
        </div>
        <AnimatePresence mode="wait">
          {Step === 'identify' && (
            <motion.div
              key="identify"
              variants={PanelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="auth-panel"
            >
              <h2 className="font-display text-lg font-semibold text-white text-center mb-1">
                Bem-vindo ao <span className="text-[hsl(0,70%,42%)]">Red</span>
                <span className="text-cassino-gold">&</span>
                <span className="text-[hsl(120,50%,35%)]">Green</span> Cassino
              </h2>

              <p className="text-white/80 text-xs text-center mb-6">
                Entre ou crie sua conta para jogar
              </p>

              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={Identifier}
                  onChange={(e) => {
                    SetIdentifier(e.target.value);
                    SetToastMessage('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && HandleContinue()}
                  className="auth-input"
                />

                <button onClick={HandleContinue} className="auth-button mt-4">
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {Step === 'login' && (
            <motion.div
              key="login"
              variants={PanelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="auth-panel"
            >
              <h2 className="font-display text-lg font-semibold text-white text-center mb-1">
                Digite sua senha
              </h2>

              <p className="text-white/80 text-xs text-center mb-6">
                {Identifier}
              </p>

              <div className="space-y-2">
                <div className="relative">
                  <input
                    type={ShowPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={Password}
                    onChange={(e) => {
                      SetPassword(e.target.value);
                      SetToastMessage('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && HandleLogin()}
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

                <button onClick={HandleLogin} className="auth-button mt-4">
                  Entrar
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <button
                  onClick={ResetToIdentify}
                  className="text-[hsl(120,50%,35%)]/70 hover:text-[hsl(120,50%,35%)] transition-colors flex items-center gap-1"
                >
                  ← Usar outra conta
                </button>

                <button className="text-white/50 hover:text-white transition-colors">
                  Esqueci minha senha
                </button>
              </div>
            </motion.div>
          )}

          {Step === 'signup' && (
            <motion.div
              key="signup"
              variants={PanelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="auth-panel"
            >
              <h2 className="font-display text-lg font-semibold text-white text-center mb-1">
                Criar conta
              </h2>

              <p className="text-white/80 text-xs text-center mb-6">
                Preencha seus dados para começar
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nome"
                  value={Name}
                  onChange={(e) => {
                    SetName(e.target.value);
                    SetToastMessage('');
                  }}
                  className="auth-input"
                />

                <input
                  type="text"
                  placeholder="Nickname"
                  value={Nickname}
                  onChange={(e) => {
                    SetNickname(e.target.value);
                    SetToastMessage('');
                  }}
                  className="auth-input"
                />

                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={BirthDate}
                  onChange={(e) => {
                    const RawValue = e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 8);

                    let FormattedValue = RawValue;

                    if (RawValue.length > 2 && RawValue.length <= 4) {
                      FormattedValue = `${RawValue.slice(0, 2)}/${RawValue.slice(2)}`;
                    } else if (RawValue.length > 4) {
                      FormattedValue = `${RawValue.slice(0, 2)}/${RawValue.slice(2, 4)}/${RawValue.slice(4)}`;
                    }

                    SetBirthDate(FormattedValue);
                    SetToastMessage('');
                  }}
                  inputMode="numeric"
                  maxLength={10}
                  className="auth-input"
                />

                <input
                  type="email"
                  placeholder="E-mail"
                  value={Identifier}
                  onChange={(e) => {
                    SetIdentifier(e.target.value);
                    SetToastMessage('');
                  }}
                  className="auth-input"
                />

                <div className="relative">
                  <input
                    type={ShowPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={Password}
                    onChange={(e) => {
                      SetPassword(e.target.value);
                      SetToastMessage('');
                    }}
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

                <div className="relative">
                  <input
                    type={ShowConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirmar senha"
                    value={ConfirmPassword}
                    onChange={(e) => {
                      SetConfirmPassword(e.target.value);
                      SetToastMessage('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && HandleSignup()}
                    className="auth-input pr-12"
                  />

                  <button
                    type="button"
                    onClick={() => SetShowConfirmPassword(!ShowConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    aria-label={
                      ShowConfirmPassword
                        ? 'Ocultar confirmação de senha'
                        : 'Mostrar confirmação de senha'
                    }
                  >
                    {ShowConfirmPassword ? EyeClosedIcon : EyeOpenIcon}
                  </button>
                </div>

                <button onClick={HandleSignup} className="auth-button mt-4">
                  Criar conta
                </button>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={ResetToIdentify}
                  className="text-xs text-white/50 hover:text-white transition-colors"
                >
                  Já possui uma conta?{' '}
                  <span className="text-[hsl(120,50%,35%)]/70">Entrar</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/30 text-[10px] mt-8 font-display uppercase tracking-widest"
        >
          ♠ &nbsp; Jogue com Responsabilidade &nbsp; ♠
        </motion.p>
      </div>

      <AnimatePresence>
        {ToastMessage && (
          <motion.div
            initial={{ opacity: 0, x: 80, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 80, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[390px] max-w-[calc(100vw-2rem)] border-[3px] border-[#ff6b6b] bg-[#ff2b2b] px-6 py-5 text-white shadow-[8px_8px_0px_#000000]"
            style={{
              borderRadius: 0,
              imageRendering: 'pixelated',
            }}
          >
            <button
              onClick={CloseToast}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center border-2 border-transparent text-[10px] text-white hover:border-white/40"
              style={{
                borderRadius: 0,
                imageRendering: 'pixelated',
              }}
              aria-label="Fechar aviso"
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
    </div>
  );
};

export default Login;
