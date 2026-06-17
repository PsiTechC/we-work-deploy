import React from 'react'
import { fetchUsers, createUser, updateUser, deleteUser } from '../api'
import { Plus, Pencil, Trash2, X, ShieldCheck, User } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = ['ADMIN', 'MANAGER']
const ROLE_BADGE: Record<string, string> = {
  ADMIN:   'bg-rose-100 text-rose-700 border-rose-200',
  MANAGER: 'bg-purple-100 text-purple-700 border-purple-200',
}
const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'bg-rose-500', MANAGER: 'bg-purple-500',
}

function Modal({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function UserForm({ initial, onSave, onClose }: { initial?: any; onSave: (d: any) => Promise<void>; onClose: () => void }) {
  const [name,     setName]     = React.useState(initial?.name || '')
  const [email,    setEmail]    = React.useState(initial?.email || '')
  const [phone,    setPhone]    = React.useState(initial?.phone || '')
  const [role,     setRole]     = React.useState(initial?.role || 'EMPLOYEE')
  const [password, setPassword] = React.useState('')
  const [isActive, setIsActive] = React.useState(initial?.isActive ?? true)
  const [loading,  setLoading]  = React.useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({ name, email, phone, role, isActive, ...(password ? { password } : {}) })
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Full Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
        </div>
      </div>
      <div>
        <label className="label">Email *</label>
        <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@wework.com" required disabled={!!initial} />
      </div>
      <div>
        <label className="label">{initial ? 'New Password (leave blank to keep)' : 'Password *'}</label>
        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required={!initial} />
      </div>
      <div>
        <label className="label">Role</label>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map(r => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${role === r ? `${ROLE_BADGE[r]} border-current` : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>
      {initial && (
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsActive(v => !v)}
            className={`w-10 h-6 rounded-full transition-colors relative ${isActive ? 'bg-blue-600' : 'bg-slate-300'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${isActive ? 'left-5' : 'left-1'}`} />
          </button>
          <span className="text-sm text-slate-600">{isActive ? 'Active' : 'Inactive'}</span>
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {loading ? 'Saving…' : (initial ? 'Update User' : 'Create User')}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
      </div>
    </form>
  )
}

export default function UserManagement() {
  const [users,  setUsers]  = React.useState<any[]>([])
  const [loading,setLoading]= React.useState(true)
  const [modal,  setModal]  = React.useState<'create' | 'edit' | null>(null)
  const [editing,setEditing]= React.useState<any>(null)

  function load() { setLoading(true); fetchUsers().then(d => { setUsers(d); setLoading(false) }).catch(() => setLoading(false)) }
  React.useEffect(load, [])

  async function handleCreate(data: any) {
    try { await createUser(data); toast.success('User created!'); setModal(null); load() }
    catch (e: any) { toast.error(e?.response?.data?.error || 'Failed') }
  }
  async function handleUpdate(data: any) {
    try { await updateUser(editing.id, data); toast.success('User updated!'); setModal(null); load() }
    catch (e: any) { toast.error(e?.response?.data?.error || 'Failed') }
  }
  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete ${name}?`)) return
    try { await deleteUser(id); toast.success('User deleted'); load() }
    catch (e: any) { toast.error(e?.response?.data?.error || 'Failed') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} user{users.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={() => { setModal('create'); setEditing(null) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Role legend */}
      <div className="flex gap-3 flex-wrap">
        {ROLES.map(r => (
          <span key={r} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${ROLE_BADGE[r]}`}>
            <ShieldCheck size={11} />{r}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((u: any) => (
            <div key={u.id} className="card hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 ${ROLE_COLOR[u.role] || 'bg-slate-400'}`}>
                    {(u.name || u.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{u.name || '—'}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => { setEditing(u); setModal('edit') }}
                    className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(u.id, u.name || u.email)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ROLE_BADGE[u.role] || ''}`}>
                  {u.role}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {u.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {u.phone && <p className="text-xs text-slate-400 mt-2">{u.phone}</p>}
              <p className="text-xs text-slate-300 mt-2">
                Joined {new Date(u.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          ))}
          {!users.length && (
            <div className="col-span-3 card text-center py-16 text-slate-400">No users yet</div>
          )}
        </div>
      )}

      {modal === 'create' && (
        <Modal title="Add New User" onClose={() => setModal(null)}>
          <UserForm onSave={handleCreate} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'edit' && editing && (
        <Modal title={`Edit — ${editing.name || editing.email}`} onClose={() => setModal(null)}>
          <UserForm initial={editing} onSave={handleUpdate} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  )
}
