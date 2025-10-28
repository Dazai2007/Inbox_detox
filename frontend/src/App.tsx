
import React, { useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login');

  const showForm = (formType: 'login' | 'register') => {
    setActiveForm(formType);
  };

  return (
    <div className="container">
      {/* Sol Taraf: Hoş Geldiniz Bölümü */}
      <div className="welcome-section">
        <div className="logo">
          <i className="fas fa-inbox"></i> NEXIVO
        </div>
        <h1 className="welcome-title">Hello Nexivo</h1>
        <p className="welcome-text">Join the email productivity revolution. Manage your inbox smarter, faster, and with less stress.</p>
        <ul className="features">
          <li>AI-powered email sorting</li>
          <li>Smart templates & automation</li>
          <li>Focused inbox experience</li>
          <li>Cross-platform sync</li>
        </ul>
      </div>
      {/* Sağ Taraf: Form Bölümü */}
      <div className="form-section">
        <div className="form-container">
          <div className="tabs">
            <div className={`tab ${activeForm === 'login' ? 'active' : ''}`} onClick={() => showForm('login')}>Sign In</div>
            <div className={`tab ${activeForm === 'register' ? 'active' : ''}`} onClick={() => showForm('register')}>Create Account</div>
          </div>
          {/* Login Form */}
          <div id="login-form" className={`form ${activeForm === 'login' ? 'active' : ''}`}>
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
            <div className="login-options">
              <div className="checkbox">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            <button className="btn">
              <i className="fas fa-sign-in-alt"></i> Sign In
            </button>
            <div className="divider">OR</div>
            <button className="btn btn-google">
              <i className="fab fa-google"></i> Sign in with Google
            </button>
            <div className="footer-text">
              Don't have an account? <span className="link" onClick={() => showForm('register')}>Create one</span>
            </div>
          </div>
          {/* Register Form */}
          <div id="register-form" className={`form ${activeForm === 'register' ? 'active' : ''}`}>
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
              <i className="fas fa-user-plus"></i> Create Account
            </button>
            <div className="divider">OR</div>
            <button className="btn btn-google">
              <i className="fab fa-google"></i> Sign up with Google
            </button>
            <div className="footer-text">
              Already have an account? <span className="link" onClick={() => showForm('login')}>Sign in</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default App;


