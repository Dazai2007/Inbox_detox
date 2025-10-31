import React, { useState, useEffect } from "react";
import axios from 'axios';
// YÖNLENDİRME DÜZELTMESİ: 'react-router-dom' kaldırıldı
// import { useNavigate } from "react-router-dom";

// YENİ EKLENEN IMPORTLAR (Chart.js)
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

// YENİ EKLENDİ: Chart.js elementlerini kaydet
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);


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
// YÖNLENDİRME DÜZELTMESİ: 'onLoginSuccess' prop'u eklendi
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

  // YÖNLENDİRME DÜZELTMESİ: 'navigate' fonksiyonu kaldırıldı
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

    // DÜZELTME 3: Veri 'application/json' olarak gönderiliyor.
    const loginData = {
      username: loginEmail,
      password: loginPassword
    };

    try {
      // DÜZELTME: 'urlEncodedData' yerine 'loginData' (JSON) gönderildi.
      // Axios, bir nesne gönderildiğinde bunu otomatik olarak JSON'a çevirir.
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, loginData);

      console.log('Giriş başarılı:', response.data);
      localStorage.setItem('accessToken', response.data.access_token);
      localStorage.setItem('refreshToken', response.data.refresh_token);

      // YÖNLENDİRME DÜZELTMESİ: 'navigate' yerine 'onLoginSuccess' çağrıldı
      onLoginSuccess();

    } catch (err) {
      console.error('Giriş hatası:', err);
      let errorMessage = 'Bağlantı hatası veya bilinmeyen bir hata oluştu.';
      if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 404) {
            errorMessage = 'API adresi bulunamadı. Lütfen adresi kontrol edin.';
          } else {
            // Hata mesajını düzgün göstermek için
            if (typeof err.response.data.detail === 'string') {
                errorMessage = err.response.data.detail;
            } else {
                errorMessage = `Giriş sırasında bir hata oluştu (${err.response.status})`;
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

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      
      const nameParts = registerName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      if (!lastName) {
          setError("Please enter both your first and last name in the 'Full Name' field.");
          return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
            email: registerEmail,
            password: registerPassword,
            first_name: firstName,
            last_name: lastName
        });

        console.log('Kayıt başarılı:', response.data);
        
        // Kullanıcıyı 'login' sekmesine yönlendir
        setTab('login');
        setError(null);

      } catch (err) {
        console.error('Kayıt hatası:', err);
        let errorMessage = 'Bağlantı hatası veya bilinmeyen bir hata oluştu.';
        if (axios.isAxiosError(err) && err.response) {
            if (err.response.status === 404) {
                errorMessage = 'API adresi bulunamadı. Lütfen adresi kontrol edin.';
            } else {
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

  // AuthPage'in JSX (return) kısmı... Kodunuzla aynı, değişiklik yok.
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

        {/* Sağ Panel */}
        <div className="form-panel w-[55%] p-12 relative overflow-hidden font-poppins bg-gray-100">
          
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
    </div>
  );
};


// --- ANA SAYFA KOMPONENTİ (GÜNCELLENDİ) ---
// HATA DÜZELTMESİ: Fazlalık olan 'HomePage' tanımı kaldırıldı.
// Burası sizin sağladığınız dashboard koduyla ve Tailwind CSS ile güncellendi
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
        backgroundColor: "rgba(37, 99, 235, 0.8)", // blue-600
        borderRadius: 4,
      },
      {
        label: "Click Rate (%)",
        data: [28, 48, 40],
        backgroundColor: "rgba(16, 185, 129, 0.8)", // emerald-500
        borderRadius: 4,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1' // Grafik etiketlerini açık renk yapar (opsiyonel)
        }
      }
    },
    scales: {
      y: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(203, 213, 225, 0.1)' }
      },
      x: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(203, 213, 225, 0.1)' }
      }
    }
  };
  
  const pieChartOptions = {
     responsive: true,
     maintainAspectRatio: false,
     plugins: {
      legend: {
        position: 'bottom' as const, // Etiketleri alta alır
        labels: {
          color: '#334155' // Etiket rengi (açık zemin için)
        }
      }
    }
  };
  
  const barChartOptions = {
     responsive: true,
     maintainAspectRatio: false,
     plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#334155'
        }
      }
    },
    scales: {
      y: {
        ticks: { color: '#334155' },
        grid: { color: 'rgba(51, 65, 85, 0.1)' }
      },
      x: {
        ticks: { color: '#334155' },
        grid: { color: 'rgba(51, 65, 85, 0.1)' }
      }
    }
  };


  return (
    // Ana layout: Sidebar + Ana içerik
    <div className="flex h-screen w-full bg-gray-100 font-poppins">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col p-4 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Nexivo</h1>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li className="flex items-center p-3 bg-gray-700 rounded-lg text-white font-semibold cursor-pointer">
              <span className="mr-3 text-xl">📊</span> Dashboard
            </li>
            <li className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
              <span className="mr-3 text-xl">📧</span> Emails
            </li>
            <li className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
              <span className="mr-3 text-xl">📈</span> Analytics
            </li>
            <li className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
              <span className="mr-3 text-xl">⚙️</span> Settings
            </li>
          </ul>
        </nav>
        {/* Çıkış Butonu Sidebar'ın altında */}
        <div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center p-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors duration-200"
          >
            <span className="mr-2 text-xl">🚪</span> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Ana İçerik Alanı (Navbar + Content) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Navbar */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-semibold text-gray-800">Welcome back, Saleh 👋</h2>
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl ring-2 ring-offset-2 ring-blue-400">
               S
             </div>
             <span className="text-gray-700 font-medium hidden sm:block">Saleh</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 md:p-8">
          
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg transition-transform hover:scale-105">
              <div className="text-4xl font-bold">120</div>
              <div className="text-lg opacity-90">📧 Total Emails</div>
            </div>
            <div className="card bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-xl shadow-lg transition-transform hover:scale-105">
              <div className="text-4xl font-bold">3</div>
              <div className="text-lg opacity-90">📈 Active Campaigns</div>
            </div>
            <div className="card bg-gradient-to-r from-indigo-500 to-indigo-700 text-white p-6 rounded-xl shadow-lg transition-transform hover:scale-105">
              <div className="text-4xl font-bold">Yes</div>
              <div className="text-lg opacity-90">✅ Verified</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Pie Chart (Daha küçük) */}
            <div className="chart lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Email Categories</h3>
              <div className="relative h-64 md:h-80 lg:h-96">
                <Pie data={emailData} options={pieChartOptions} />
              </div>
            </div>
            {/* Bar Chart (Daha büyük) */}
            <div className="chart lg:col-span-3 bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Campaign Performance</h3>
              <div className="relative h-64 md:h-80 lg:h-96">
                <Bar data={campaignData} options={barChartOptions} />
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};


// --- ANA APP BİLEŞENİ (YÖNETİCİ) ---
// Hangi sayfanın gösterileceğine karar verir.
export default function App() {
  
  // 'isLoggedIn' state'i, kullanıcının giriş yapıp yapmadığını tutar.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // AuthPage tarafından çağrılacak fonksiyon
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // HomePage tarafından çağrılacak fonksiyon
  const handleLogout = () => {
    // Çıkış yaparken token'ları temizle
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
  };

  // Sayfa ilk yüklendiğinde token'ı kontrol et
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Burada token'ın geçerliliğini API'ye sormak daha güvenli olur,
      // ama şimdilik token varsa giriş yapmış sayıyoruz.
      setIsLoggedIn(true);
    }
  }, []); // [] boş dependency array, bu etkinin sadece ilk render'da çalışmasını sağlar

  return (
    // 'isLoggedIn' durumuna göre doğru bileşeni render et
    <>
      {isLoggedIn ? (
        // Eğer giriş yapıldıysa: Ana Sayfayı göster
        <HomePage onLogout={handleLogout} />
      ) : (
        // Eğer giriş yapılmadıysa: Giriş Sayfasını göster
        <AuthPage onLoginSuccess={handleLogin} />
      )}
    </>
    // NOT: AuthPage'iniz zaten kendi 'min-h-screen' arka planını sağladığı için
    // App bileşenini ekstra bir div ile sarmalamaya gerek kalmadı.
  );
}





