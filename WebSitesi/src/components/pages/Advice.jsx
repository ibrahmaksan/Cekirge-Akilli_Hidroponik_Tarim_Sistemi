import React, { useState } from 'react';

function Advice() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const adviceCategories = [
    { id: 'all', name: 'Tümü', icon: '📋' },
    { id: 'water', name: 'Su Tasarrufu', icon: '💧' },
    { id: 'energy', name: 'Enerji Verimliliği', icon: '⚡' },
    { id: 'air', name: 'Hava Kalitesi', icon: '🌬️' },
    { id: 'temperature', name: 'Sıcaklık', icon: '🌡️' },
    { id: 'soil', name: 'Toprak Bakımı', icon: '🌱' }
  ];

  const adviceList = [
    {
      id: 1,
      category: 'water',
      title: 'Akıllı Sulama Sistemi',
      description: 'Toprak nem sensörlerinize göre sulama zamanlaması yapın. Bu sayede %30 daha az su kullanabilirsiniz.',
      priority: 'high',
      savings: '₺150/ay',
      difficulty: 'Kolay'
    },
    {
      id: 2,
      category: 'energy',
      title: 'Gece Modu Optimizasyonu',
      description: 'Sıcaklık sensörlerinize göre gece saatlerinde ısıtma/soğutma sistemlerinizi optimize edin.',
      priority: 'medium',
      savings: '₺200/ay',
      difficulty: 'Orta'
    },
    {
      id: 3,
      category: 'air',
      title: 'Havalandırma Kontrolü',
      description: 'CO2 seviyesi yükseldiğinde otomatik havalandırma sistemi ile hava kalitesini artırın.',
      priority: 'high',
      savings: 'Sağlık',
      difficulty: 'Kolay'
    },
    {
      id: 4,
      category: 'temperature',
      title: 'Adaptif Termostat',
      description: 'Sıcaklık sensörlerinizden gelen verilere göre termostat ayarlarını otomatik optimize edin.',
      priority: 'medium',
      savings: '₺180/ay',
      difficulty: 'Orta'
    },
    {
      id: 5,
      category: 'soil',
      title: 'Toprak pH Dengesi',
      description: 'Toprak sensörlerinizin pH verilerine göre gübre ve besin maddesi önerileri alın.',
      priority: 'low',
      savings: 'Verim ↑',
      difficulty: 'Kolay'
    },
    {
      id: 6,
      category: 'water',
      title: 'Yağmur Suyu Toplama',
      description: 'Yağış sensörü verilerine göre yağmur suyu toplama sistemini optimize edin.',
      priority: 'medium',
      savings: '₺80/ay',
      difficulty: 'Zor'
    }
  ];

  const filteredAdvice = selectedCategory === 'all' 
    ? adviceList 
    : adviceList.filter(advice => advice.category === selectedCategory);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#6c757d';
    }
  };

  const getPriorityText = (priority) => {
    switch(priority) {
      case 'high': return 'Yüksek Öncelik';
      case 'medium': return 'Orta Öncelik';
      case 'low': return 'Düşük Öncelik';
      default: return 'Öncelik';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          marginBottom: '30px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            color: '#2c3e50',
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: '0 0 15px 0',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            💡 Akıllı Tavsiyeler
          </h1>
          <p style={{
            color: '#666',
            fontSize: '1.1rem',
            margin: 0,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Sensör verilerinize dayalı kişiselleştirilmiş öneriler ile tasarruf edin ve verimliliği artırın
          </p>
        </div>

        {/* Category Filter */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '30px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center'
          }}>
            {adviceCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  background: selectedCategory === category.id 
                    ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                    : 'rgba(255, 255, 255, 0.8)',
                  color: selectedCategory === category.id ? 'white' : '#666',
                  border: selectedCategory === category.id 
                    ? '2px solid transparent' 
                    : '2px solid #e0e0e0',
                  borderRadius: '16px',
                  padding: '12px 20px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '120px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category.id) {
                    e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                    e.target.style.borderColor = '#667eea';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category.id) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                    e.target.style.borderColor = '#e0e0e0';
                  }
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Advice Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '25px',
          marginBottom: '40px'
        }}>
          {filteredAdvice.map(advice => (
            <div
              key={advice.id}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {/* Priority Badge */}
              <div style={{
                display: 'inline-block',
                background: getPriorityColor(advice.priority),
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: '600',
                padding: '6px 12px',
                borderRadius: '20px',
                marginBottom: '15px'
              }}>
                {getPriorityText(advice.priority)}
              </div>

              <h3 style={{
                color: '#2c3e50',
                fontSize: '1.4rem',
                fontWeight: '700',
                margin: '0 0 15px 0'
              }}>
                {advice.title}
              </h3>

              <p style={{
                color: '#666',
                fontSize: '1rem',
                lineHeight: '1.6',
                margin: '0 0 20px 0'
              }}>
                {advice.description}
              </p>

              {/* Stats */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #e0e0e0'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                  color: 'white',
                  padding: '8px 15px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  💰 {advice.savings}
                </div>
                <div style={{
                  color: '#666',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  📊 {advice.difficulty}
                </div>
              </div>

              {/* Action Button */}
              <button style={{
                width: '100%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '15px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}>
                📋 Detayları Görüntüle
              </button>
            </div>
          ))}
        </div>

        {filteredAdvice.length === 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ color: '#666', fontSize: '1.3rem', margin: 0 }}>
              Bu kategoride henüz tavsiye bulunmuyor
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default Advice;
