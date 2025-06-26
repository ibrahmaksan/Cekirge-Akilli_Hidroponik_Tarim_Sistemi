import { useState, useEffect } from 'react';
import './App.css';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/pages/Dashboard';
import Profile from './components/pages/Profile';
import Advice from './components/pages/Advice';
import Contact from './components/pages/Contact';
import Devices from './components/pages/Devices';
import ImageSlider from './components/ImageSlider';

function Navbar({ isLoggedIn, onLogout, onLoginClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="navbar-agro">
      <div className="navbar-logo-title">
        <img src="/src/assets/cekirge-logo.jpg" alt="Cekirge Logo" className="navbar-logo" />
        <span className="navbar-title">Cekirge</span>
      </div>
      
      {/* Desktop Menu */}
      <nav className="navbar-menu desktop-menu">
        <Link to="/" className="navbar-link">🏠 Anasayfa</Link>
        {isLoggedIn && <Link to="/devices" className="navbar-link">📱 Cihazlarım</Link>}
        {isLoggedIn && <Link to="/advice" className="navbar-link">💡 Tavsiyeler</Link>}
        <Link to="/contact" className="navbar-link">📞 İletişim</Link>
        {!isLoggedIn && (
          <button className="navbar-login-btn" onClick={onLoginClick}>
            🔐 Giriş Yap
          </button>
        )}
        {isLoggedIn && (
          <button className="navbar-login-btn" onClick={onLogout}>
            🚪 Çıkış Yap
          </button>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-button"
        onClick={toggleMobileMenu}
        style={{
          display: 'none',
          background: 'transparent',
          border: 'none',
          color: '#43e97b',
          fontSize: '1.5rem',
          cursor: 'pointer',
          padding: '8px'
        }}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            background: 'rgba(35, 37, 58, 0.98)',
            backdropFilter: 'blur(10px)',
            borderBottom: '3px solid #43e97b',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            zIndex: 1000,
            animation: 'slideInFromTop 0.3s ease'
          }}
        >
          <Link 
            to="/" 
            className="navbar-link mobile-link" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ marginBottom: '15px', justifyContent: 'center' }}
          >
            🏠 Anasayfa
          </Link>
          {isLoggedIn && (
            <Link 
              to="/devices" 
              className="navbar-link mobile-link" 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ marginBottom: '15px', justifyContent: 'center' }}
            >
              📱 Cihazlarım
            </Link>
          )}
          {isLoggedIn && (
            <Link 
              to="/advice" 
              className="navbar-link mobile-link" 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ marginBottom: '15px', justifyContent: 'center' }}
            >
              💡 Tavsiyeler
            </Link>
          )}
          <Link 
            to="/contact" 
            className="navbar-link mobile-link" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ marginBottom: '15px', justifyContent: 'center' }}
          >
            📞 İletişim
          </Link>
          {!isLoggedIn && (
            <button 
              className="navbar-login-btn mobile-login" 
              onClick={() => {
                onLoginClick();
                setIsMobileMenuOpen(false);
              }}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              🔐 Giriş Yap
            </button>
          )}
          {isLoggedIn && (
            <button 
              className="navbar-login-btn mobile-login" 
              onClick={() => {
                onLogout();
                setIsMobileMenuOpen(false);
              }}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              🚪 Çıkış Yap
            </button>
          )}
        </div>
      )}
    </header>
  );
}

function Home() {
  return (
    <ImageSlider>
      <div className="home-hero">
        <h1 className="home-title">Rent best performing fields for your crops.</h1>
        <div className="home-btns">
          <button className="home-btn">Demo Our Platform</button>
          <button className="home-btn">See How It Works</button>
        </div>
      </div>
    </ImageSlider>
  );
}

function Register({ onRegister, onBack, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  return (
    <div 
      className="register-modal-overlay" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="register-modal-content"
        style={{
          background: 'rgba(35, 37, 58, 0.95)',
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          padding: '40px',
          minWidth: 0,
          maxWidth: 420,
          width: '90%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          border: '1px solid rgba(67, 233, 123, 0.3)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          animation: 'slideUp 0.4s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            fontSize: 20,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          ×
        </button>

        {/* Turkey Flag */}
        <div style={{width:'100%', display:'flex', justifyContent:'flex-start', position:'absolute', top:14, left:20}}>
          <div style={{
            background:'#fff', 
            borderRadius:6, 
            padding:'4px 6px', 
            boxShadow:'0 1px 4px rgba(35, 37, 58, 0.4)',
            border: '1px solid rgba(0,0,0,0.1)'
          }}>
            <svg width="24" height="16" viewBox="0 0 24 16" style={{ display: 'block' }}>
              <rect width="24" height="16" fill="#e30a17"/>
              <circle cx="7" cy="8" r="3" fill="#ffffff"/>
              <circle cx="8.5" cy="8" r="2.5" fill="#e30a17"/>
              <polygon 
                points="13,5.5 14.2,7.8 16.8,7.8 14.8,9.4 15.5,12 13,10.2 10.5,12 11.2,9.4 9.2,7.8 11.8,7.8" 
                fill="#ffffff"
              />
            </svg>
          </div>
        </div>

        {/* Logo and Title */}
        <div style={{marginTop:10, marginBottom:24, display:'flex', alignItems:'center', gap:14, justifyContent:'center'}}>
          <img src="/src/assets/cekirge-logo.jpg" alt="Çekirge Logo" style={{width:60, height:60, objectFit:'cover', borderRadius:'50%', background:'#fff', boxShadow:'0 2px 12px #43e97b44', border:'3px solid #43e97b'}} />
          <span style={{fontSize:32, fontWeight:900, color:'#43e97b', letterSpacing:1.2, textShadow:'0 2px 12px #43e97b33'}}>ÇEKİRGE</span>
        </div>

        <h2 style={{color: '#fff', fontSize: 24, fontWeight: 600, margin: '0 0 20px 0', textAlign: 'center'}}>Kayıt Ol</h2>

        {/* Register Form */}
        <form 
          className="register-form" 
          onSubmit={async e => {
            e.preventDefault();
            setLoading(true);
            setError('');
            const email = e.target.email.value;
            const password = e.target.password.value;
            try {
              await onRegister(email, password);
            } catch (err) {
              // Firebase hatalarını Türkçe'ye çevir
              let errorMessage = '';
              switch (err.code) {
                case 'auth/email-already-in-use':
                  errorMessage = 'Bu e-posta adresi ile daha önce kayıt olunmuş. Lütfen giriş yapmayı deneyin.';
                  break;
                case 'auth/weak-password':
                  errorMessage = 'Şifre çok zayıf. Lütfen en az 6 karakter kullanın.';
                  break;
                case 'auth/invalid-email':
                  errorMessage = 'Geçersiz e-posta adresi. Lütfen doğru bir e-posta adresi girin.';
                  break;
                case 'auth/missing-password':
                  errorMessage = 'Şifre alanı boş bırakılamaz.';
                  break;
                default:
                  errorMessage = 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.';
              }
              setError(errorMessage);
            }
            setLoading(false);
          }}
          style={{
            width:'100%', 
            display:'flex', 
            flexDirection:'column', 
            gap:16, 
            background:'none', 
            boxShadow:'none', 
            padding:0
          }}
        >
          <input 
            type="email" 
            name="email" 
            placeholder="E-Posta" 
            required 
            style={{
              background:'rgba(255, 255, 255, 0.05)', 
              color:'#fff', 
              border:'2px solid rgba(67, 233, 123, 0.4)', 
              borderRadius:12, 
              padding:'16px 18px', 
              fontSize:16, 
              transition: 'all 0.3s ease', 
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#43e97b'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(67, 233, 123, 0.4)'}
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Şifre" 
            required 
            style={{
              background:'rgba(255, 255, 255, 0.05)', 
              color:'#fff', 
              border:'2px solid rgba(67, 233, 123, 0.4)', 
              borderRadius:12, 
              padding:'16px 18px', 
              fontSize:16, 
              transition: 'all 0.3s ease', 
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#43e97b'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(67, 233, 123, 0.4)'}
          />
          <button 
            type="submit" 
            className="btn-register" 
            disabled={loading}
            style={{
              background:'linear-gradient(135deg, #43e97b 0%, #38d9a9 100%)', 
              color:'#1a1a1a', 
              fontWeight:700, 
              fontSize:18, 
              borderRadius:12, 
              padding:'16px 0', 
              marginTop:12, 
              border:'none', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              transition: 'all 0.3s ease', 
              boxShadow: '0 6px 20px rgba(67, 233, 123, 0.4)',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>

        {/* Error Message */}
        {error && <div style={{color:'#e53935', marginTop:12, textAlign:'center', fontSize:14}}>{error}</div>}

        {/* Back to Login Link */}
        <a 
          href="#" 
          className="btn-back-login" 
          onClick={(e) => { e.preventDefault(); onBack(); }} 
          style={{
            color:'#43e97b', 
            fontWeight:600, 
            marginTop:16, 
            fontSize:16, 
            textDecoration:'underline',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#38d9a9'}
          onMouseLeave={(e) => e.target.style.color = '#43e97b'}
        >
          Zaten hesabınız var mı? Giriş Yapın
        </a>
      </div>
    </div>
  );
}

function ForgotPassword({ onBack, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const email = e.target.email.value;
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Şifre sıfırlama e-postası gönderildi! E-posta kutunuzu kontrol edin.');
    } catch (err) {
      // Firebase hatalarını Türkçe'ye çevir
      let errorMessage = '';
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz e-posta adresi. Lütfen doğru bir e-posta adresi girin.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Çok fazla istek gönderildi. Lütfen bir süre bekleyin.';
          break;
        default:
          errorMessage = 'E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyin.';
      }
      setError(errorMessage);
    }
    setLoading(false);
  };

  return (
    <div 
      className="forgot-password-modal-overlay" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="forgot-password-modal-content"
        style={{
          background: 'rgba(35, 37, 58, 0.95)',
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          padding: '40px',
          minWidth: 0,
          maxWidth: 420,
          width: '90%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          border: '1px solid rgba(67, 233, 123, 0.3)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          animation: 'slideUp 0.4s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            fontSize: 20,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          ×
        </button>

        {/* Turkey Flag */}
        <div style={{width:'100%', display:'flex', justifyContent:'flex-start', position:'absolute', top:14, left:20}}>
          <div style={{
            background:'#fff', 
            borderRadius:6, 
            padding:'4px 6px', 
            boxShadow:'0 1px 4px rgba(35, 37, 58, 0.4)',
            border: '1px solid rgba(0,0,0,0.1)'
          }}>
            <svg width="24" height="16" viewBox="0 0 24 16" style={{ display: 'block' }}>
              <rect width="24" height="16" fill="#e30a17"/>
              <circle cx="7" cy="8" r="3" fill="#ffffff"/>
              <circle cx="8.5" cy="8" r="2.5" fill="#e30a17"/>
              <polygon 
                points="13,5.5 14.2,7.8 16.8,7.8 14.8,9.4 15.5,12 13,10.2 10.5,12 11.2,9.4 9.2,7.8 11.8,7.8" 
                fill="#ffffff"
              />
            </svg>
          </div>
        </div>

        {/* Logo and Title */}
        <div style={{marginTop:10, marginBottom:24, display:'flex', alignItems:'center', gap:14, justifyContent:'center'}}>
          <img src="/src/assets/cekirge-logo.jpg" alt="Çekirge Logo" style={{width:60, height:60, objectFit:'cover', borderRadius:'50%', background:'#fff', boxShadow:'0 2px 12px #43e97b44', border:'3px solid #43e97b'}} />
          <span style={{fontSize:32, fontWeight:900, color:'#43e97b', letterSpacing:1.2, textShadow:'0 2px 12px #43e97b33'}}>ÇEKİRGE</span>
        </div>

        <h2 style={{color: '#fff', fontSize: 24, fontWeight: 600, margin: '0 0 20px 0', textAlign: 'center'}}>Şifremi Unuttum</h2>

        {/* Forgot Password Form */}
        <form 
          className="forgot-password-form" 
          onSubmit={handleForgotPassword}
          style={{
            width:'100%', 
            display:'flex', 
            flexDirection:'column', 
            gap:16, 
            background:'none', 
            boxShadow:'none', 
            padding:0
          }}
        >
          <p style={{color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, textAlign: 'center', margin: '0 0 16px 0', lineHeight: 1.5}}>
            E-posta adresinizi girin, şifre sıfırlama bağlantısını size gönderelim.
          </p>
          
          <input 
            type="email" 
            name="email" 
            placeholder="E-Posta Adresiniz" 
            required 
            style={{
              background:'rgba(255, 255, 255, 0.05)', 
              color:'#fff', 
              border:'2px solid rgba(67, 233, 123, 0.4)', 
              borderRadius:12, 
              padding:'16px 18px', 
              fontSize:16, 
              transition: 'all 0.3s ease', 
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#43e97b'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(67, 233, 123, 0.4)'}
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn-forgot-password" 
            style={{
              background: loading ? 'rgba(67, 233, 123, 0.5)' : 'linear-gradient(135deg, #43e97b 0%, #38d9a9 100%)', 
              color:'#1a1a1a', 
              fontWeight:700, 
              fontSize:18, 
              borderRadius:12, 
              padding:'16px 0', 
              marginTop:12, 
              border:'none', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              transition: 'all 0.3s ease', 
              boxShadow: '0 6px 20px rgba(67, 233, 123, 0.4)'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama E-postası Gönder'}
          </button>
        </form>

        {/* Success Message */}
        {success && <div style={{color:'#43e97b', marginTop:16, textAlign:'center', fontSize:14, lineHeight: 1.4}}>{success}</div>}

        {/* Error Message */}
        {error && <div style={{color:'#e53935', marginTop:16, textAlign:'center', fontSize:14}}>{error}</div>}

        {/* Back to Login Link */}
        <a 
          href="#" 
          className="btn-back-login" 
          onClick={(e) => { e.preventDefault(); onBack(); }} 
          style={{
            color:'#43e97b', 
            fontWeight:600, 
            marginTop:20, 
            fontSize:16, 
            textDecoration:'underline',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#38d9a9'}
          onMouseLeave={(e) => e.target.style.color = '#43e97b'}
        >
          Giriş Sayfasına Dön
        </a>
      </div>
    </div>
  );
}

function Blog() {
  return <div className="modern-card" style={{maxWidth:600,margin:'32px auto',textAlign:'center'}}>Blog sayfası (yakında)</div>;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoggedIn(!!firebaseUser);
    });
    return () => unsub();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showLogin || showRegister || showForgotPassword) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showLogin, showRegister, showForgotPassword]);

  // Close modals with ESC key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeModals();
      }
    };

    if (showLogin || showRegister || showForgotPassword) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLogin, showRegister, showForgotPassword]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(''); // Önceki hataları temizle
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
      setLoginError(''); // Başarılı girişte hata mesajını temizle
    } catch (err) {
      // Firebase hatalarını Türkçe'ye çevir
      let errorMessage = '';
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Hatalı şifre. Lütfen şifrenizi kontrol edin.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz e-posta adresi.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Bu hesap devre dışı bırakılmış.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
          break;
        default:
          errorMessage = 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
      }
      setLoginError(errorMessage);
    }
  };

  const handleRegister = async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
    setShowRegister(false);
    setShowLogin(false);
  };

  const handleLogout = () => signOut(auth);

  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowForgotPassword(false);
    setLoginError(''); // Modal kapanırken hata mesajını temizle
  };

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} onLoginClick={() => setShowLogin(true)} />
      
      {/* Main Content - Always show routes */}
      {!isLoggedIn && (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
      {isLoggedIn && (
        <Routes>
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/devices" element={<Devices user={user} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/advice" element={<Advice />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      )}

      {/* Modal Overlays - Show on top of content */}
      {showLogin && !isLoggedIn && !showRegister && !showForgotPassword && (
        <Login 
          onLogin={handleLogin} 
          onRegisterClick={() => { setShowLogin(false); setShowRegister(true); setLoginError(''); }} 
          onForgotPasswordClick={() => { setShowLogin(false); setShowForgotPassword(true); setLoginError(''); }}
          onClose={closeModals}
          error={loginError}
        />
      )}
      {showRegister && !isLoggedIn && !showLogin && !showForgotPassword && (
        <Register 
          onRegister={handleRegister} 
          onBack={() => { setShowRegister(false); setShowLogin(true); }} 
          onClose={closeModals}
        />
      )}
      {showForgotPassword && !isLoggedIn && !showLogin && !showRegister && (
        <ForgotPassword 
          onBack={() => { setShowForgotPassword(false); setShowLogin(true); }} 
          onClose={closeModals}
        />
      )}
    </Router>
  );
}

export default App;
