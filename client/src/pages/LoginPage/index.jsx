// LoginPage.jsx - Authentication Page (v2.0 — Split Panel)
// Logic: 100% unchanged. Only JSX structure redesigned.

import './index.css';
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext.jsx';
import { sendOtp, register, emailLogin, googleLogin } from '../../services/authService.js';
import {
  HiDocumentText, HiShieldCheck, HiSparkles,
  HiCheck, HiChartBar, HiChatBubbleLeftRight,
} from 'react-icons/hi2';

function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [otp, setOtp]               = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();

  // ── Handlers (unchanged) ──────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // OTP Sending Step
    if (isRegister && !showOtpInput) {
      setIsSendingOtp(true);
      try {
        await sendOtp(email);
        setShowOtpInput(true);
        toast.success('Verification code sent to your email!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send verification code');
      }
      setIsSendingOtp(false);
      return;
    }

    // Final Registration or Login Step
    setIsLoading(true);
    try {
      const result = isRegister
        ? await register(name, email, password, otp)
        : await emailLogin(email, password);
      login(result.token, result.user);
      toast.success(isRegister ? 'Account created!' : 'Welcome back!');
      navigate('/home');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    }
    setIsLoading(false);
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      // The hook returns an access_token, we send it to the backend
      const result = await googleLogin(tokenResponse.access_token);
      login(result.token, result.user);
      toast.success('Welcome!');
      navigate('/home');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed');
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google login failed'),
  });

  // ── Brand panel feature list ──────────────────────────
  const features = [
    { icon: HiSparkles,            label: 'AI Writing Agent',  desc: 'STAR-format bullets crafted from your experience' },
    { icon: HiChartBar,            label: 'ATS Score Engine',  desc: '10-metric analysis to pass every filter' },
    { icon: HiChatBubbleLeftRight, label: 'Chat Assistant',    desc: 'Talk to your resume, rewrite on command' },
  ];

  return (
    <div className="login-page">

      {/* ── Left: Brand Panel ──────────────────────────── */}
      <div className="login-brand-panel">
        <div className="login-brand-orb-1" />
        <div className="login-brand-orb-2" />

        <div className="login-brand-inner">
          {/* Logo */}
          <Link to="/" className="login-brand-logo">
            <div className="navbar-logo"><HiDocumentText /></div>
            <span className="login-brand-name">AI Resume Builder</span>
          </Link>

          {/* Headline */}
          <div>
            <h1 className="login-brand-h1">
              Build resumes that<br />
              <span className="login-brand-accent">land interviews.</span>
            </h1>
            <p className="login-brand-sub">
              The precision AI writing tool trusted by professionals
              targeting top-tier roles at Google, Amazon, and beyond.
            </p>
          </div>

          {/* Features */}
          <div className="login-feature-list">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="login-feature-card">
                <div className="login-feature-icon"><Icon /></div>
                <div>
                  <p className="login-feature-label">{label}</p>
                  <p className="login-feature-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="login-brand-trust">
            <span><HiShieldCheck /> Secure login</span>
            <span><HiCheck /> Free to start</span>
            <span><HiCheck /> Export to PDF</span>
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ──────────────────────────── */}
      <div className="login-form-panel">
        <div className="login-form-container">

          <Link to="/" className="login-back-link">← Back to Home</Link>

          <h2 className="login-form-title">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="login-form-sub">
            {isRegister ? 'Start building AI-powered resumes' : 'Sign in to continue building'}
          </p>

          {/* Google Login */}
          <div className="flex-center" style={{ margin: '24px 0 4px' }}>
            <button 
              type="button" 
              onClick={() => loginWithGoogle()}
              className="btn btn-outline btn-full flex-center"
              style={{ gap: '10px', height: '44px', fontWeight: '500' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isRegister ? 'Sign up with Google' : 'Sign in with Google'}
            </button>
          </div>

          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">or</span>
            <div className="login-divider-line" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label className="label-text">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Your full name"
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label className="label-text">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                disabled={showOtpInput}
                required
              />
            </div>
            
            {isRegister && showOtpInput && (
              <div className="form-group">
                <label className="label-text">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field"
                  placeholder="6-digit code"
                  required
                />
              </div>
            )}

            {(!isRegister || showOtpInput) && (
              <div className="form-group">
                <label className="label-text">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading || isSendingOtp}
              className={`btn btn-primary-gradient btn-full ${(isLoading || isSendingOtp) ? 'btn-disabled' : ''}`}
              style={{ marginTop: '8px', padding: '11px 20px' }}
            >
              {(isLoading || isSendingOtp) 
                ? 'Please wait…' 
                : (isRegister && !showOtpInput) 
                  ? 'Send Verification Code'
                  : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <p className="login-form-footer">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              type="button" 
              className="login-toggle-btn"
              onClick={() => {
                setIsRegister(!isRegister);
                setShowOtpInput(false);
              }}
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

        </div>
      </div>

    </div>
  );
}

export default LoginPage;
