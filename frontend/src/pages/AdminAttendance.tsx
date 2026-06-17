import React from 'react'
import { fetchAllAttendance } from '../api'
import { MapPin, Clock, Users, CheckCircle, XCircle, Filter } from 'lucide-react'

function fmt12(d: string) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const ROLE_BADGE: Record<string, string> = {
  ADMIN:    'bg-rose-100 text-rose-700',
  MANAGER:  'bg-purple-100 text-purple-700',
  EMPLOYEE: 'bg-blue-100 text-blue-700',
  CUSTOMER: 'bg-emerald-100 text-emerald-700',
}

export default function AdminAttendance() {
  const todayStr = new Date().toISOString().slice(0, 10)
  const [date, setDate]       = React.useState(todayStr)
  const [records, setRecords] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  function load(d: string) {
    setLoading(true)
    fetchAllAttendance(d)
      .then(r => { setRecords(r); setLoading(false) })
      .catch(() => setLoading(false))
  }
  React.useEffect(() => { load(date) }, [date])

  const present  = records.filter(r => r.checkIn).length
  const complete = records.filter(r => r.checkIn && r.checkOut).length
  const absent   = records.filter(r => !r.checkIn).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Track team check-in / check-out & locations</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
          <Filter size={15} className="text-slate-400" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="text-sm text-slate-700 focus:outline-none" />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Users size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{present}</p>
          <p className="text-xs text-slate-500 mt-0.5">Present</p>
        </div>
        <div className="card text-center">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <CheckCircle size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{complete}</p>
          <p className="text-xs text-slate-500 mt-0.5">Completed</p>
        </div>
        <div className="card text-center">
          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <XCircle size={18} className="text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{absent}</p>
          <p className="text-xs text-slate-500 mt-0.5">Absent</p>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Employee', 'Role', 'Check In', 'Check Out', 'Hours', 'Check-in Location', 'Check-out Location'].map(h => (
                    <th key={h} className="table-head">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r: any) => (
                  <tr key={r.id} className={`hover:bg-slate-50/50 transition-colors ${!r.checkIn ? 'opacity-50' : ''}`}>
                    <td className="table-cell">
                      <div>
                        <p className="font-semibold text-slate-800">{r.user?.name || '—'}</p>
                        <p className="text-xs text-slate-400">{r.user?.email}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_BADGE[r.user?.role] || 'bg-slate-100 text-slate-600'}`}>
                        {r.user?.role}
                      </span>
                    </td>
                    <td className="table-cell">
                      {r.checkIn
                        ? <span className="text-blue-600 font-medium flex items-center gap-1"><Clock size={12} />{fmt12(r.checkIn)}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="table-cell">
                      {r.checkOut
                        ? <span className="text-emerald-600 font-medium flex items-center gap-1"><CheckCircle size={12} />{fmt12(r.checkOut)}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="table-cell">
                      {r.hoursWorked ? <span className="font-bold text-slate-700">{r.hoursWorked}h</span> : '—'}
                    </td>
                    <td className="table-cell text-xs">
                      {r.checkInLat
                        ? <a href={`https://maps.google.com/?q=${r.checkInLat},${r.checkInLng}`} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-blue-500 hover:text-blue-700">
                            <MapPin size={11} />{r.checkInLat.toFixed(4)}, {r.checkInLng?.toFixed(4)}
                          </a>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="table-cell text-xs">
                      {r.checkOutLat
                        ? <a href={`https://maps.google.com/?q=${r.checkOutLat},${r.checkOutLng}`} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-emerald-500 hover:text-emerald-700">
                            <MapPin size={11} />{r.checkOutLat.toFixed(4)}, {r.checkOutLng?.toFixed(4)}
                          </a>
                        : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
                {!records.length && (
                  <tr><td colSpan={7} className="table-cell text-center text-slate-400 py-14">
                    No attendance records for {date}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
