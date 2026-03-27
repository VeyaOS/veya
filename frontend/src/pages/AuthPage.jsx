import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg:#0a0a0b;--bg2:#111114;--bg3:#18181d;--bg4:#1e1e25;
    --border:#ffffff0f;--border2:#ffffff18;--border3:#ffffff28;
    --gold:#f5a623;--gold2:#e8931a;--gold-dim:#f5a62318;--gold-glow:#f5a62340;
    --text:#f0ede8;--text2:#9e9b94;--text3:#5a5750;--text4:#3a3835;
    --green:#22c55e;--green-dim:#22c55e15;
    --red:#ef4444;--red-dim:#ef444415;
    --radius:14px;--radius2:10px;
  }

  .veya-root * { margin:0; padding:0; box-sizing:border-box; }
  .veya-root {
    min-height:100vh; display:flex; background:var(--bg);
    color:var(--text); font-family:'Plus Jakarta Sans',sans-serif;
    font-size:14px; -webkit-font-smoothing:antialiased;
  }

  /* LEFT PANEL */
  .v-left {
    flex:1; background:var(--bg2); border-right:1px solid var(--border);
    display:flex; flex-direction:column; position:relative; overflow:hidden; min-height:100vh;
  }
  .v-left-bg { position:absolute; inset:0; pointer-events:none; }
  .v-orb1 { position:absolute;top:-120px;left:-80px;width:400px;height:400px;background:radial-gradient(circle,#f5a62314 0%,transparent 65%);border-radius:50%; }
  .v-orb2 { position:absolute;bottom:-60px;right:-60px;width:300px;height:300px;background:radial-gradient(circle,#f5a62308 0%,transparent 70%);border-radius:50%; }
  .v-grid { position:absolute;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:48px 48px;opacity:.4; }
  .v-left-inner { position:relative;z-index:2;flex:1;display:flex;flex-direction:column;padding:40px 48px; }

  .v-brand { display:flex;align-items:center;gap:12px;margin-bottom:auto; }
  .v-brand-mark { width:40px;height:40px;background:var(--gold);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
  .v-brand-v { font-family:'Playfair Display',serif;font-size:22px;font-weight:700;font-style:italic;color:#0a0a0b;line-height:1; }
  .v-brand-wordmark { display:flex;flex-direction:column;gap:1px; }
  .v-brand-name { font-family:'Playfair Display',serif;font-size:20px;font-weight:700;font-style:italic;color:var(--text);letter-spacing:-.3px;line-height:1; }
  .v-brand-name em { font-style:normal;color:var(--gold); }
  .v-brand-tag { font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--text3); }

  .v-hero { margin:auto 0;padding:40px 0; }
  .v-eyebrow { font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:20px;display:flex;align-items:center;gap:8px; }
  .v-eyebrow::before { content:'';width:24px;height:1px;background:var(--gold);opacity:.6; }
  .v-headline { font-family:'Playfair Display',serif;font-size:clamp(2rem,3.5vw,3rem);font-weight:700;line-height:1.12;letter-spacing:-.03em;color:var(--text);margin-bottom:20px; }
  .v-headline em { font-style:italic;color:var(--gold); }
  .v-body { font-size:14px;color:var(--text2);line-height:1.75;max-width:380px;font-weight:300; }

  .v-proof-row { display:flex;align-items:center;gap:24px;margin-top:40px;padding-top:32px;border-top:1px solid var(--border); }
  .v-proof-item { display:flex;flex-direction:column;gap:4px; }
  .v-proof-val { font-family:'Playfair Display',serif;font-size:22px;font-weight:700;font-style:italic;color:var(--text);letter-spacing:-.03em; }
  .v-proof-label { font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3); }
  .v-proof-divider { width:1px;height:36px;background:var(--border2);align-self:center; }

  .v-testimonial { margin-top:auto;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:20px 22px; }
  .v-testimonial-text { font-family:'Playfair Display',serif;font-size:14px;font-style:italic;color:var(--text2);line-height:1.6;margin-bottom:14px; }
  .v-testimonial-author { display:flex;align-items:center;gap:10px; }
  .v-avatar { width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#f5a623,#e05e1a);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:13px;font-weight:700;font-style:italic;color:#0a0a0b; }
  .v-author-name { font-size:12px;font-weight:600;color:var(--text); }
  .v-author-role { font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--text3);letter-spacing:.04em;margin-top:1px; }

  /* RIGHT PANEL */
  .v-right {
    width:520px;min-width:520px;display:flex;flex-direction:column;
    align-items:center;justify-content:center;padding:48px 56px;
    background:var(--bg);position:relative;overflow:hidden;
  }
  .v-right::before { content:'';position:absolute;top:-100px;right:-100px;width:300px;height:300px;background:radial-gradient(circle,#f5a62308 0%,transparent 70%);border-radius:50%;pointer-events:none; }
  .v-auth-box { width:100%;max-width:400px;position:relative;z-index:2; }

  /* TOGGLE */
  .v-toggle { display:flex;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:4px;margin-bottom:36px;position:relative; }
  .v-toggle-bg { position:absolute;top:4px;left:4px;height:calc(100% - 8px);width:calc(50% - 4px);background:var(--bg4);border-radius:10px;border:1px solid var(--border2);transition:.3s cubic-bezier(.4,0,.2,1); }
  .v-toggle-bg.right-side { left:calc(50%); }
  .v-tab { flex:1;padding:11px;text-align:center;font-size:13px;font-weight:600;cursor:pointer;position:relative;z-index:1;transition:.2s;border-radius:10px;color:var(--text3);background:none;border:none;font-family:'Plus Jakarta Sans',sans-serif; }
  .v-tab.active { color:var(--text); }
  .v-tab:hover:not(.active) { color:var(--text2); }

  /* FORM */
  .v-form-title { font-family:'Playfair Display',serif;font-size:26px;font-weight:700;font-style:italic;color:var(--text);letter-spacing:-.02em;margin-bottom:6px; }
  .v-form-sub { font-size:13px;color:var(--text3);font-family:'JetBrains Mono',monospace;letter-spacing:.04em;margin-bottom:28px; }
  .v-form-group { margin-bottom:16px; }
  .v-label { font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:500;color:var(--text3);margin-bottom:7px;display:flex;align-items:center;justify-content:space-between;letter-spacing:.1em;text-transform:uppercase; }
  .v-label a { color:var(--gold);text-decoration:none;font-size:10px;transition:.15s; }
  .v-label a:hover { color:var(--gold2); }
  .v-input-wrap { position:relative; }
  .v-input {
    width:100%;background:var(--bg2);border:1px solid var(--border2);border-radius:var(--radius2);
    padding:13px 16px;font-size:13px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;
    outline:none;transition:.2s;-webkit-appearance:none;
  }
  .v-input::placeholder { color:var(--text4); }
  .v-input:focus { border-color:var(--gold);box-shadow:0 0 0 3px var(--gold-dim);background:var(--bg3); }
  .v-input.error { border-color:var(--red);box-shadow:0 0 0 3px var(--red-dim); }
  .v-input.success { border-color:var(--green);box-shadow:0 0 0 3px var(--green-dim); }
  .v-input-icon { position:absolute;right:14px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--text3);font-size:16px;transition:.15s;user-select:none; background:none;border:none; }
  .v-input-icon:hover { color:var(--text2); }
  .v-input-prefix { position:absolute;left:14px;top:50%;transform:translateY(-50%);font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text3);pointer-events:none;letter-spacing:.04em; }
  .v-input.has-prefix { padding-left:90px; }
  .v-form-row { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px; }
  .v-error { font-size:11px;color:var(--red);margin-top:5px;font-family:'JetBrains Mono',monospace;letter-spacing:.03em; }

  /* STRENGTH */
  .v-strength { margin-top:8px; }
  .v-strength-track { display:flex;gap:4px;margin-bottom:5px; }
  .v-strength-seg { flex:1;height:3px;border-radius:2px;background:var(--bg4);transition:.3s; }
  .v-strength-seg.weak { background:var(--red); }
  .v-strength-seg.fair { background:var(--gold); }
  .v-strength-seg.strong { background:var(--green); }
  .v-strength-label { font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3);letter-spacing:.06em; }

  /* SOCIAL */
  .v-divider { display:flex;align-items:center;gap:12px;margin:20px 0; }
  .v-divider-line { flex:1;height:1px;background:var(--border); }
  .v-divider-text { font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3); }
  .v-social-row { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px; }
  .v-social-stack { display:grid;gap:10px;margin-bottom:20px; }
  .v-social-btn { display:flex;align-items:center;justify-content:center;gap:8px;padding:11px;background:var(--bg2);border:1px solid var(--border2);border-radius:var(--radius2);font-size:13px;font-weight:500;cursor:pointer;transition:.2s;color:var(--text2);font-family:'Plus Jakarta Sans',sans-serif; }
  .v-social-btn:hover { background:var(--bg3);color:var(--text);border-color:var(--border3); }
  .v-social-btn.disabled, .v-social-btn:disabled { opacity:.72; cursor:not-allowed; }
  .v-social-icon { width:18px;height:18px;flex-shrink:0; }
  .v-google-wrap { width:100%; }
  .v-google-wrap > div { width:100% !important; max-width:100%; }
  .v-google-wrap iframe { width:100% !important; max-width:100% !important; }

  /* SUBMIT */
  .v-submit { width:100%;padding:15px;background:var(--gold);color:#0a0a0b;border:none;border-radius:var(--radius2);font-size:14px;font-weight:700;cursor:pointer;transition:.2s;font-family:'Plus Jakarta Sans',sans-serif;letter-spacing:.01em;display:flex;align-items:center;justify-content:center;gap:8px;position:relative;overflow:hidden;margin-top:4px; }
  .v-submit:hover:not(.loading) { background:var(--gold2);transform:translateY(-1px);box-shadow:0 8px 28px var(--gold-glow); }
  .v-submit:active { transform:translateY(0);box-shadow:none; }
  .v-submit.loading { background:var(--gold2);pointer-events:none; }
  .v-submit.loading .btn-text { opacity:0; }
  .v-submit.loading::after { content:'';position:absolute;width:18px;height:18px;border:2px solid #0a0a0b40;border-top-color:#0a0a0b;border-radius:50%;animation:vspin .7s linear infinite; }
  .v-secondary-btn { width:100%;padding:12px;background:transparent;color:var(--text2);border:1px solid var(--border2);border-radius:var(--radius2);font-size:12px;font-weight:600;cursor:pointer;transition:.2s;font-family:'Plus Jakarta Sans',sans-serif;margin-top:12px; }
  .v-secondary-btn:hover:not(:disabled) { border-color:var(--border3); color:var(--text); background:var(--bg3); }
  @keyframes vspin { to { transform:rotate(360deg); } }
  @keyframes vpopIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }

  .v-terms { font-size:11px;color:var(--text3);text-align:center;margin-top:16px;line-height:1.6; }
  .v-terms a { color:var(--text2);text-decoration:none;transition:.15s; }
  .v-terms a:hover { color:var(--gold); }
  .v-switch { text-align:center;margin-top:20px;font-size:13px;color:var(--text3); }
  .v-switch span { color:var(--gold);cursor:pointer;font-weight:600;transition:.15s; }
  .v-switch span:hover { color:var(--gold2); }
  .v-auth-footer { margin-top:auto;padding-top:32px;text-align:center; }
  .v-auth-footer-text { font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);opacity:.5; }
  .v-auth-footer-text span { color:#f5a62340; }

  /* CHECKBOX */
  .v-check-row { display:flex;align-items:flex-start;gap:10px;margin-bottom:16px;cursor:pointer; }
  .v-custom-check { width:18px;height:18px;border:1.5px solid var(--border3);border-radius:5px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;transition:.2s;background:var(--bg2); }
  .v-custom-check.checked { background:var(--gold);border-color:var(--gold); }
  .v-check-label { font-size:12px;color:var(--text3);line-height:1.5; }
  .v-check-label a { color:var(--text2);text-decoration:none; }
  .v-check-label a:hover { color:var(--gold); }
  .v-hint { font-size:11px;color:var(--text3);margin-top:8px;font-family:'JetBrains Mono',monospace;letter-spacing:.03em;line-height:1.6; }

  /* SUCCESS */
  .v-success { text-align:center;padding:20px 0; }
  .v-success-circle { width:72px;height:72px;border-radius:50%;background:var(--green-dim);border:2px solid var(--green);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:30px;animation:vpopIn .4s cubic-bezier(.34,1.56,.64,1); }
  .v-success-title { font-family:'Playfair Display',serif;font-size:24px;font-weight:700;font-style:italic;color:var(--text);margin-bottom:8px; }
  .v-success-sub { font-size:13px;color:var(--text3);line-height:1.6;margin-bottom:24px;font-family:'JetBrains Mono',monospace;letter-spacing:.04em; }
  .v-redirect-bar { height:3px;background:var(--bg4);border-radius:2px;overflow:hidden;margin-bottom:20px; }
  .v-redirect-fill { height:100%;background:var(--gold);border-radius:2px;transition:width 2.5s linear; }

  @media(max-width:900px){
    .v-left { display:none; }
    .v-right { width:100%;min-width:0;padding:40px 24px; }
  }
`;

const GoogleIcon = () => (
  <svg className="v-social-icon" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="v-social-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getStrength(val) {
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const cls = { 1: 'weak', 2: 'weak', 3: 'fair', 4: 'strong' };
  const labels = { 0: 'Enter a password', 1: 'Too weak', 2: 'Getting there', 3: 'Good password', 4: 'Strong password' };
  const colours = { 0: 'var(--text3)', 1: 'var(--red)', 2: 'var(--red)', 3: 'var(--gold)', 4: 'var(--green)' };
  return { score, cls: cls[score] || 'weak', label: labels[score], color: colours[score] };
}

function persistAuth({ token, user }, navigate) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    navigate('/admin');
  } else {
    navigate('/dashboard');
  }
}

function SocialButtons({ isSignup, googleEnabled, onGoogleSuccess, onGoogleError }) {
  return (
    <div className="v-social-stack">
      {googleEnabled ? (
        <div className="v-google-wrap">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
            theme="outline"
            size="large"
            text={isSignup ? 'signup_with' : 'continue_with'}
            shape="rectangular"
            width="100%"
          />
        </div>
      ) : (
        <button className="v-social-btn disabled" disabled>
          <GoogleIcon /> Google sign in not configured
        </button>
      )}
      <button className="v-social-btn disabled" disabled title="Coming soon — Apple Sign In requires additional Apple developer setup">
        <AppleIcon /> Apple coming soon
      </button>
    </div>
  );
}

function LoginForm({ onSwitch, onAuthenticated, googleEnabled }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!validateEmail(email)) errs.email = 'Please enter a valid email address';
    if (!pass || pass.length < 6) errs.pass = 'Please enter your password';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors(prev => ({ ...prev, form: '', resend: '' }));

    try {
      const response = await api.post('/auth/login', {
        email,
        password: pass
      });

      onAuthenticated(response.data, navigate);
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        form: err.response?.data?.error || 'Something went wrong',
        resend: err.response?.data?.needsVerification ? email : ''
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (email && validateEmail(email)) {
      setLoading(true);
      setErrors(prev => ({ ...prev, email: '', form: '', resend: '' }));
      try {
        await api.post('/auth/forgot-password', { email });
        setErrors(prev => ({ ...prev, form: 'If your account exists, a reset link was sent to your email.' }));
      } catch (err) {
        setErrors(prev => ({ ...prev, form: err.response?.data?.error || 'Could not send reset link' }));
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(prev => ({ ...prev, email: 'Enter your email first, then click Forgot Password' }));
    }
  };

  const handleResendVerification = async () => {
    if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Enter a valid email address first' }));
      return;
    }

    setResendLoading(true);
    try {
      const response = await api.post('/auth/resend-verification', { email });
      setErrors(prev => ({ ...prev, form: response.data.message }));
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        form: err.response?.data?.error || 'Could not resend verification email'
      }));
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post('/auth/google', {
        idToken: credentialResponse.credential
      });

      onAuthenticated(response.data, navigate);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: error.response?.data?.error || 'Google sign in failed. Please try again.'
      }));
    }
  };

  const handleGoogleError = () => {
    setErrors(prev => ({
      ...prev,
      form: 'Google sign in failed. Please try again or use email sign in.'
    }));
  };

  return (
    <div>
      <div className="v-form-title">Welcome back</div>
      <div className="v-form-sub">Sign in to your Veya dashboard</div>

      <SocialButtons
        isSignup={false}
        googleEnabled={googleEnabled}
        onGoogleSuccess={handleGoogleSuccess}
        onGoogleError={handleGoogleError}
      />

      <div className="v-divider">
        <div className="v-divider-line" />
        <div className="v-divider-text">or sign in with email</div>
        <div className="v-divider-line" />
      </div>

      <div className="v-form-group">
        <div className="v-label">Email address</div>
        <input
          className={`v-input${errors.email ? ' error' : ''}`}
          type="email"
          placeholder="amaka@example.com"
          value={email}
          onChange={e => { setEmail(e.target.value.trim()); setErrors(p => ({ ...p, email: '', form: '', resend: '' })); }}
        />
        {errors.email && <div className="v-error">{errors.email}</div>}
      </div>

      <div className="v-form-group">
        <div className="v-label">
          Password
          <a href="#" onClick={handleForgot}>Forgot password?</a>
        </div>
        <div className="v-input-wrap">
          <input
            className={`v-input${errors.pass ? ' error' : ''}`}
            type={showPass ? 'text' : 'password'}
            placeholder="Enter your password"
            value={pass}
            onChange={e => { setPass(e.target.value); setErrors(p => ({ ...p, pass: '' })); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <button className="v-input-icon" onClick={() => setShowPass(s => !s)}>
            {showPass ? '🙈' : '👁'}
          </button>
        </div>
        {errors.pass && <div className="v-error">{errors.pass}</div>}
      </div>

      <button className={`v-submit${loading ? ' loading' : ''}`} onClick={handleSubmit}>
        <span className="btn-text">Sign In to Veya</span>
      </button>
      {errors.form && <div className="v-error" style={{ marginTop: 8 }}>{errors.form}</div>}
      {errors.resend && (
        <button className="v-secondary-btn" disabled={resendLoading} onClick={handleResendVerification}>
          {resendLoading ? 'Sending verification...' : 'Resend verification email'}
        </button>
      )}

      <div className="v-switch">Don't have an account? <span onClick={onSwitch}>Create one free →</span></div>
    </div>
  );
}

function SignupForm({ onSwitch, onVerificationPending, onAuthenticated, googleEnabled }) {
  const navigate = useNavigate();
  const [fields, setFields] = useState({ first: '', last: '', store: '', email: '', pass: '' });
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(null);
  const storeSlug = fields.store
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const [invite, setInvite] = useState(null);

  const set = (key) => (e) => {
    const val = key === 'email' ? e.target.value.trim() : e.target.value;
    setFields(f => ({ ...f, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
    if (key === 'pass') setStrength(val ? getStrength(val) : null);
  };

  const handleEmailBlur = async () => {
    const email = fields.email.toLowerCase().trim();
    if (!validateEmail(email)) return;

    try {
      const res = await api.get(`/auth/check-invite?email=${encodeURIComponent(email)}`);
      if (res.data.isInvited) {
        setInvite(res.data);
        // Clear store field if invited since we won't use it
        setFields(f => ({ ...f, store: 'STAFF_INVITE' }));
      } else {
        setInvite(null);
        if (fields.store === 'STAFF_INVITE') setFields(f => ({ ...f, store: '' }));
      }
    } catch (err) {
      console.error('Check invite error:', err);
    }
  };

  const validate = () => {
    const errs = {};
    if (!fields.first.trim()) errs.first = 'First name is required';
    if (!fields.last.trim()) errs.last = 'Last name is required';
    if (!invite && !fields.store.trim()) errs.store = 'Your store name is required';
    if (!validateEmail(fields.email)) errs.email = 'Please enter a valid email address';
    if (!fields.pass || fields.pass.length < 8) errs.pass = 'Password must be at least 8 characters';
    if (!agreed) errs.agree = 'Please agree to the Terms of Service to continue.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors(prev => ({ ...prev, form: '' }));

    try {
      const response = await api.post('/auth/signup', {
        email: fields.email,
        password: fields.pass,
        firstName: fields.first,
        lastName: fields.last,
        storeName: invite ? undefined : fields.store
      });

      onVerificationPending(
        fields.email,
        response.data.message || 'Account created. Check your inbox to verify your email.'
      );
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        form: err.response?.data?.error || 'Something went wrong'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post('/auth/google', {
        idToken: credentialResponse.credential
      });

      onAuthenticated(response.data, navigate);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: error.response?.data?.error || 'Google sign in failed. Please try again.'
      }));
    }
  };

  const handleGoogleError = () => {
    setErrors(prev => ({
      ...prev,
      form: 'Google sign in failed. Please try again or use email sign up.'
    }));
  };

  return (
    <div>
      <div className="v-form-title">Create your account</div>
      <div className="v-form-sub">Start accepting payments in 5 minutes</div>

      <SocialButtons
        isSignup
        googleEnabled={googleEnabled}
        onGoogleSuccess={handleGoogleSuccess}
        onGoogleError={handleGoogleError}
      />

      <div className="v-divider">
        <div className="v-divider-line" />
        <div className="v-divider-text">or create account with email</div>
        <div className="v-divider-line" />
      </div>

      <div className="v-form-row">
        <div>
          <div className="v-label">First name</div>
          <input className={`v-input${errors.first ? ' error' : ''}`} type="text" placeholder="Amaka" value={fields.first} onChange={set('first')} />
          {errors.first && <div className="v-error">{errors.first}</div>}
        </div>
        <div>
          <div className="v-label">Last name</div>
          <input className={`v-input${errors.last ? ' error' : ''}`} type="text" placeholder="Okafor" value={fields.last} onChange={set('last')} />
          {errors.last && <div className="v-error">{errors.last}</div>}
        </div>
      </div>

      {!invite ? (
        <div className="v-form-group">
          <div className="v-label">Business / Store name</div>
          <div className="v-input-wrap">
            <span className="v-input-prefix">veya.app/</span>
            <input className={`v-input has-prefix${errors.store ? ' error' : ''}`} type="text" placeholder="Amaka's Fabrics" value={fields.store} onChange={set('store')} />
          </div>
          {fields.store && (
            <div className="v-hint">
              Your store URL: veya.app/{storeSlug}
            </div>
          )}
          {errors.store && <div className="v-error">{errors.store}</div>}
        </div>
      ) : (
        <div className="v-form-group">
          <div className="v-label">Store Connection</div>
          <div className="v-input" style={{ background: 'var(--bg3)', borderColor: 'var(--gold-dim)', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔗</span> Joining <strong>{invite.storeName}</strong> as <strong>{invite.role}</strong>
          </div>
          <div className="v-hint">Your account will be linked to this business automatically.</div>
        </div>
      )}

      <div className="v-form-group">
        <div className="v-label">Email address</div>
        <input className={`v-input${errors.email ? ' error' : ''}`} type="email" placeholder="amaka@example.com" value={fields.email} onChange={set('email')} onBlur={handleEmailBlur} />
        {errors.email && <div className="v-error">{errors.email}</div>}
      </div>

      <div className="v-form-group" style={{ marginBottom: 8 }}>
        <div className="v-label">Password</div>
        <div className="v-input-wrap">
          <input
            className={`v-input${errors.pass ? ' error' : ''}`}
            type={showPass ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={fields.pass}
            onChange={set('pass')}
          />
          <button className="v-input-icon" onClick={() => setShowPass(s => !s)}>
            {showPass ? '🙈' : '👁'}
          </button>
        </div>
        {strength && (
          <div className="v-strength">
            <div className="v-strength-track">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`v-strength-seg${i < strength.score ? ` ${strength.cls}` : ''}`} />
              ))}
            </div>
            <div className="v-strength-label" style={{ color: strength.color }}>{strength.label}</div>
          </div>
        )}
        {errors.pass && <div className="v-error">{errors.pass}</div>}
      </div>

      <div style={{ marginBottom: 16 }} />

      <label className="v-check-row" onClick={() => setAgreed(a => !a)}>
        <div className={`v-custom-check${agreed ? ' checked' : ''}`}>
          {agreed && <span style={{ fontSize: 11, fontWeight: 700, color: '#0a0a0b' }}>✓</span>}
        </div>
        <div className="v-check-label">
          I agree to Veya's <a href="#" onClick={e => e.stopPropagation()}>Terms of Service</a> and <a href="#" onClick={e => e.stopPropagation()}>Privacy Policy</a>. I understand my payments are settled via RGB Protocol on Bitcoin.
        </div>
      </label>
      {errors.agree && <div className="v-error" style={{ marginTop: -8, marginBottom: 8 }}>{errors.agree}</div>}

      <button className={`v-submit${loading ? ' loading' : ''}`} onClick={handleSubmit}>
        <span className="btn-text">Create Free Account →</span>
      </button>
      {errors.form && <div className="v-error" style={{ marginTop: 8 }}>{errors.form}</div>}

      <div className="v-switch">Already have an account? <span onClick={onSwitch}>Sign in →</span></div>
    </div>
  );
}

function SuccessScreen({ title, sub, onContinue, buttonLabel }) {
  return (
    <div className="v-success">
      <div className="v-success-circle">✓</div>
      <div className="v-success-title">{title}</div>
      <div className="v-success-sub">{sub}</div>
      <button className="v-submit" onClick={onContinue}>
        <span className="btn-text">{buttonLabel}</span>
      </button>
    </div>
  );
}

export default function AuthPage() {
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [mode, setMode] = useState('login');
  const [successData, setSuccessData] = useState({ title: '', sub: '' });

  const handleVerificationPending = (email, message) => {
    setSuccessData({
      title: 'Check your inbox',
      sub: `${message} We sent the verification link to ${email}.`
    });
    setMode('success');
  };

  return (
    <>
      <style>{css}</style>
      <div className="veya-root">
        {/* LEFT BRAND PANEL */}
        <div className="v-left">
          <div className="v-left-bg">
            <div className="v-grid" />
            <div className="v-orb1" />
            <div className="v-orb2" />
          </div>
          <div className="v-left-inner">
            <div className="v-brand">
              <div className="v-brand-mark"><span className="v-brand-v">V</span></div>
              <div className="v-brand-wordmark">
                <div className="v-brand-name">V<em>eya</em></div>
                <div className="v-brand-tag">Merchant OS</div>
              </div>
            </div>

            <div className="v-hero">
              <div className="v-eyebrow">Built for the real economy</div>
              <h1 className="v-headline">Your business,<br /><em>settled instantly.</em></h1>
              <p className="v-body">Create professional invoices, accept USDT payments, and build a verifiable payment history — all starting from zero, growing with every transaction you make.</p>
              <div className="v-proof-row">
                <div className="v-proof-item">
                  <div className="v-proof-val">600M+</div>
                  <div className="v-proof-label">Unbanked businesses</div>
                </div>
                <div className="v-proof-divider" />
                <div className="v-proof-item">
                  <div className="v-proof-val">&lt;5 min</div>
                  <div className="v-proof-label">To first invoice</div>
                </div>
                <div className="v-proof-divider" />
                <div className="v-proof-item">
                  <div className="v-proof-val">0 fees</div>
                  <div className="v-proof-label">To sign up</div>
                </div>
              </div>
            </div>

            <div className="v-testimonial">
              <div className="v-testimonial-text">"I sent my first USDT invoice in three minutes. My customer in Abuja paid before I even finished packing the order."</div>
              <div className="v-testimonial-author">
                <div className="v-avatar">A</div>
                <div>
                  <div className="v-author-name">Amaka Okafor</div>
                  <div className="v-author-role">Fabric trader · Lagos, Nigeria</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT AUTH PANEL */}
        <div className="v-right">
          <div className="v-auth-box">
            {mode !== 'success' && (
              <div className="v-toggle">
                <div className={`v-toggle-bg${mode === 'signup' ? ' right-side' : ''}`} />
                <button className={`v-tab${mode === 'login' ? ' active' : ''}`} onClick={() => setMode('login')}>Sign In</button>
                <button className={`v-tab${mode === 'signup' ? ' active' : ''}`} onClick={() => setMode('signup')}>Create Account</button>
              </div>
            )}

            {mode === 'login' && (
              <LoginForm
                onSwitch={() => setMode('signup')}
                onAuthenticated={persistAuth}
                googleEnabled={googleEnabled}
              />
            )}
            {mode === 'signup' && (
              <SignupForm
                onSwitch={() => setMode('login')}
                onVerificationPending={handleVerificationPending}
                onAuthenticated={persistAuth}
                googleEnabled={googleEnabled}
              />
            )}
            {mode === 'success' && (
              <SuccessScreen
                title={successData.title}
                sub={successData.sub}
                buttonLabel="Back to Sign In"
                onContinue={() => setMode('login')}
              />
            )}

            <div className="v-auth-footer">
              <div className="v-auth-footer-text">Powered by <span>UTEXO · RGB Protocol · Bitcoin</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
