import React from 'react';
import { FaSearch, FaClock, FaLock, FaMapMarkedAlt, FaUsers, FaShieldAlt } from 'react-icons/fa'; 

const features = [
  {
    title: 'Real-Time Availability',
    desc: 'Instantly check which tour guides are available with live updates to avoid scheduling conflicts and overbooking.',
    icon: <FaClock size={40} />,
    color: '#667eea',
    bgColor: 'rgba(102, 126, 234, 0.1)'
  },
  {
    title: 'Smart Search & Filters',
    desc: 'Quickly find guides based on your location, language, budget, schedule, and interests.',
    icon: <FaSearch size={40} />,
    color: '#11998e',
    bgColor: 'rgba(17, 153, 142, 0.1)'
  },
  {
    title: 'Secure Payments',
    desc: 'Pay safely through PayPal and PayMongo with verified encryption. Get digital receipts and instant confirmation.',
    icon: <FaLock size={40} />,
    color: '#764ba2',
    bgColor: 'rgba(118, 75, 162, 0.1)'
  },
  {
    title: 'Interactive Maps',
    desc: 'Explore destinations with our interactive maps showing points of interest, guide locations, and route planning.',
    icon: <FaMapMarkedAlt size={40} />,
    color: '#f093fb',
    bgColor: 'rgba(240, 147, 251, 0.1)'
  },
  {
    title: 'Verified Guides',
    desc: 'All tour guides are licensed, verified, and rated by previous tourists for quality assurance.',
    icon: <FaUsers size={40} />,
    color: '#4facfe',
    bgColor: 'rgba(79, 172, 254, 0.1)'
  },
  {
    title: '24/7 Support',
    desc: 'Get help anytime with our round-the-clock customer support and emergency assistance.',
    icon: <FaShieldAlt size={40} />,
    color: '#43e97b',
    bgColor: 'rgba(67, 233, 123, 0.1)'
  }
];

const Features = () => (
  <section className="py-5" id="features" style={{
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  }}>
    <div className="container">
      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="display-5 fw-bold mb-3" style={{ color: '#2c3e50' }}>
          Why Choose Gabay Laguna?
        </h2>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
          Experience the perfect blend of technology and local expertise for unforgettable adventures
        </p>
      </div>

      {/* Features Grid */}
      <div className="row g-4">
        {features.map((feature, index) => (
          <div className="col-lg-4 col-md-6" key={index}>
            <div 
              className="card h-100 border-0 shadow-lg"
              style={{ 
                borderRadius: '20px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px)';
                e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
              }}
            >
              <div className="card-body p-4 p-md-5 text-center">
                {/* Icon Container */}
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: feature.bgColor,
                    color: feature.color
                  }}
                >
                  {feature.icon}
                </div>

                {/* Content */}
                <h5 className="card-title fw-bold mb-3" style={{ color: '#2c3e50' }}>
                  {feature.title}
                </h5>
                <p className="card-text text-muted lh-base">
                  {feature.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-5 pt-4">
        <div className="bg-white rounded-4 p-4 p-md-5 shadow-lg d-inline-block">
          <h4 className="fw-bold mb-3" style={{ color: '#667eea' }}>
            Ready to Start Your Adventure?
          </h4>
          <p className="text-muted mb-4">
            Join thousands of tourists who have already discovered the magic of Laguna
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <a 
              href="/signup/tourist" 
              className="btn btn-primary btn-lg px-4 py-3 fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '50px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
            >
              🧳 Start Exploring
            </a>
            <a 
              href="/signup/guide" 
              className="btn btn-outline-primary btn-lg px-4 py-3 fw-semibold"
              style={{
                borderWidth: '2px',
                borderRadius: '50px',
                color: '#667eea',
                borderColor: '#667eea'
              }}
            >
              🧭 Become a Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Features;
