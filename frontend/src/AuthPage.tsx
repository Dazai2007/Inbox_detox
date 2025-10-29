import React, { useState, useEffect } from "react"; 
import axios from 'axios'; 
// import { useNavigate } from "react-router-dom"; 

// --- İkon Komponentleri ---
const CheckIcon: React.FC = () => ( 
  <svg className="w-5 h-5 mr-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> 
  </svg>
);

const EyeIcon: React.FC = () => (
  <svg
    className="w-5 h-5" 
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2} 
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon: React.FC = () => (
  <svg
    className="w-5 h-5" 
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2} 
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.865 0 3.61 .588 5.029 1.566l-5.029 5.029zm-2.828-2.828l5.656 5.656M9.879 9.879l-5.657 5.657"
    />
  </svg>
);

const GoogleIcon: React.FC = () => (
  <svg
    className="w-5 h-5 mr-3 flex-shrink-0" 
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M44.5 24.5c0-1.76-0.16-3.46-0.47-5.11H24v9.63h11.23c-0.49 2.58-2.07 4.74-4.57 6.18v7.8h9.87c5.77-5.3 9.17-13.06 9.17-21.93z" fill="#4285F4"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M24 45.47c6.48 0 11.96-2.16 15.94-5.87l-9.87-7.8c-2.73 1.83-6.26 2.92-10.07 2.92-7.73 0-14.26-5.18-16.63-12.18H1.34v8.03c4.07 7.97 12.33 13.52 22.66 13.52z" fill="#34A853"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M7.37 28.32c-0.65-1.92-1.01-3.96-1.01-6.12s0.36-4.2 1.01-6.12V7.95H1.34c-1.33 2.65-2.08 5.6-2.08 8.65s0.75 6 2.08 8.65L7.37 28.32z" fill="#FBBC05"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M24 15.4c4.46 0 7.93 1.87 9.68 3.59L38.4 14C34.42 10.15 29.58 8 24 8c-10.33 0-18.6 5.55-22.66 13.52l6.03 4.75c2.37-7 8.9-12.18 16.63-12.18z" fill="#EA4335"/>
  </svg>
);

// --- Ana Sayfa Komponenti ---
const AuthPage: React.FC = () => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false); 

  // const navigate = useNavigate();

  useEffect(() => {
    // 👇👇👇 HATA DÜZELTMESİ BURADA 👇👇👇
    let timer: number | undefined; // NodeJS.Timeout -> number
    if (error) {
      setShowError(true); 
      timer = setTimeout(() => {
        setShowError(false); 
      }, 5000); 
    } else {
       setShowError(false); 
    }
    // Cleanup function
    return () => {
        // timer değişkeninin tanımlı olup olmadığını kontrol et
        if (typeof timer !== 'undefined') { 
             clearTimeout(timer);
        }
    };
  }, [error]); 


  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    setLoading(true); 
    setError(null);   
    
    const formData = new FormData();
    formData.append('username', loginEmail); 
    formData.append('password', loginPassword);

    try {
      const response = await axios.post('/api/auth/login', formData); 

      console.log('Giriş başarılı:', response.data);
      localStorage.setItem('accessToken', response.data.access_token);
      localStorage.setItem('refreshToken', response.data.refresh_token); 
      
      alert('Giriş Başarılı!'); 
      // navigate('/dashboard'); 

    } catch (err) {
      console.error('Giriş hatası:', err);
      let errorMessage = 'Bağlantı hatası veya bilinmeyen bir hata oluştu.';
      if (axios.isAxiosError(err) && err.response) {
         errorMessage = err.response.data.detail || 'Giriş sırasında bir hata oluştu.';
      }
      setError(errorMessage); 
    } finally {
      setLoading(false); 
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
     event.preventDefault();
     setLoading(true);
     setError(null);

     try {
        const response = await axios.post('/api/auth/register', {
            email: registerEmail,
            password: registerPassword,
            full_name: registerName,
        });
        console.log('Kayıt başarılı:', response.data);
        alert('Kayıt Başarılı! Lütfen giriş yapın.');
        setTab('login'); 
        setError(null); 

     } catch (err) {
        console.error('Kayıt hatası:', err);
        let errorMessage = 'Bağlantı hatası veya bilinmeyen bir hata oluştu.';
        if (axios.isAxiosError(err) && err.response) {
           errorMessage = err.response.data.detail || 'Kayıt sırasında bir hata oluştu.';
        }
        setError(errorMessage); 
     } finally {
        setLoading(false);
     }
  };


  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-white font-poppins overflow-hidden"> 
      
      <div 
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 w-auto max-w-sm bg-red-500 text-white rounded-md shadow-lg transition-all duration-500 ease-in-out
                    ${showError ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}
      >
        {error}
      </div>

      <div className="container flex w-[900px] max-w-[95%] min-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="info-panel w-[45%] bg-gradient-to-b from-blue-600 to-blue-800 text-white p-16 flex flex-col justify-center">
         <h1 className="text-5xl font-bold mb-5 animate-slideInFromLeft">Hello Nexivo</h1>
          <p className="text-lg mb-8 opacity-0 animate-fadeIn animation-delay-500 leading-relaxed">
            Join the email productivity revolution. Manage your inbox smarter, faster, and with less stress.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center opacity-0 animate-fadeIn animation-delay-800 text-base"><CheckIcon /> AI-powered email sorting</li>
            <li className="flex items-center opacity-0 animate-fadeIn animation-delay-800 text-base"><CheckIcon /> Smart templates & automation</li>
            <li className="flex items-center opacity-0 animate-fadeIn animation-delay-800 text-base"><CheckIcon /> Focused inbox experience</li>
            <li className="flex items-center opacity-0 animate-fadeIn animation-delay-800 text-base"><CheckIcon /> Cross-platform sync</li>
          </ul>
        </div>

        <div className="form-panel w-[55%] p-12 relative overflow-hidden font-poppins bg-gray-100"> 
          
          <div className="tabs flex mb-8 border-b border-gray-200">
              <button
                className={`tab-button flex-1 py-4 text-xl font-semibold relative transition-colors duration-300 ${tab === 'login' ? 'active text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                onClick={() => setTab('login')} 
              >
                Sign In
              </button>
              <button
                className={`tab-button flex-1 py-4 text-xl font-semibold relative transition-colors duration-300 ${tab === 'register' ? 'active text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                onClick={() => setTab('register')} 
              >
                Create Account
              </button>
          </div>

          <div className="form-wrapper relative w-full h-auto"> 
            
            <form
              id="login-form"
              className={`absolute top-0 left-0 w-full flex flex-col gap-4 transition-all duration-700 ${tab === 'login' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-full z-0 pointer-events-none'}`}
              onSubmit={handleLoginSubmit} 
            >
              <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome Back</h2>

              <div>
                <label htmlFor="login-email" className="form-label">Email Address</label>
                <input id="login-email" type="email" placeholder="you@company.com" required className="form-input text-gray-900" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={loading} />
              </div>
              
              <div>
                <label htmlFor="login-password" className="form-label">Password</label>
                <div className="relative">
                  <input id="login-password" type={showLoginPassword ? 'text' : 'password'} placeholder="" required className="form-input pr-10 text-gray-900" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} disabled={loading} />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => setShowLoginPassword(!showLoginPassword)} disabled={loading}>
                     {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />} 
                  </button> 
                </div>
              </div>
              
              <div className="options flex justify-between items-center text-sm">
                <label className="flex items-center cursor-pointer text-gray-600">
                  <input type="checkbox" className="mr-2 accent-blue-600" /> Remember me
                </label>
                <a href="#" className="text-blue-600 hover:underline text-sm">Forgot password?</a>
              </div>
              
              <button type="submit" className="submit-btn bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="divider flex items-center justify-center my-1"> 
                <hr className="flex-grow border-gray-300" />
                <span className="mx-4 text-gray-500 text-sm">OR</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              <button type="button" className="google-btn" disabled={loading}> <GoogleIcon /> Sign In with Google </button>
              
              <p className="text-center text-gray-600 text-sm"> 
                Don't have an account? <span onClick={() => setTab('register')} className="text-blue-600 hover:underline cursor-pointer">Create one</span>
              </p>
            </form>

            <form
              id="register-form"
              className={`absolute top-0 left-0 w-full flex flex-col gap-4 transition-all duration-700 ${tab === 'register' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-full z-0 pointer-events-none'}`}
              onSubmit={handleRegisterSubmit}
            >
              <h2 className="text-3xl font-bold mb-2 text-gray-800">Create Your Account</h2>

              <div>
                <label htmlFor="register-fullname" className="form-label">Full Name</label>
                <input id="register-fullname" type="text" placeholder="Your Name" required className="form-input text-gray-900" value={registerName} onChange={(e) => setRegisterName(e.target.value)} disabled={loading} />
              </div>
              
              <div>
                <label htmlFor="register-email" className="form-label">Email Address</label>
                <input id="register-email" type="email" placeholder="you@company.com" required className="form-input text-gray-900" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} disabled={loading} />
              </div>
              
              <div>
                <label htmlFor="register-password" className="form-label">Create Password</label>
                <div className="relative">
                  <input id="register-password" type={showRegisterPassword ? 'text' : 'password'} placeholder="" required className="form-input pr-10 text-gray-900" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} disabled={loading} />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => setShowRegisterPassword(!showRegisterPassword)} disabled={loading}>
                    {showRegisterPassword ? <EyeOffIcon /> : <EyeIcon />} 
                  </button>
                </div>
              </div>
              
              <button type="submit" className="submit-btn bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="divider flex items-center justify-center my-1"> 
                <hr className="flex-grow border-gray-300" />
                <span className="mx-4 text-gray-500 text-sm">OR</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              <button type="button" className="google-btn" disabled={loading}> <GoogleIcon /> Sign Up with Google </button>
              
              <p className="text-center text-gray-600 text-sm"> 
                Already have an account? <span onClick={() => setTab('login')} className="text-blue-600 hover:underline cursor-pointer">Sign In</span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}; 

export default AuthPage;