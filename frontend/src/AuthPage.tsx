
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";

const AuthPage: React.FC = () => {
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  return (
    <div className="flex h-screen w-screen bg-gradient-to-r from-indigo-700 via-purple-800 to-black animate-gradient-x">
      <div className="relative w-full max-w-5xl h-[600px] flex rounded-2xl overflow-hidden shadow-2xl m-auto">
        {/* Sol Panel */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-900/70 to-purple-900/70 backdrop-blur-xl text-white flex-col justify-center p-12">
          <h1 className="text-5xl font-extrabold mb-6 drop-shadow-lg">Hello Nexivo 👋</h1>
          <p className="text-lg text-gray-200 mb-6">
            Join the email productivity revolution. Manage your inbox smarter, faster, and with less stress.
          </p>
          <ul className="space-y-2 text-gray-300">
            <li>• AI-powered email sorting</li>
            <li>• Smart templates & automation</li>
            <li>• Focused inbox experience</li>
            <li>• Cross-platform sync</li>
          </ul>
        </div>
        {/* Sağ Panel */}
        <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-900/40 backdrop-blur-xl">
          <div className="w-full max-w-md p-8 text-white">
            {/* Tabs */}
            <div className="flex border-b border-gray-600 mb-6">
              <button
                onClick={() => setTab("signin")}
                className={`flex-1 py-2 text-center font-medium ${
                  tab === "signin" ? "border-b-2 border-indigo-400 text-indigo-400" : "text-gray-400"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab("signup")}
                className={`flex-1 py-2 text-center font-medium ${
                  tab === "signup" ? "border-b-2 border-indigo-400 text-indigo-400" : "text-gray-400"
                }`}
              >
                Create Account
              </button>
            </div>
            {/* Forms */}
            {tab === "signin" ? (
              <div>
                <h2 className="text-3xl font-semibold mb-2">Welcome Back</h2>
                <p className="text-gray-400 mb-6">Sign in to your account to continue</p>
                <form className="space-y-4">
                  <input type="email" placeholder="Email Address" className="auth-input" />
                  <input type="password" placeholder="Password" className="auth-input" />
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" /> Remember me
                    </label>
                    <a href="#" className="text-indigo-400 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <button className="auth-btn bg-indigo-600 hover:bg-indigo-700">Sign In</button>
                </form>
                <div className="divider">OR</div>
                <button className="auth-btn bg-white text-gray-800 flex items-center justify-center gap-2">
                  <FcGoogle size={20} /> Sign in with Google
                </button>
                <p className="mt-6 text-sm text-gray-400">
                  Don’t have an account?{" "}
                  <button onClick={() => setTab("signup")} className="text-indigo-400 hover:underline">
                    Create one
                  </button>
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-semibold mb-2">Create Account</h2>
                <p className="text-gray-400 mb-6">Join Nexivo and boost your productivity</p>
                <form className="space-y-4">
                  <input type="text" placeholder="First Name" className="auth-input" />
                  <input type="text" placeholder="Last Name" className="auth-input" />
                  <input type="email" placeholder="Email Address" className="auth-input" />
                  <input type="password" placeholder="Password" className="auth-input" />
                  <button className="auth-btn bg-indigo-600 hover:bg-indigo-700">Create Account</button>
                </form>
                <div className="divider">OR</div>
                <button className="auth-btn bg-white text-gray-800 flex items-center justify-center gap-2">
                  <FcGoogle size={20} /> Sign up with Google
                </button>
                <p className="mt-6 text-sm text-gray-400">
                  Already have an account?{" "}
                  <button onClick={() => setTab("signin")} className="text-indigo-400 hover:underline">
                    Sign In
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );



