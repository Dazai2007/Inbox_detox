import React from "react";
import { useNavigate } from "react-router-dom";
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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function HomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

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
    <div className="flex h-screen w-full bg-gray-100 font-poppins">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col flex-shrink-0">
        <div className="p-6 text-2xl font-bold text-blue-600 border-b">Nexivo</div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center p-3 rounded-lg bg-blue-100 text-blue-700 font-semibold">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            Dashboard
          </a>
          <a href="#" className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Emails
          </a>
          <a href="#" className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Analytics
          </a>
          <a href="#" className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </a>
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 mt-auto border-t">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full p-3 rounded-lg text-red-600 hover:bg-red-100 font-semibold transition-colors"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
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
                <Pie 
                  data={emailData} 
                  options={{ 
                    maintainAspectRatio: false, 
                    plugins: { 
                      legend: { 
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          padding: 20
                        }
                      } 
                    } 
                  }} 
                />
              </div>
            </div>
            <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Campaign Performance</h3>
              <div className="h-64 md:h-80 flex justify-center items-center">
                <Bar 
                  data={campaignData} 
                  options={{ 
                    maintainAspectRatio: false, 
                    plugins: { 
                      legend: { 
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          padding: 20
                        }
                      } 
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* CSS Stilleri */}
      <style>{`
        .font-poppins { 
          font-family: 'Poppins', sans-serif; 
        }
      `}</style>
    </div>
  );
}