import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-r from-indigo-700 via-purple-800 to-black animate-gradient-x">
      <div className="relative w-full max-w-5xl h-[600px] flex rounded-2xl overflow-hidden shadow-2xl">
        {/* Sol Panel */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-900/70 to-purple-900/70 backdrop-blur-xl text-white flex-col justify-center items-center p-12">
          <h1 className="text-5xl font-extrabold mb-6 drop-shadow-lg">Hello Nexivo 👋</h1>
          <p className="text-lg text-gray-200 text-center">
            Join the email productivity revolution
          </p>
        </div>
        {/* Sağ Panel */}
        <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-900/40 backdrop-blur-xl">
          <div className="w-full max-w-md p-8">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="text-white"
                >
                  <h2 className="text-3xl font-semibold mb-6">Sign In</h2>
                  <form className="space-y-4">
                    <input
                      type="email"
                      placeholder="E-mail"
                      className="auth-input"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="auth-input"
                    />
                    <button
                      type="submit"
                      className="auth-btn bg-indigo-600 hover:bg-indigo-700"
                    >
                      Sign In
                    </button>
                  </form>
                  {/* Google Login */}
                  <div className="mt-6">
                    <button className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-white text-gray-800 font-medium hover:bg-gray-100 transition">
                      <FcGoogle size={22} /> Sign in with Google
                    </button>
                  </div>
                  <p className="mt-6 text-sm text-gray-300">
                    Don’t have an account?{" "}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="text-indigo-400 hover:underline"
                    >
                      Create one
                    </button>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5 }}
                  className="text-white"
                >
                  <h2 className="text-3xl font-semibold mb-6">Create Account</h2>
                  <form className="space-y-4">
                    <input type="text" placeholder="First Name" className="auth-input" />
                    <input type="text" placeholder="Last Name" className="auth-input" />
                    <input type="email" placeholder="E-mail" className="auth-input" />
                    <input type="password" placeholder="Password" className="auth-input" />
                    <button
                      type="submit"
                      className="auth-btn bg-indigo-600 hover:bg-indigo-700"
                    >
                      Create Account
                    </button>
                  </form>
                  {/* Google Register */}
                  <div className="mt-6">
                    <button className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-white text-gray-800 font-medium hover:bg-gray-100 transition">
                      <FcGoogle size={22} /> Sign up with Google
                    </button>
                  </div>
                  <p className="mt-6 text-sm text-gray-300">
                    Already have an account?{" "}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-indigo-400 hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
