import React from 'react'
import { Link } from 'react-router-dom'

const TermsOfService = () => {
  const lastUpdated = new Date().toLocaleDateString()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-700/50 bg-slate-800/30 p-8 backdrop-blur-lg">
        <div className="mb-8 flex justify-center">
          <Link to="/register" className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
              <span className="text-lg font-bold text-white">N</span>
            </div>
            <span className="text-2xl font-bold text-white">Nexivo</span>
          </Link>
        </div>

        <h1 className="mb-6 text-3xl font-bold text-white">Terms of Service</h1>

        <div className="space-y-4 text-slate-300">
          <p>Last updated: {lastUpdated}</p>

          <h2 className="mt-6 text-xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Nexivo, you accept and agree to be bound by the terms and provision of
            this agreement.
          </p>

          <h2 className="mt-6 text-xl font-semibold text-white">2. Use License</h2>
          <p>
            Permission is granted to temporarily use Nexivo for personal, non-commercial transitory viewing only.
          </p>

          <div className="mt-8">
            <Link to="/register" className="text-blue-400 transition-colors hover:text-blue-300">
              ← Back to Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService
