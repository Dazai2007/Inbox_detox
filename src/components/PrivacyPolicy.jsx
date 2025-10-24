import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
        <div className="flex justify-center mb-8">
          <Link to="/register" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-2xl font-bold text-white">Nexivo</span>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        
        <div className="text-slate-300 space-y-4">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold text-white mt-6">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as your name, email address, and any other information you choose to provide.</p>
          
          <h2 className="text-xl font-semibold text-white mt-6">2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, and to communicate with you.</p>
          
          <div className="mt-8">
            <Link 
              to="/register" 
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
