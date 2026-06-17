import React from 'react'
import { HardHat, LogIn, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api'
import { saveToken, saveUser } from '../auth'
import AnimatedBackground from '../components/AnimatedBackground'

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [email,    setEmail]    = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading,  setLoading]  = React.useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await api.post('/auth/login', { email, password })
      saveToken(r.data.token)
      saveUser(r.data.user)
      toast.success(`Welcome, ${r.data.user.name || r.data.user.email}!`)
      onLogin(r.data.user)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Animated canvas background */}
      <AnimatedBackground />

      {/* Content layer */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-2xl shadow-blue-500/40"
            style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)' }}>
            <HardHat size={30} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">We Work</h1>
          <p className="text-sky-300/80 text-sm mt-1 font-medium tracking-widest uppercase">Constructions Management</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400/80 text-xs font-semibold">System Online</span>
          </div>
        </div>

        {/* Glass card */}
        <div className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}>
          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-7">Sign in to access your dashboard</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-sky-300/80 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 transition"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-sky-300/80 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 transition"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 mt-2"
              style={{ background: loading ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg, #2563eb, #0ea5e9)', boxShadow: loading ? 'none' : '0 8px 24px rgba(37,99,235,0.45)' }}>
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <LogIn size={16} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-6 text-slate-600 text-xs">
          <Zap size={11} className="text-sky-500/60" />
          <span>Powered by We Work Construction Platform</span>
        </div>
      </div>
    </div>
  )
}
