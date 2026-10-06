import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call for password reset
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        padding: '40px 32px',
        border: '1px solid #f3f4f6'
      }}>
        {/* Back link */}
        <Link 
          to="/login" 
          style={{ 
             display: 'inline-flex', 
             alignItems: 'center', 
             gap: '8px', 
             color: '#6b7280', 
             textDecoration: 'none',
             fontSize: '0.875rem',
             fontWeight: '600',
             marginBottom: '24px',
             transition: 'color 0.2s'
          }}
        >
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#10b981'
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>Check your email</h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '32px' }}>
              We've sent a password reset link to <br/><strong style={{ color: '#374151' }}>{email}</strong>
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: '600' }}
            >
              Sign In
            </button>
            <p style={{ marginTop: '24px', fontSize: '0.875rem', color: '#6b7280' }}>
              Didn't receive the email? <button style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: '600', cursor: 'pointer', padding: 0 }}>Click to resend</button>
            </p>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(79, 70, 229, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#4f46e5'
              }}>
                <Send size={24} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Forgot Password</h1>
              <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>No worries, we'll send you reset instructions.</p>
            </div>

            <form onSubmit={handleResetRequest}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  height: '48px', 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>Reset Password</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
