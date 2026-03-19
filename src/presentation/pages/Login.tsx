const Login = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden suit-pattern flex items-center justify-center">
      
      {/* BACKGROUND */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(150 35% 16% / 0.6) 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute bottom-0 left-0 right-0 h-20"
        style={{
          background:
            "linear-gradient(to top, hsl(210 40% 2% / 0.4), transparent)",
        }}
      />
<div className="auth-panel">
</div>
    </div>
  );
};

export default Login;