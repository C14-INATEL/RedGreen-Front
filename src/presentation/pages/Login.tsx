import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'identify' | 'login' | 'signup';

const existingEmails = ['admin@casino.com', 'player@casino.com'];

const eyeOpenIcon = (
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

const eyeClosedIcon = (
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
  const [step, setStep] = useState<Step>('identify');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const closeToast = () => setToastMessage('');

  const handleContinue = () => {
    if (!identifier.trim()) {
      setToastMessage('CAMPO OBRIGATÓRIO\nDIGITE SEU E-MAIL OU TELEFONE.');
      return;
    }

    setStep(
      existingEmails.includes(identifier.toLowerCase()) ? 'login' : 'signup'
    );
    setToastMessage('');
  };

  const handleLogin = () => {
    if (!password.trim()) {
      setToastMessage('CAMPO OBRIGATÓRIO\nDIGITE SUA SENHA.');
      return;
    }

    alert('Login realizado com sucesso!');
  };

  const handleSignup = () => {
    if (!name.trim()) {
      setToastMessage('CAMPO OBRIGATÓRIO\nDIGITE SEU NOME.');
      return;
    }

    if (!identifier.trim()) {
      setToastMessage('CAMPO OBRIGATÓRIO\nDIGITE SEU E-MAIL OU TELEFONE.');
      return;
    }

    if (!password.trim()) {
      setToastMessage('CAMPO OBRIGATÓRIO\nDIGITE SUA SENHA.');
      return;
    }

    if (!confirmPassword.trim()) {
      setToastMessage('CAMPO OBRIGATÓRIO\nCONFIRME SUA SENHA.');
      return;
    }

    if (password !== confirmPassword) {
      setToastMessage('ERRO\nAS SENHAS NÃO CONFEREM.');
      return;
    }

    if (password.length < 6) {
      setToastMessage('ERRO\nA SENHA DEVE TER PELO MENOS 6 CARACTERES.');
      return;
    }

    alert('Conta criada com sucesso!');
  };

  const resetToIdentify = () => {
    setStep('identify');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setToastMessage('');
  };

  const panelVariants = {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.97 },
  };

  return (
    <div className="min-h-screen bg-background suit-pattern relative overflow-hidden flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(150_40%_18%_/_0.5)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 'identify' && (
            <motion.div
              key="identify"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="auth-panel"
            >
              <h2 className="font-display text-lg font-semibold text-white text-center mb-1">
                Bem-vindo ao <span className="text-[hsl(0,70%,42%)]">Red</span>
                <span className="text-white">&</span>
                <span className="text-[hsl(120,50%,35%)]">Green</span> Cassino
              </h2>

              <p className="text-white/80 text-xs text-center mb-6">
                Entre ou crie sua conta para jogar
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Digite seu e-mail ou telefone"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setToastMessage('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  className="auth-input"
                />

                <button onClick={handleContinue} className="auth-button mt-4">
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {step === 'login' && (
            <motion.div
              key="login"
              variants={panelVariants}
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
                {identifier}
              </p>

              <div className="space-y-2">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setToastMessage('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="auth-input pr-12"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    aria-label={
                      showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                  >
                    {showPassword ? eyeClosedIcon : eyeOpenIcon}
                  </button>
                </div>

                <button onClick={handleLogin} className="auth-button mt-4">
                  Entrar
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <button
                  onClick={resetToIdentify}
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

          {step === 'signup' && (
            <motion.div
              key="signup"
              variants={panelVariants}
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
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setToastMessage('');
                  }}
                  className="auth-input"
                />

                <input
                  type="text"
                  placeholder="E-mail ou telefone"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setToastMessage('');
                  }}
                  className="auth-input"
                />

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setToastMessage('');
                    }}
                    className="auth-input pr-12"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    aria-label={
                      showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                  >
                    {showPassword ? eyeClosedIcon : eyeOpenIcon}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setToastMessage('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                    className="auth-input pr-12"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    aria-label={
                      showConfirmPassword
                        ? 'Ocultar confirmação de senha'
                        : 'Mostrar confirmação de senha'
                    }
                  >
                    {showConfirmPassword ? eyeClosedIcon : eyeOpenIcon}
                  </button>
                </div>

                <button onClick={handleSignup} className="auth-button mt-4">
                  Criar conta
                </button>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={resetToIdentify}
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
        {toastMessage && (
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
              onClick={closeToast}
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
              {toastMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
