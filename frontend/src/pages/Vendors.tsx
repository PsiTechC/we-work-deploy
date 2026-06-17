import React from 'react'
import { fetchVendors, deleteVendor } from '../api'
import { Plus, Trash2, Truck, Hash, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import CreateVendor from './CreateVendor'

export default function Vendors() {
  const [vendors, setVendors] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showCreate, setShowCreate] = React.useState(false)

  function load() {
    setLoading(true)
    fetchVendors().then(d => { setVendors(d); setLoading(false) }).catch(() => setLoading(false))
  }
  React.useEffect(load, [])

  async function remove(id: number) {
    if (!confirm('Delete this vendor?')) return
    try { await deleteVendor(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  if (showCreate) return <CreateVendor onDone={() => { setShowCreate(false); load() }} onBack={() => setShowCreate(false)} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendors</h1>
          <p className="text-slate-500 text-sm mt-1">{vendors.length} registered vendor{vendors.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((v: any) => (
            <div key={v.id} className="card hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Truck size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{v.name}</p>
                    <p className="text-xs text-slate-400">Vendor #{v.id}</p>
                  </div>
                </div>
                <button onClick={() => remove(v.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-4 space-y-1.5">
                {v.agencyCode && <p className="text-sm text-slate-500 flex items-center gap-2"><Hash size={13} />Agency: {v.agencyCode}</p>}
                {v.phone && <p className="text-sm text-slate-500 flex items-center gap-2"><Phone size={13} />{v.phone}</p>}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-400">
                Added {new Date(v.createdAt).toLocaleDateString('en-IN')}
              </div>
            </div>
          ))}
          {!vendors.length && (
            <div className="col-span-3 card text-center py-16 text-slate-400">
              No vendors yet. Add your first vendor!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
