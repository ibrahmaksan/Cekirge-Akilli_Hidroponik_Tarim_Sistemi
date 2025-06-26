import React, { useState } from 'react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: '📍',
      title: 'Adres',
      content: 'Mimarsinan Mahallesi, Mimar Sinan Bulvarı, Eflak Cd. No:177, 16310 Yıldırım/Bursa',
      color: '#e74c3c'
    },
    {
      icon: '📞',
      title: 'Telefon',
      content: '+90 (224) 123 45 67',
      color: '#27ae60'
    },
    {
      icon: '✉️',
      title: 'E-posta',
      content: 'info@cekirge.com',
      color: '#3498db'
    },
    {
      icon: '🕒',
      title: 'Çalışma Saatleri',
      content: 'Pazartesi - Cuma: 09:00 - 18:00',
      color: '#f39c12'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            color: '#2c3e50',
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: '0 0 15px 0',
            background: 'linear-gradient(135deg, #74b9ff, #0984e3)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            📞 İletişim
          </h1>
          <p style={{
            color: '#666',
            fontSize: '1.1rem',
            margin: 0,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Bizimle iletişime geçin, sorularınızı yanıtlayalım ve size yardımcı olalım
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Contact Form */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              color: '#2c3e50',
              fontSize: '1.8rem',
              fontWeight: '700',
              margin: '0 0 30px 0',
              textAlign: 'center'
            }}>
              💬 Mesaj Gönder
            </h2>

            {submitStatus === 'success' && (
              <div style={{
                background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                color: 'white',
                padding: '15px 20px',
                borderRadius: '12px',
                marginBottom: '25px',
                textAlign: 'center',
                fontWeight: '600',
                animation: 'fadeIn 0.5s ease'
              }}>
                ✅ Mesajınız başarıyla gönderildi! Size en kısa sürede dönüş yapacağız.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    color: '#2c3e50',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    👤 Ad Soyad
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#74b9ff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(116, 185, 255, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#2c3e50',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    ✉️ E-posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#74b9ff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(116, 185, 255, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#2c3e50',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  📝 Konu
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#74b9ff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(116, 185, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#2c3e50',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  💬 Mesaj
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#74b9ff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(116, 185, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting 
                    ? 'linear-gradient(135deg, #bbb, #999)' 
                    : 'linear-gradient(135deg, #74b9ff, #0984e3)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px 30px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  marginTop: '10px'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(116, 185, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {isSubmitting ? '📤 Gönderiliyor...' : '🚀 Mesaj Gönder'}
              </button>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div>
            {/* Contact Info Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    padding: '25px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: '2px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = info.color;
                    e.currentTarget.style.boxShadow = `0 8px 30px ${info.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{
                    fontSize: '2.5rem',
                    marginBottom: '15px'
                  }}>
                    {info.icon}
                  </div>
                  <h3 style={{
                    color: info.color,
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    margin: '0 0 10px 0'
                  }}>
                    {info.title}
                  </h3>
                  <p style={{
                    color: '#666',
                    fontSize: '0.95rem',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    {info.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Map */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              padding: '25px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                color: '#2c3e50',
                fontSize: '1.4rem',
                fontWeight: '700',
                margin: '0 0 20px 0',
                textAlign: 'center'
              }}>
                🗺️ Konum
              </h3>
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}>
                <iframe
                  title="Harita"
                  width="100%"
                  height="350"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src="https://www.google.com/maps?q=Mimarsinan+Mahallesi,+Mimar+Sinan+Bulvar%C4%B1,+Eflak+Cd.+No:177,+16310+Y%C4%B1ld%C4%B1r%C4%B1m&output=embed"
                  allowFullScreen
                />
              </div>
              <div style={{
                textAlign: 'center',
                marginTop: '15px'
              }}>
                <button style={{
                  background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 4px 15px rgba(39, 174, 96, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
                onClick={() => window.open('https://maps.google.com?q=Mimarsinan+Mahallesi,+Mimar+Sinan+Bulvarı,+Eflak+Cd.+No:177,+16310+Yıldırım', '_blank')}>
                  🧭 Haritada Aç
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
