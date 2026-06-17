import React from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native'
import { fetchWallets, fetchExpenses } from '../utils/api'
import { Colors } from '../utils/theme'
import { Feather } from '@expo/vector-icons'

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`
const fmtShort = (n: number) => n >= 1_00_000 ? `₹${(n/1_00_000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`

function StatCard({ label, value, sub, icon, color1, color2 }: any) {
  return (
    <View style={[s.statCard, { backgroundColor: color1 }]}>
      <View style={[s.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <Feather name={icon} size={18} color="#fff" />
      </View>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
      {sub && <Text style={s.statSub}>{sub}</Text>}
    </View>
  )
}

function SiteRow({ site, index }: { site: any; index: number }) {
  const w = site.wallet || {}
  const pct = w.totalFundsReceived > 0 ? Math.min(100, ((w.totalCompanySpent || 0) / w.totalFundsReceived) * 100) : 0
  const pending = (w.totalPersonalSpent || 0) - (w.totalPersonalReimbursed || 0)
  const colors = [Colors.primary, Colors.success, Colors.warning, Colors.purple]
  const c = colors[index % colors.length]
  return (
    <View style={s.siteRow}>
      <View style={[s.siteIcon, { backgroundColor: c + '22' }]}>
        <Feather name="map-pin" size={14} color={c} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={s.siteName}>{site.name}</Text>
          <Text style={[s.siteBalance, { color: c }]}>{fmt(w.companyBalance || 0)}</Text>
        </View>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: c }]} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
          <Text style={s.siteMeta}>Spent: {fmtShort(w.totalCompanySpent || 0)}</Text>
          {pending > 0 && <Text style={[s.siteMeta, { color: Colors.warning }]}>Owed: {fmtShort(pending)}</Text>}
        </View>
      </View>
    </View>
  )
}

export default function DashboardScreen({ user }: { user: any }) {
  const [wallets, setWallets] = React.useState<any[]>([])
  const [expenses, setExpenses] = React.useState<any[]>([])
  const [refreshing, setRefreshing] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  async function load() {
    try {
      const [w, e] = await Promise.all([fetchWallets(), fetchExpenses()])
      setWallets(w); setExpenses(e)
    } finally { setLoading(false); setRefreshing(false) }
  }
  React.useEffect(() => { load() }, [])

  const totalBalance   = wallets.reduce((s, w) => s + (w.wallet?.companyBalance || 0), 0)
  const totalSpent     = wallets.reduce((s, w) => s + (w.wallet?.totalCompanySpent || 0), 0)
  const totalPersonal  = wallets.reduce((s, w) => s + ((w.wallet?.totalPersonalSpent || 0) - (w.wallet?.totalPersonalReimbursed || 0)), 0)
  const recent = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={Colors.accent} />}
    >
      {/* Hero */}
      <View style={s.hero}>
        <View>
          <Text style={s.heroGreeting}>{greeting},</Text>
          <Text style={s.heroName}>{user?.name || 'User'} 👋</Text>
          <Text style={s.heroDate}>{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <View style={s.heroRole}>
          <Text style={s.heroRoleText}>{user?.role}</Text>
        </View>
      </View>

      {/* Stat cards */}
      <View style={s.statsGrid}>
        <StatCard label="Company Balance" value={fmtShort(totalBalance)} sub="Available" icon="credit-card" color1={Colors.primary} />
        <StatCard label="Total Spent"     value={fmtShort(totalSpent)}   sub="All sites" icon="trending-down" color1="#d97706" />
        <StatCard label="Mgr. Pending"    value={fmtShort(totalPersonal)} sub="Reimbursement" icon="user" color1={totalPersonal > 0 ? Colors.danger : Colors.success} />
        <StatCard label="Active Sites"    value={String(wallets.length)} sub="Locations" icon="map" color1={Colors.purple} />
      </View>

      {/* Site breakdown */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Site Wallets</Text>
        {wallets.map((site, i) => <SiteRow key={site.id} site={site} index={i} />)}
        {!wallets.length && !loading && <Text style={s.emptyText}>No sites found</Text>}
      </View>

      {/* Recent expenses */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Recent Expenses</Text>
        {recent.map((e, i) => (
          <View key={e.id} style={[s.expRow, i === recent.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={[s.expCatDot, { backgroundColor: e.fundType === 'PERSONAL' ? Colors.rose : e.fundType === 'SPLIT' ? Colors.warning : Colors.accent }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.expCat}>{e.category} — {e.site?.name}</Text>
              <Text style={s.expDate}>{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
            </View>
            <Text style={s.expAmt}>{fmt(e.amount)}</Text>
          </View>
        ))}
        {!recent.length && !loading && <Text style={s.emptyText}>No expenses yet</Text>}
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: Colors.bg },
  hero:         { backgroundColor: Colors.card, borderRadius: 20, padding: 20, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderWidth: 1, borderColor: Colors.border },
  heroGreeting: { color: Colors.text2, fontSize: 13 },
  heroName:     { color: Colors.text1, fontSize: 22, fontWeight: '900', marginTop: 2 },
  heroDate:     { color: Colors.muted, fontSize: 11, marginTop: 4 },
  heroRole:     { backgroundColor: Colors.primary + '22', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  heroRoleText: { color: Colors.accent, fontSize: 11, fontWeight: '700' },
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard:     { width: '47%', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: {width:0,height:4}, shadowOpacity:0.3, shadowRadius:8, elevation:6 },
  statIcon:     { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statLabel:    { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  statValue:    { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 2 },
  statSub:      { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 },
  section:      { backgroundColor: Colors.card, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { color: Colors.text1, fontWeight: '800', fontSize: 15, marginBottom: 12 },
  siteRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  siteIcon:     { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  siteName:     { color: Colors.text1, fontWeight: '700', fontSize: 13 },
  siteBalance:  { fontWeight: '900', fontSize: 13 },
  progressBg:   { height: 4, backgroundColor: Colors.border, borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2 },
  siteMeta:     { color: Colors.muted, fontSize: 10 },
  expRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  expCatDot:    { width: 8, height: 8, borderRadius: 4 },
  expCat:       { color: Colors.text1, fontSize: 13, fontWeight: '600' },
  expDate:      { color: Colors.muted, fontSize: 11, marginTop: 1 },
  expAmt:       { color: Colors.text1, fontWeight: '900', fontSize: 14 },
  emptyText:    { color: Colors.muted, textAlign: 'center', paddingVertical: 16, fontSize: 13 },
})
