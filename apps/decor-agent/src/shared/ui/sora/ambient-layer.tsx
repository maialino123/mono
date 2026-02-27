export function AmbientLayer() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Orb 1 - Mint */}
      <div
        className="absolute rounded-full opacity-80"
        style={{
          width: '80vw',
          height: '80vw',
          background: 'radial-gradient(circle, var(--sora-mint, #C4E6D4), transparent 70%)',
          top: '-20%',
          left: '-20%',
          filter: 'blur(60px)',
          animation: 'sora-float 20s infinite ease-in-out alternate',
        }}
      />

      {/* Orb 2 - Lavender */}
      <div
        className="absolute rounded-full opacity-80"
        style={{
          width: '70vw',
          height: '70vw',
          background: 'radial-gradient(circle, var(--sora-lavender, #D8CDF0), transparent 70%)',
          bottom: '-10%',
          right: '-20%',
          filter: 'blur(60px)',
          animation: 'sora-float 25s infinite ease-in-out alternate',
          animationDelay: '-5s',
        }}
      />

      {/* Orb 3 - Blue */}
      <div
        className="absolute rounded-full opacity-80"
        style={{
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, var(--sora-blue, #C6DDF0), transparent 70%)',
          top: '40%',
          left: '30%',
          filter: 'blur(60px)',
          animation: 'sora-float 18s infinite ease-in-out alternate',
          animationDelay: '-10s',
        }}
      />

      {/* Blur Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(214, 207, 199, 0.3)',
          backdropFilter: 'blur(80px)',
          WebkitBackdropFilter: 'blur(80px)',
        }}
      />
    </div>
  );
}
