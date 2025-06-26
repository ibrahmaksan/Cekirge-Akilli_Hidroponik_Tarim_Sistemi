import { useState, useEffect } from 'react';

const images = [
  '/src/assets/hidro-1.jpg',
  '/src/assets/hidro-2.jpg'
];

function ImageSlider({ children, showFooter = true }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIdx(i => (i + 1) % images.length), 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        minHeight: 'calc(100vh - 72px)',
        height: 'auto',
        zIndex: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundImage: `url(${images[idx]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.7s',
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100%',
          minHeight: 'calc(100vh - 72px)',
          background: 'linear-gradient(120deg,rgba(36,36,36,0.35) 0%,rgba(67,233,123,0.10) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      {/* İçerik ve footer */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100vw',
          minHeight: 'calc(100vh - 72px)',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
        {showFooter && (
          <footer
            style={{
              width: '100vw',
              background: 'rgba(36,36,36,0.65)',
              color: '#fff',
              textAlign: 'center',
              padding: '18px 0 10px 0',
              fontSize: '1.05rem',
              fontWeight: 500,
              letterSpacing: '0.5px',
              position: 'absolute',
              left: 0,
              bottom: 0,
              zIndex: 3,
              boxShadow: '0 -2px 16px #23252633',
            }}
          >
            © {new Date().getFullYear()} Çekirge | Tüm hakları saklıdır.
          </footer>
        )}
      </div>
    </div>
  );
}

export default ImageSlider;
