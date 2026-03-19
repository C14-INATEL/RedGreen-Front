import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'identify' | 'login' | 'signup';

const existingEmails = ['admin@casino.com', 'player@casino.com'];

const Login = () => {
  const [step, setStep] = useState<Step>('identify');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleContinue = () => {
    if (!identifier.trim()) {
      setToastMessage('Campo obrigatório: Digite seu e-mail ou telefone.');
      return;
    }
    setStep(
      existingEmails.includes(identifier.toLowerCase()) ? 'login' : 'signup'
    );
    setToastMessage('');
  };

  const handleLogin = () => {
    if (!password) {
      setToastMessage('Campo obrigatório: Digite sua senha.');
      return;
    }
    alert('Login realizado com sucesso!');
  };

  const handleSignup = () => {
    if (!name.trim() || !password || !confirmPassword) {
      setToastMessage('Preencha todos os campos obrigatórios.');
      return;
    }
    if (password !== confirmPassword) {
      setToastMessage('As senhas não conferem.');
      return;
    }
    if (password.length < 6) {
      setToastMessage('A senha deve ter pelo menos 6 caracteres.');
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
                <span className="text-[hsl(120,50%,35%)]">Green</span> Casino
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

                <AnimatePresence>
                  {toastMessage && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-red-500 text-xs transition-all"
                    >
                      {toastMessage}
                    </motion.p>
                  )}
                </AnimatePresence>

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
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="auth-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>

                <AnimatePresence>
                  {toastMessage && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-red-500 text-xs transition-all"
                    >
                      {toastMessage}
                    </motion.p>
                  )}
                </AnimatePresence>

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
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input"
                />
                <input
                  type="text"
                  placeholder="E-mail ou telefone"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="auth-input"
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                    className="auth-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
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
    </div>
  );
};

export default Login;
