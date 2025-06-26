import { useState } from 'react';

function Login({ onLogin, onRegisterClick, onForgotPasswordClick, onClose, error: externalError }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  return (
    <div 
      className="login-modal-overlay" 
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
        className="login-modal-content"
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
        </button>        {/* Turkey Flag */}
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
        </div>        {/* Login Form */}
        <form 
          className="login-form" 
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError('');
            try {
              await onLogin(e);
            } catch (err) {
              // Hata App.jsx'te handle edilecek, burası boş kalabilir
              console.log('Login error handled in App.jsx');
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
          />          <button 
            type="submit" 
            disabled={loading}
            className="btn-login" 
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
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>        {/* Error Message */}
        {(error || externalError) && <div style={{color:'#e53935', marginTop:16, textAlign:'center', fontSize:14, lineHeight: 1.4}}>{error || externalError}</div>}{/* Links */}
        <a 
          href="#" 
          onClick={e => { e.preventDefault(); onForgotPasswordClick(); }}
          style={{color:'rgba(255, 255, 255, 0.8)', fontWeight:500, marginTop:12, textDecoration:'underline', fontSize:14, display:'block', transition: 'color 0.3s ease'}} 
          onMouseEnter={(e) => e.target.style.color = '#fff'} 
          onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
        >
          Şifremi Unuttum
        </a>
        <a 
          href="#" 
          className="btn-register" 
          onClick={e => { e.preventDefault(); onRegisterClick(); }} 
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
          Hesabınız yok mu? Kayıt Olun
        </a>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
