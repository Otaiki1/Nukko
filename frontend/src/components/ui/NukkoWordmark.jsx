export default function NukkoWordmark({ size = 48, style = {} }) {
  return (
    <div style={{
      fontFamily: '"Fredoka", "Nunito", system-ui, sans-serif',
      fontWeight: 700,
      fontSize: size,
      letterSpacing: '0.06em',
      lineHeight: 1,
      background: 'linear-gradient(135deg, #fff 0%, #ffd700 50%, #00d4ff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      filter: 'drop-shadow(0 0 20px rgba(123,47,255,0.5))',
      ...style,
    }}>
      NUKKO
    </div>
  );
}
