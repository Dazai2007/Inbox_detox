import React, { useState, useEffect } from "react";
// YÖNLENDİRME DÜZELTMESİ: 'useNavigate' kaldırıldı, state yönetimi kullanılacak
// import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Chart.js kütüphaneleri (HomePage için eklendi)
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

// Chart.js bileşenlerini kaydet
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);


// --- İkon Komponentleri (AuthPage için) ---
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
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274 4.057 5.064 7 9.542 7 1.865 0 3.61 .588 5.029 1.566l-5.029 5.029zm-2.828-2.828l5.656 5.656M9.879 9.879l-5.657 5.657"
    />
  </svg>
);

const GoogleIcon: React.FC = () => (
  <svg
    className="w-5 h-5 mr-3 flex-shrink-0" /* Ezilmeyen logo */
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

// --- AuthPage Komponenti ---
// 'onLoginSuccess' fonksiyonunu prop olarak alır
const AuthPage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
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

  // YÖNLENDİRME DÜZELTMESİ: 'navigate' kaldırıldı, prop kullanılacak
  // const navigate = useNavigate();

  // API Base URL (Local test için)
  const API_BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | undefined;
    if (error) {
      setShowError(true);
      timerId = setTimeout(() => {
        setShowError(false);
      }, 5000);
    } else {
        setShowError(false);
    }
    return () => {
        if (timerId) {
            clearTimeout(timerId);
        }
    };
  }, [error]);


  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // DÜZELTME 2: Sunucunuz (auth.py) 'OAuth2PasswordRequestForm' bekliyor.
    // Bu nedenle veriyi JSON değil, 'URLSearchParams' (form-urlencoded) olarak göndermeliyiz.
    const urlEncodedData = new URLSearchParams();
    urlEncodedData.append('username', loginEmail);
    urlEncodedData.append('password', loginPassword);

    try {
      // DÜZELTME 4: Sunucuya formatı açıkça belirtmek için 'Content-Type' başlığı eklendi.
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        urlEncodedData,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      console.log('Giriş başarılı:', response.data);
      localStorage.setItem('accessToken', response.data.access_token);
      localStorage.setItem('refreshToken', response.data.refresh_token);

      // YÖNLENDİRME DÜZELTMESİ: 'navigate' yerine 'onLoginSuccess' prop'u çağrıldı
      onLoginSuccess();

    } catch (err) {
      console.error('Giriş hatası:', err);
      let errorMessage = 'Bağlantı hatası veya bilinmeyen bir hata oluştu.';
      if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 404) {
            errorMessage = 'API adresi bulunamadı. Lütfen adresi kontrol edin.';
          } else if (err.response.status === 0 && !err.response.data) {
             // 0B (Boş) yanıtı veya CORS hatası genellikle status 0 döner
             errorMessage = 'Sunucuya ulaşılamıyor veya sunucu boş yanıt döndü. (Backend çalışıyor mu?)';
          } else if (err.response.data && typeof err.response.data.detail === 'string') {
            // Backend'den gelen (401, 400 vb.) hata mesajı
            errorMessage = err.response.data.detail;
          } else {
            errorMessage = `Giriş sırasında bir hata oluştu (${err.response.status})`;
          }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      
      // DÜZELTME 3: 'first_name' ve 'last_name' kontrolü
      const nameParts = registerName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || ''; // Geri kalanlar

      // Backend 'last_name'i zorunlu tutuyor olabilir, bu yüzden kontrol edelim
      if (!lastName) {
          setError("Please enter both your first and last name in the 'Full Name' field.");
          return; // Backend'e istek göndermeyi durdur
      }

      setLoading(true);
      setError(null);

      try {
        // Kayıt işlemi JSON bekliyor (auth.py'ye göre)
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
            email: registerEmail,
            password: registerPassword,
            first_name: firstName, // 'full_name' yerine 'first_name'
            last_name: lastName    // ve 'last_name'
        });

        console.log('Kayıt başarılı:', response.data);
        
        // Kullanıcıyı 'login' sekmesine yönlendir
        setTab('login');
        setError(null); // Başarılı kayıttan sonra eski hataları temizle

      } catch (err) {
        console.error('Kayıt hatası:', err);
        let errorMessage = 'Bağlantı hatası veya bilinmeyen bir hata oluştu.';
        if (axios.isAxiosError(err) && err.response) {
            if (err.response.status === 404) {
                errorMessage = 'API adresi bulunamadı. Lütfen adresi kontrol edin.';
            } else if (err.response.data) {
              // Hata mesajını düzgün göstermek için
              if (typeof err.response.data.detail === 'string') {
                  errorMessage = err.response.data.detail;
              } else if (Array.isArray(err.response.data.detail)) {
                  // 422 Hatasını göster
                  errorMessage = err.response.data.detail[0].msg || `Kayıt hatası (${err.response.status})`;
              } else {
                  errorMessage = `Kayıt sırasında bir hata oluştu (${err.response.status})`;
              }
            }
        } else if (err instanceof Error) {
            errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
  };


  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-white font-poppins overflow-hidden">
      
      {/* Toast Bildirimi */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 w-auto max-w-sm bg-red-500 text-white rounded-md shadow-lg transition-all duration-500 ease-in-out ${showError ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}
      >
        {error}
      </div>

      {/* Ana Kutu */}
      <div className="container flex w-[900px] max-w-[95%] min-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Sol Panel */}
        <div className="info-panel w-[45%] bg-gradient-to-b from-blue-600 to-blue-800 text-white p-16 hidden md:flex flex-col justify-center">
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

        {/* Sağ Panel */}
        <div className="form-panel w-full md:w-[55%] p-8 sm:p-12 relative overflow-hidden font-poppins bg-gray-100">
          
          {/* Tabs */}
          <div className="tabs flex mb-8 border-b border-gray-200">
              <button className={`tab-button flex-1 py-4 text-xl font-semibold relative transition-colors duration-300 ${tab === 'login' ? 'active text-blue-600' : 'text-gray-500 hover:text-blue-500'}`} onClick={() => setTab('login')} >Sign In</button>
              <button className={`tab-button flex-1 py-4 text-xl font-semibold relative transition-colors duration-300 ${tab === 'register' ? 'active text-blue-600' : 'text-gray-500 hover:text-blue-500'}`} onClick={() => setTab('register')} >Create Account</button>
          </div>

          {/* Form Wrapper */}
          <div className="form-wrapper relative w-full h-auto">
            
            {/* Login Form */}
            <form id="login-form" className={`absolute top-0 left-0 w-full flex flex-col gap-4 transition-all duration-700 ${tab === 'login' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-full z-0 pointer-events-none'}`} onSubmit={handleLoginSubmit} >
              <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome Back</h2>
              <div><label htmlFor="login-email" className="form-label">Email Address</label><input id="login-email" type="email" placeholder="you@company.com" required className="form-input text-gray-900" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={loading} /></div>
              <div><label htmlFor="login-password" className="form-label">Password</label><div className="relative"><input id="login-password" type={showLoginPassword ? 'text' : 'password'} placeholder="" required className="form-input pr-10 text-gray-900" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} disabled={loading} /><button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => setShowLoginPassword(!showLoginPassword)} disabled={loading}>{showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}</button></div></div>
              <div className="options flex justify-between items-center text-sm"><label className="flex items-center cursor-pointer text-gray-600"><input type="checkbox" className="mr-2 accent-blue-600" /> Remember me</label><a href="#" className="text-blue-600 hover:underline text-sm">Forgot password?</a></div>
              <button type="submit" className="submit-btn bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50" disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</button>
              <div className="divider flex items-center justify-center my-1"><hr className="flex-grow border-gray-300" /><span className="mx-4 text-gray-500 text-sm">OR</span><hr className="flex-grow border-gray-300" /></div>
              <button type="button" className="google-btn" disabled={loading}> <GoogleIcon /> Sign In with Google </button>
              <p className="text-center text-gray-600 text-sm">Don't have an account? <span onClick={() => { setTab('register'); setError(null); }} className="text-blue-600 hover:underline cursor-pointer">Create one</span></p>
            </form>

            {/* Register Form */}
            <form id="register-form" className={`absolute top-0 left-0 w-full flex flex-col gap-4 transition-all duration-700 ${tab === 'register' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-full z-0 pointer-events-none'}`} onSubmit={handleRegisterSubmit}>
              <h2 className="text-3xl font-bold mb-2 text-gray-800">Create Your Account</h2>
              <div><label htmlFor="register-fullname" className="form-label">Full Name</label><input id="register-fullname" type="text" placeholder="Your Name" required className="form-input text-gray-900" value={registerName} onChange={(e) => setRegisterName(e.target.value)} disabled={loading} /></div>
              <div><label htmlFor="register-email" className="form-label">Email Address</label><input id="register-email" type="email" placeholder="you@company.com" required className="form-input text-gray-900" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} disabled={loading} /></div>
              <div><label htmlFor="register-password" className="form-label">Create Password</label><div className="relative"><input id="register-password" type={showRegisterPassword ? 'text' : 'password'} placeholder="" required className="form-input pr-10 text-gray-900" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} disabled={loading} /><button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => setShowRegisterPassword(!showRegisterPassword)} disabled={loading}>{showRegisterPassword ? <EyeOffIcon /> : <EyeIcon />}</button></div></div>
              <button type="submit" className="submit-btn bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</button>
              <div className="divider flex items-center justify-center my-1"><hr className="flex-grow border-gray-300" /><span className="mx-4 text-gray-500 text-sm">OR</span><hr className="flex-grow border-gray-300" /></div>
              <button type="button" className="google-btn" disabled={loading}> <GoogleIcon /> Sign Up with Google </button>
              <p className="text-center text-gray-600 text-sm">Already have an account? <span onClick={() => { setTab('login'); setError(null); }} className="text-blue-600 hover:underline cursor-pointer">Sign In</span></p>
            </form>
          </div>
        </div>
      </div>

      {/* CSS Stilleri (AuthPage için) */}
      <style>{`
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .form-label {
          @apply text-sm font-semibold text-gray-600 mb-2 block;
        }
        .form-input {
          @apply w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow;
        }
        .submit-btn {
          @apply w-full py-3 px-4 rounded-lg font-bold text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5;
        }
        .google-btn {
          @apply w-full py-3 px-4 rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center;
        }
        .tab-button.active::after {
          content: '';
          @apply absolute bottom-0 left-0 w-full h-1 bg-blue-600 transition-all duration-300;
        }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-800 { animation-delay: 800ms; }

        @keyframes slideInFromLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInFromLeft {
          animation: slideInFromLeft 0.7s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// --- HomePage Komponenti (Dashboard) ---
// 'onLogout' fonksiyonunu prop olarak alır
const HomePage: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  // Pie chart data
  const emailData = {
    labels: ["Important", "Spam", "Newsletter", "Promotion"],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: ["#2563eb", "#ef4444", "#f59e0b", "#10b981"],
        hoverOffset: 4,
      },
    ],
  };

  // Bar chart data
  const campaignData = {
    labels: ["Campaign A", "Campaign B", "Campaign C"],
    datasets: [
      {
        label: "Open Rate (%)",
        data: [65, 59, 80],
        backgroundColor: "#2563eb",
      },
      {
        label: "Click Rate (%)",
        data: [28, 48, 40],
        backgroundColor: "#10b981",
      },
    ],
  };

  return (
    // Tailwind sınıfları kullanılarak yeniden düzenlenen Dashboard
     <div className="flex h-screen w-full bg-gray-100 font-poppins">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col flex-shrink-0">
        <div className="p-6 text-2xl font-bold text-blue-600 border-b">Nexivo</div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center p-3 rounded-lg bg-blue-100 text-blue-700 font-semibold">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            Dashboard
          </a>
          <a href="#" className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Emails
          </a>
          <a href="#" className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100">
             <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
            Analytics
          </a>
          <a href="#" className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Settings
          </a>
        </nav>
        {/* Logout Button */}
        <div className="p-4 mt-auto border-t">
           <button
            onClick={onLogout}
            className="flex items-center justify-center w-full p-3 rounded-lg text-red-600 hover:bg-red-100 font-semibold transition-colors"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-semibold text-gray-800">Welcome back, Saleh 👋</h2>
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-gray-700 hidden sm:block">👤 Saleh</span>
            {/* Bildirim ikonu eklenebilir */}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-6 rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="text-4xl font-bold">120</div>
              <div className="text-lg">📧 Total Emails</div>
            </div>
             <div className="p-6 rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="text-4xl font-bold">3</div>
              <div className="text-lg">📈 Active Campaigns</div>
            </div>
             <div className="p-6 rounded-lg shadow-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <div className="text-4xl font-bold">Yes</div>
              <div className="text-lg">✅ Verified</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Email Categories</h3>
              <div className="h-64 md:h-80 flex justify-center items-center">
                <Pie data={emailData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
            <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Campaign Performance</h3>
               <div className="h-64 md:h-80 flex justify-center items-center">
                <Bar data={campaignData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};


// --- Ana APP BİLEŞENİ (Yönetici) ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Sayfa yüklendiğinde token'ı kontrol et
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // TODO: Burada token'ı doğrulamak için bir API isteği atılabilir
      // Şimdilik token varsa giriş yapmış varsayıyoruz
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
  };

  // Giriş durumuna göre doğru sayfayı render et
  // App bileşenini sarmalayan fragment'ı kaldırıp tek bir root element döndürüyoruz
  if (isLoggedIn) {
    return <HomePage onLogout={handleLogout} />;
  } else {
    return <AuthPage onLoginSuccess={handleLogin} />;
  }
}

