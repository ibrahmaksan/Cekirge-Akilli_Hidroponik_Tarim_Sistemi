import { useState } from 'react';
import { updateEmail, updatePassword } from 'firebase/auth';
import { auth } from '../../firebase';

const cities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Adana', 'Antalya', 'Konya', 'Kayseri', 'Gaziantep', 'Samsun', 'Trabzon', 'Eskişehir', 'Diğer'
];

function Profile() {
  const user = auth.currentUser;
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      if (email !== user.email) {
        await updateEmail(user, email);
      }
      if (newPassword) {
        await updatePassword(user, newPassword);
      }
      setMessage('Profil başarıyla güncellendi!');
    } catch (err) {
      setMessage('Hata: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '32px 20px'
    }}>
      <div style={{maxWidth: 600, margin: '0 auto'}}>
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: 40}}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #43e97b 0%, #38d9a9 100%)',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)'
          }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 20C23.866 20 27 16.866 27 13C27 9.134 23.866 6 20 6C16.134 6 13 9.134 13 13C13 16.866 16.134 20 20 20Z" fill="white"/>
              <path d="M20 23C13.925 23 9 27.925 9 34H31C31 27.925 26.075 23 20 23Z" fill="white"/>
            </svg>
          </div>
          <h1 style={{margin: 0, fontSize: 28, fontWeight: 700, color: '#232526'}}>
            Profil Ayarları
          </h1>
          <p style={{margin: '8px 0 0 0', color: '#666', fontSize: 16}}>
            Hesap bilgilerinizi yönetin ve güncelleyin
          </p>
        </div>

        {/* Profile Form */}
        <div className="modern-card" style={{padding: 40}}>
          <form onSubmit={handleProfileUpdate} style={{display: 'flex', flexDirection: 'column', gap: 24}}>
            {/* Email Section */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 600,
                color: '#232526'
              }}>
                E-posta Adresi
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                required 
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  border: '2px solid #f0f0f0',
                  borderRadius: 12,
                  fontSize: 16,
                  background: '#fff',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#43e97b'}
                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
              />
            </div>

            {/* Password Section */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#232526'
                }}>
                  Mevcut Şifre
                </label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)} 
                  placeholder="Mevcut şifreniz"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '16px 18px',
                    border: '2px solid #f0f0f0',
                    borderRadius: 12,
                    fontSize: 16,
                    background: '#fff',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#43e97b'}
                  onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#232526'
                }}>
                  Yeni Şifre
                </label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={e=>setNewPassword(e.target.value)} 
                  placeholder="Yeni şifre"
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '16px 18px',
                    border: '2px solid #f0f0f0',
                    borderRadius: 12,
                    fontSize: 16,
                    background: '#fff',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#43e97b'}
                  onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
                />
              </div>
            </div>

            {/* Personal Info Section */}
            <div style={{borderTop: '1px solid #f0f0f0', paddingTop: 24}}>
              <h3 style={{margin: '0 0 20px 0', fontSize: 18, fontWeight: 700, color: '#232526'}}>
                Kişisel Bilgiler
              </h3>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20}}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#232526'
                  }}>
                    Doğum Tarihi
                  </label>
                  <input 
                    type="date" 
                    value={birthday} 
                    onChange={e=>setBirthday(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px 18px',
                      border: '2px solid #f0f0f0',
                      borderRadius: 12,
                      fontSize: 16,
                      background: '#fff',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#43e97b'}
                    onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#232526'
                  }}>
                    Şehir
                  </label>
                  <select 
                    value={city} 
                    onChange={e=>setCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px 18px',
                      border: '2px solid #f0f0f0',
                      borderRadius: 12,
                      fontSize: 16,
                      background: '#fff',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#43e97b'}
                    onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
                  >
                    <option value="">Şehir seçiniz</option>
                    {cities.map(c=>(<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>

              {/* Gender Selection */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#232526'
                }}>
                  Cinsiyet
                </label>
                <div style={{display: 'flex', gap: 24}}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    padding: '12px 20px',
                    borderRadius: 12,
                    border: `2px solid ${gender === 'Kadın' ? '#43e97b' : '#f0f0f0'}`,
                    background: gender === 'Kadın' ? '#43e97b11' : '#fff',
                    transition: 'all 0.3s ease'
                  }}>
                    <input 
                      type="radio" 
                      name="gender" 
                      value="Kadın" 
                      checked={gender==='Kadın'} 
                      onChange={()=>setGender('Kadın')}
                      style={{accentColor: '#43e97b'}}
                    />
                    <span style={{fontWeight: 500}}>Kadın</span>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    padding: '12px 20px',
                    borderRadius: 12,
                    border: `2px solid ${gender === 'Erkek' ? '#43e97b' : '#f0f0f0'}`,
                    background: gender === 'Erkek' ? '#43e97b11' : '#fff',
                    transition: 'all 0.3s ease'
                  }}>
                    <input 
                      type="radio" 
                      name="gender" 
                      value="Erkek" 
                      checked={gender==='Erkek'} 
                      onChange={()=>setGender('Erkek')}
                      style={{accentColor: '#43e97b'}}
                    />
                    <span style={{fontWeight: 500}}>Erkek</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: '16px 32px',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #43e97b 0%, #38d9a9 100%)',
                color: loading ? '#666' : '#1a1a1a',
                border: 'none',
                borderRadius: 12,
                fontSize: 18,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(67, 233, 123, 0.4)',
                marginTop: 8
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
            >
              {loading ? 'Güncelleniyor...' : 'Profili Güncelle'}
            </button>

            {/* Message */}
            {message && (
              <div style={{
                padding: '16px 20px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                textAlign: 'center',
                background: message.startsWith('Hata') ? '#ffebee' : '#e8f5e8',
                color: message.startsWith('Hata') ? '#e53935' : '#43e97b',
                border: `2px solid ${message.startsWith('Hata') ? '#ffcdd2' : '#c8e6c9'}`
              }}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
