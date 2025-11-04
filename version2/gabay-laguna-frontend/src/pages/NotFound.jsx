import React from 'react';
import { Link } from 'react-router-dom';
import '../theme.css';

const NotFound = () => (
  <div className="container text-center py-5">
    <h1 
      className="display-3 fw-bold"
      style={{
        color: 'var(--color-primary)',
        fontFamily: 'var(--font-family-heading)',
      }}
    >
      404
    </h1>
    <p 
      className="lead"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      Oops! Page not found.
    </p>
    <Link 
      to="/" 
      className="btn btn-primary mt-3"
      style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
        border: 'none',
        borderRadius: 'var(--radius-lg)',
        fontWeight: '600',
      }}
    >
      Go Home
    </Link>
  </div>
);

export default NotFound;
