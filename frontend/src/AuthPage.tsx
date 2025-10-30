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



 // ====================================================================

 // DÜZELTME 1: API URL'i yerel sunucuya (main.py) yönlendirildi.

 // ====================================================================

 const API_BASE_URL = "http://127.0.0.1:8000"; // "https://api.nexivo.it.com" yerine



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



  // Login (Giriş) isteği `username` ve `password` bekler (form-data olarak)

  // Bu, FastAPI'nin OAuth2PasswordRequestForm'u için standarttır.

  const formData = new FormData();

  formData.append('username', loginEmail); // Backend 'username' bekler, 'email' değil.

  formData.append('password', loginPassword);



  try {

   const response = await axios.post(`${API_BASE_URL}/api/auth/login`, formData, {

     headers: {

      'Content-Type': 'multipart/form-data'

     }

   });



   console.log('Giriş başarılı:', response.data);

   localStorage.setItem('accessToken', response.data.access_token);

   localStorage.setItem('refreshToken', response.data.refresh_token);



   alert('Giriş Başarılı!');

   // navigate('/dashboard'); // Başarılı giriş sonrası yönlendirme



  } catch (err) {

   console.error('Giriş hatası:', err);

   let errorMessage = 'Bağlantı hatası veya bilinmeyen bir hata oluştu.';

   if (axios.isAxiosError(err) && err.response) {

    if (err.response.status === 404) {

     errorMessage = 'API adresi bulunamadı. Lütfen adresi kontrol edin.';

    } else if (err.response.data && err.response.data.detail) {

      // FastAPI'den gelen JSON hatasını göster

      if (Array.isArray(err.response.data.detail)) {

       errorMessage = err.response.data.detail[0].msg;

      } else {

       errorMessage = err.response.data.detail;

      }

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

  setLoading(true);

  setError(null);



  // ====================================================================

  // DÜZELTME 2: 'full_name', 'first_name' ve 'last_name' olarak bölündü.

  // ====================================================================



  // 'registerName' state'ini (örn: "Dazai Osamu") alıp boşluğa göre bölelim

  const nameParts = registerName.trim().split(' ');

  const firstName = nameParts[0] || ''; // İlk kelime (örn: "Dazai")

  const lastName = nameParts.slice(1).join(' ') || ''; // Geri kalanlar (örn: "Osamu")



  // DÜZELTME 3: Backend 'last_name' alanını zorunlu tutuyor.

  // Eğer 'lastName' boşsa (kullanıcı sadece "Dazai" girdiyse) 422 hatası alırız.

  // İsteği göndermeden önce bunu kontrol edelim.

  if (!lastName) {

   setError("Please enter both your first and last name in the 'Full Name' field.");

   setLoading(false);

   return; // Fonksiyonu durdur

  }

  

  // Veri artık JSON olarak gönderiliyor, backend'in beklediği gibi.

  const payload = {

   email: registerEmail,

   password: registerPassword,

   first_name: firstName,

   last_name: lastName,

   // timezone: "Europe/Istanbul" // Gerekirse ekle

  };



  try {

   // İstek artık doğru formatta ('first_name' ve 'last_name' ile) gönderiliyor.

   const response = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);



   console.log('Kayıt başarılı:', response.data);

   alert('Kayıt Başarılı! Lütfen giriş yapın.');

   setTab('login');

   setError(null);



  } catch (err) {

   console.error('Kayıt hatası:', err);

   let errorMessage = 'Bağlantı hatası veya bilinmeyen bir hata oluştu.';

   if (axios.isAxiosError(err) && err.response) {

    if (err.response.status === 404) {

     errorMessage = 'API adresi bulunamadı. Lütfen adresi kontrol edin.';

    } else if (err.response.data && err.response.data.detail) {

      // FastAPI'den gelen JSON hatasını göster (422 veya diğerleri)

      // Hata bir liste ise (Pydantic Validation Error)

      if (Array.isArray(err.response.data.detail)) {

       // Sadece ilk hatanın mesajını göster

       errorMessage = err.response.data.detail[0].msg;

      } else {

       // Normal bir hata mesajı ise (örn: "Email already registered")

       errorMessage = err.response.data.detail;

      }

    } else {

      errorMessage = `Kayıt sırasında bir hata oluştu (${err.response.status})`;

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

       <div><label htmlFor="register-fullname" className="form-label">Full Name (e.g., Dazai Osamu)</label><input id="register-fullname" type="text" placeholder="Your Name" required className="form-input text-gray-900" value={registerName} onChange={(e) => setRegisterName(e.target.value)} disabled={loading} /></div>

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



export default AuthPage;





