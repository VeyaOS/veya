import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  .veya-reset-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0b;
    color: #f0ede8;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    padding: 24px;
  }
  .vr-card {
    width: 100%;
    max-width: 440px;
    background: #111114;
    border: 1px solid #ffffff18;
    border-radius: 14px;
    padding: 40px;
    position: relative;
    overflow: hidden;
  }
  .vr-card::before {
    content:''; position:absolute; top:-100px; right:-100px; width:200px; height:200px;
    background: radial-gradient(circle, #f5a62315 0%, transparent 70%); border-radius:50%;
  }
  .vr-logo { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; font-style: italic; color: #f0ede8; margin-bottom: 24px; text-align: center; }
  .vr-logo span { color: #f5a623; }
  .vr-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; font-style: italic; margin-bottom: 8px; text-align: center; }
  .vr-sub { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #9e9b94; text-align: center; margin-bottom: 32px; letter-spacing: 0.04em; }
  .vr-input-wrap { position: relative; margin-bottom: 20px; }
  .vr-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; color: #5a5750; margin-bottom: 8px; display: block; letter-spacing: 0.1em; text-transform: uppercase; }
  .vr-input { width: 100%; background: #18181d; border: 1px solid #ffffff28; border-radius: 10px; padding: 14px 16px; font-size: 14px; color: #f0ede8; outline: none; transition: 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
  .vr-input:focus { border-color: #f5a623; box-shadow: 0 0 0 3px #f5a62318; }
  .vr-btn { width: 100%; padding: 14px; background: #f5a623; color: #0a0a0b; border: none; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
  .vr-btn:hover:not(:disabled) { background: #e8931a; }
  .vr-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .vr-error { color: #ef4444; font-size: 12px; margin-top: 8px; font-family: 'JetBrains Mono', monospace; text-align: center; }
  .vr-success { color: #22c55e; font-size: 13px; text-align: center; margin-bottom: 24px; line-height: 1.6; }
`;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/auth'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="veya-reset-root">
        <div className="vr-card">
          <div className="vr-logo">V<span>eya</span></div>
          <div className="vr-title">Reset Password</div>
          <div className="vr-sub">Enter your new secure password below</div>
          
          {success ? (
            <div className="vr-success">
              Password successfully reset! <br/><br/>
              Redirecting you to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="vr-input-wrap">
                <label className="vr-label">New Password</label>
                <input 
                  type="password" 
                  className="vr-input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!token || loading}
                />
              </div>
              {error && <div className="vr-error">{error}</div>}
              
              <button type="submit" className="vr-btn" disabled={!token || loading} style={{ marginTop: '12px' }}>
                {loading ? 'Resetting...' : 'Secure Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
