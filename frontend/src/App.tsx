
import React, { useState } from "react";
import { FaInbox, FaCheck, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  :root {
    --primary: #6366f1;
    --primary-dark: #4f46e5;
    --secondary: #f8fafc;
    --text: #1e293b;
    --text-light: #64748b;
    --border: #e2e8f0;
    --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
  body, #nexivo-root {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .container {
    display: flex;
    width: 100%;
    max-width: 1000px;
    height: 650px;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow);
    animation: fadeIn 0.8s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .welcome-section {
    flex: 1;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: white;
    padding: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .welcome-section::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: scale(0);
    animation: pulse 8s infinite;
  }
  @keyframes pulse {
    0%, 100% { transform: scale(0); opacity: 1; }
    50% { transform: scale(1); opacity: 0; }
  }
  .logo {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }
  .logo svg {
    margin-right: 10px;
    font-size: 32px;
  }
  .welcome-title {
    font-size: 42px;
    font-weight: 700;
    margin-bottom: 20px;
    line-height: 1.2;
  }
  .welcome-text {
    font-size: 18px;
    line-height: 1.6;
    opacity: 0.9;
    margin-bottom: 30px;
  }
  .features {
    list-style: none;
    margin-top: 30px;
  }
  .features li {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
  }
  .features svg {
    margin-right: 10px;
    background: rgba(255, 255, 255, 0.2);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    padding: 6px;
  }
  .form-section {
    flex: 1;
    padding: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: var(--secondary);
  }
  .form-container {
    max-width: 400px;
    width: 100%;
    margin: 0 auto;
  }
  .form-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 8px;
    text-align: center;
  }
  .form-subtitle {
    color: var(--text-light);
    margin-bottom: 30px;
    text-align: center;
    font-size: 16px;
  }
  .tabs {
    display: flex;
    margin-bottom: 30px;
    border-bottom: 1px solid var(--border);
    justify-content: center;
  }
  .tab {
    padding: 12px 24px;
    cursor: pointer;
    font-weight: 600;
    color: var(--text-light);
    transition: all 0.3s;
    position: relative;
    font-size: 16px;
  }
  .tab.active {
    color: var(--primary);
  }
  .tab.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--primary);
  }
  .form {
    display: none;
  }
  .form.active {
    display: block;
    animation: slideIn 0.5s ease-out;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .input-group {
    margin-bottom: 20px;
    position: relative;
  }
  .input-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--text);
    font-size: 14px;
    text-transform: none;
  }
  .input-group input {
    width: 100%;
    padding: 15px;
    border: 2px solid var(--border);
    border-radius: 10px;
    font-size: 16px;
    transition: all 0.3s;
    background: white;
  }
  .input-group input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    outline: none;
  }
  .input-group input::placeholder {
    color: #94a3b8;
    font-size: 14px;
  }
  .name-row {
    display: flex;
    gap: 15px;
  }
  .name-row .input-group {
    flex: 1;
  }
  .checkbox {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    font-size: 14px;
  }
  .checkbox input {
    margin-right: 10px;
  }
  .btn {
    width: 100%;
    padding: 15px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
  }
  .btn:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }
  .btn svg {
    margin-right: 10px;
  }
  .divider {
    text-align: center;
    margin: 25px 0;
    position: relative;
    color: var(--text-light);
    font-size: 14px;
  }
  .divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 45%;
    height: 1px;
    background: var(--border);
  }
  .divider::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 0;
    width: 45%;
    height: 1px;
    background: var(--border);
  }
  .btn-google {
    background: white;
    color: var(--text);
    border: 2px solid var(--border);
  }
  .btn-google:hover {
    background: #f8fafc;
    border-color: var(--primary);
  }
  .footer-text {
    text-align: center;
    margin-top: 20px;
    color: var(--text-light);
    font-size: 14px;
  }
  .footer-text a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
  }
  .footer-text a:hover {
    text-decoration: underline;
  }
  @media (max-width: 768px) {
    .container {
      flex-direction: column;
      height: auto;
    }
    .welcome-section {
      padding: 30px;
    }
    .form-section {
      padding: 30px;
    }
  }
`;

function App() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <div id="nexivo-root">
      <style>{styles}</style>
      <div className="container">
        {/* Left: Welcome Section */}
        <div className="welcome-section">
          <div className="logo">
            <FaInbox /> NEXIVO
          </div>
          <h1 className="welcome-title">Hello Nexivo</h1>
          <p className="welcome-text">
            Join the email productivity revolution. Manage your inbox smarter, faster, and with less stress.
          </p>
          <ul className="features">
            <li>AI-powered email sorting</li>
            <li>Smart templates & automation</li>
            <li>Focused inbox experience</li>
            <li>Cross-platform sync</li>
          </ul>
        </div>
        {/* Right: Form Section */}
        <div className="form-section">
          <div className="form-container">
            <div className="tabs">
              <div
                className={`tab${activeTab === 'login' ? ' active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Sign In
              </div>
              <div
                className={`tab${activeTab === 'register' ? ' active' : ''}`}
                onClick={() => setActiveTab('register')}
              >
                Create Account
              </div>
            </div>
            {/* Login Form */}
            <div id="login-form" className={`form${activeTab === 'login' ? ' active' : ''}`}>
              <h2 className="form-title">Welcome Back</h2>
              <p className="form-subtitle">Sign in to your account to continue</p>
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" placeholder="Enter your email address" />
              </div>
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" placeholder="Enter your password" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div className="checkbox">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Forgot password?</a>
              </div>
              <button className="btn">
                <FaSignInAlt /> Sign In
              </button>
              <div className="divider">OR</div>
              <button className="btn btn-google">
                <FcGoogle /> Sign in with Google
              </button>
              <div className="footer-text">
                Don't have an account?{' '}
                <a href="#" onClick={e => { e.preventDefault(); setActiveTab('register'); }}>Create one</a>
              </div>
            </div>
            {/* Register Form */}
            <div id="register-form" className={`form${activeTab === 'register' ? ' active' : ''}`}>
              <h2 className="form-title">Get Started</h2>
              <p className="form-subtitle">Create your account to join the revolution</p>
              <div className="name-row">
                <div className="input-group">
                  <label htmlFor="firstname">First Name</label>
                  <input type="text" id="firstname" placeholder="Enter your first name" />
                </div>
                <div className="input-group">
                  <label htmlFor="lastname">Last Name</label>
                  <input type="text" id="lastname" placeholder="Enter your last name" />
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="reg-email">Email Address</label>
                <input type="email" id="reg-email" placeholder="Enter your email address" />
              </div>
              <div className="input-group">
                <label htmlFor="reg-password">Password</label>
                <input type="password" id="reg-password" placeholder="Create a secure password" />
              </div>
              <div className="input-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input type="password" id="confirm-password" placeholder="Confirm your password" />
              </div>
              <div className="checkbox">
                <input type="checkbox" id="terms" />
                <label htmlFor="terms">I agree to the Terms of Service and Privacy Policy</label>
              </div>
              <button className="btn">
                <FaUserPlus /> Create Account
              </button>
              <div className="divider">OR</div>
              <button className="btn btn-google">
                <FcGoogle /> Sign up with Google
              </button>
              <div className="footer-text">
                Already have an account?{' '}
                <a href="#" onClick={e => { e.preventDefault(); setActiveTab('login'); }}>Sign in</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
