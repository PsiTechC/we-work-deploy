import React from 'react'
import { checkIn, checkOut, fetchMyAttendance, fetchTodayAttendance } from '../api'
import { CalendarCheck, Clock, MapPin, CheckCircle, LogIn, LogOut, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function getLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return }
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => reject(new Error('Location permission denied'))
    )
  })
}

function fmt12(d: string) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Attendance() {
  const [today, setToday]     = React.useState<any>(null)
  const [history, setHistory] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [busy, setBusy]       = React.useState(false)
  const [locMsg, setLocMsg]   = React.useState('')

  async function load() {
    const [t, h] = await Promise.all([fetchTodayAttendance(), fetchMyAttendance()])
    setToday(t); setHistory(h); setLoading(false)
  }
  React.useEffect(() => { load() }, [])

  async function handleCheckIn() {
    setBusy(true); setLocMsg('Fetching your location…')
    try {
      const loc = await getLocation()
      setLocMsg('')
      await checkIn({ lat: loc.lat, lng: loc.lng })
      toast.success('Checked in successfully!')
      load()
    } catch (e: any) {
      setLocMsg('')
      toast.error(e?.response?.data?.error || e?.message || 'Check-in failed')
    } finally { setBusy(false) }
  }

  async function handleCheckOut() {
    setBusy(true); setLocMsg('Fetching your location…')
    try {
      const loc = await getLocation()
      setLocMsg('')
      await checkOut({ lat: loc.lat, lng: loc.lng })
      toast.success('Checked out successfully!')
      load()
    } catch (e: any) {
      setLocMsg('')
      toast.error(e?.response?.data?.error || e?.message || 'Check-out failed')
    } finally { setBusy(false) }
  }

  const checkedIn  = !!today?.checkIn
  const checkedOut = !!today?.checkOut

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Attendance</h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Today card */}
      <div className={`rounded-2xl p-6 border-2 transition-colors ${
        checkedOut ? 'bg-emerald-50 border-emerald-200' :
        checkedIn  ? 'bg-blue-50 border-blue-200' :
                     'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4 mb-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            checkedOut ? 'bg-emerald-500' : checkedIn ? 'bg-blue-500' : 'bg-slate-200'}`}>
            <CalendarCheck size={28} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">
              {checkedOut ? 'Completed' : checkedIn ? 'Currently Working' : 'Not Checked In'}
            </p>
            <p className="text-sm text-slate-500">Today's status</p>
          </div>
        </div>

        {/* Times */}
        {checkedIn && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white rounded-xl p-3 border border-blue-100">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <LogIn size={14} /><span className="text-xs font-semibold uppercase tracking-wide">Check In</span>
              </div>
              <p className="font-bold text-slate-800">{fmt12(today.checkIn)}</p>
              {today.checkInLat && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin size={10} />{today.checkInLat.toFixed(5)}, {today.checkInLng?.toFixed(5)}
                </p>
              )}
            </div>
            {checkedOut ? (
              <div className="bg-white rounded-xl p-3 border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <LogOut size={14} /><span className="text-xs font-semibold uppercase tracking-wide">Check Out</span>
                </div>
                <p className="font-bold text-slate-800">{fmt12(today.checkOut)}</p>
                <p className="text-xs text-emerald-600 mt-1 font-medium">{today.hoursWorked}h worked</p>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-3 border border-dashed border-slate-200 flex items-center justify-center">
                <p className="text-slate-400 text-sm">Not checked out</p>
              </div>
            )}
          </div>
        )}

        {locMsg && (
          <div className="flex items-center gap-2 text-blue-600 text-sm mb-4">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            {locMsg}
          </div>
        )}

        {/* Action buttons */}
        {!checkedIn && (
          <button onClick={handleCheckIn} disabled={busy}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700">
            {busy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn size={18} />}
            Check In with Location
          </button>
        )}
        {checkedIn && !checkedOut && (
          <button onClick={handleCheckOut} disabled={busy}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700">
            {busy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogOut size={18} />}
            Check Out with Location
          </button>
        )}
        {checkedOut && (
          <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold py-2">
            <CheckCircle size={18} /> Day complete — {today.hoursWorked} hours worked
          </div>
        )}
      </div>

      {/* Location info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          Location is captured automatically on check-in and check-out. Please allow location access when prompted.
        </p>
      </div>

      {/* History */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">Attendance History</h2>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  {['Date', 'Check In', 'Check Out', 'Hours', 'Location'].map(h => <th key={h} className="table-head">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {history.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell font-medium">{fmtDate(r.date + 'T00:00:00')}</td>
                    <td className="table-cell text-blue-600">{r.checkIn ? fmt12(r.checkIn) : '—'}</td>
                    <td className="table-cell text-emerald-600">{r.checkOut ? fmt12(r.checkOut) : '—'}</td>
                    <td className="table-cell">{r.hoursWorked ? <span className="font-semibold">{r.hoursWorked}h</span> : '—'}</td>
                    <td className="table-cell text-xs text-slate-400">
                      {r.checkInLat ? <span className="flex items-center gap-1"><MapPin size={11} />{r.checkInLat.toFixed(3)}, {r.checkInLng?.toFixed(3)}</span> : '—'}
                    </td>
                  </tr>
                ))}
                {!history.length && <tr><td colSpan={5} className="table-cell text-center text-slate-400 py-10">No attendance records yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
