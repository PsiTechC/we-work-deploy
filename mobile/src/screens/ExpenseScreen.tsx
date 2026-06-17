import React from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator, RefreshControl } from 'react-native'
import { fetchWallets, addExpense, fetchSites, addFund } from '../utils/api'
import { Colors } from '../utils/theme'
import { Feather } from '@expo/vector-icons'

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`
const CATEGORIES = ['Materials', 'Labor', 'Travel', 'Equipment', 'Office', 'Food', 'Misc']
const FUND_COLORS: Record<string, string> = { COMPANY: Colors.accent, PERSONAL: Colors.rose, SPLIT: Colors.warning }

export default function ExpenseScreen({ user }: { user: any }) {
  const [wallets, setWallets] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [modal, setModal] = React.useState<'expense' | 'fund' | null>(null)

  // Expense form
  const [siteId, setSiteId]     = React.useState<number>(0)
  const [category, setCategory] = React.useState('Materials')
  const [amount, setAmount]     = React.useState('')
  const [notes, setNotes]       = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  // Fund form
  const [fundSiteId, setFundSiteId] = React.useState<number>(0)
  const [fundAmount, setFundAmount] = React.useState('')
  const [fundNotes, setFundNotes]   = React.useState('')

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  async function load() {
    try { const w = await fetchWallets(); setWallets(w); if (w.length > 0) { setSiteId(w[0].id); setFundSiteId(w[0].id) } }
    finally { setLoading(false); setRefreshing(false) }
  }
  React.useEffect(() => { load() }, [])

  async function submitExpense() {
    if (!amount || Number(amount) <= 0) { Alert.alert('Error', 'Enter a valid amount'); return }
    setSubmitting(true)
    try {
      const fd = new FormData() as any
      fd.append('siteId', String(siteId))
      fd.append('category', category)
      fd.append('amount', amount)
      fd.append('notes', notes)
      await addExpense(fd)
      Alert.alert('✅ Expense Added', `${fmt(Number(amount))} recorded`)
      setModal(null); setAmount(''); setNotes(''); load()
    } catch (e: any) { Alert.alert('Error', e?.response?.data?.error || 'Failed') }
    finally { setSubmitting(false) }
  }

  async function submitFund() {
    if (!fundAmount || Number(fundAmount) <= 0) { Alert.alert('Error', 'Enter a valid amount'); return }
    setSubmitting(true)
    try {
      await addFund({ siteId: fundSiteId, amount: Number(fundAmount), notes: fundNotes })
      Alert.alert('✅ Funds Added', `${fmt(Number(fundAmount))} added to site balance`)
      setModal(null); setFundAmount(''); setFundNotes(''); load()
    } catch (e: any) { Alert.alert('Error', e?.response?.data?.error || 'Failed') }
    finally { setSubmitting(false) }
  }

  const totalBalance = wallets.reduce((s, w) => s + (w.wallet?.companyBalance || 0), 0)
  const totalPending = wallets.reduce((s, w) => s + Math.max(0, (w.wallet?.totalPersonalSpent || 0) - (w.wallet?.totalPersonalReimbursed || 0)), 0)

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={Colors.accent} />}
      >
        {/* Summary row */}
        <View style={s.summaryRow}>
          <View style={[s.summaryCard, { backgroundColor: Colors.primary }]}>
            <Text style={s.summaryLabel}>Total Balance</Text>
            <Text style={s.summaryValue}>{fmt(totalBalance)}</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: totalPending > 0 ? '#d97706' : Colors.success }]}>
            <Text style={s.summaryLabel}>{totalPending > 0 ? 'Pending' : 'All Clear'}</Text>
            <Text style={s.summaryValue}>{totalPending > 0 ? fmt(totalPending) : '✓'}</Text>
          </View>
        </View>

        {/* Site cards */}
        {loading && <ActivityIndicator color={Colors.accent} style={{ marginVertical: 30 }} />}
        {wallets.map((site, i) => {
          const w = site.wallet || {}
          const pending = (w.totalPersonalSpent || 0) - (w.totalPersonalReimbursed || 0)
          const pct = w.totalFundsReceived > 0 ? Math.min(100, ((w.totalCompanySpent || 0) / w.totalFundsReceived) * 100) : 0
          const colors = [Colors.primary, Colors.success, Colors.warning, Colors.purple]
          const c = colors[i % colors.length]
          return (
            <View key={site.id} style={s.siteCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={[s.siteIcon, { backgroundColor: c + '22' }]}>
                  <Feather name="home" size={16} color={c} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.siteName}>{site.name}</Text>
                  <Text style={s.siteSub}>{site.expenses?.length || 0} expense entries</Text>
                </View>
                <Text style={[s.siteBalance, { color: c }]}>{fmt(w.companyBalance || 0)}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                <View style={[s.miniStat, { backgroundColor: Colors.accent + '15' }]}>
                  <Text style={[s.miniStatVal, { color: Colors.accent }]}>{fmt(w.totalCompanySpent || 0)}</Text>
                  <Text style={s.miniStatLabel}>Co. Spent</Text>
                </View>
                <View style={[s.miniStat, { backgroundColor: Colors.rose + '15' }]}>
                  <Text style={[s.miniStatVal, { color: Colors.rose }]}>{fmt(w.totalPersonalSpent || 0)}</Text>
                  <Text style={s.miniStatLabel}>Personal</Text>
                </View>
                {pending > 0 && (
                  <View style={[s.miniStat, { backgroundColor: Colors.warning + '15' }]}>
                    <Text style={[s.miniStatVal, { color: Colors.warning }]}>{fmt(pending)}</Text>
                    <Text style={s.miniStatLabel}>Owed</Text>
                  </View>
                )}
              </View>
              <View style={s.progressBg}>
                <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: c }]} />
              </View>
              <Text style={s.progressLabel}>{Math.round(pct)}% of funds used</Text>

              {/* Recent expenses */}
              {(site.expenses || []).slice(0, 3).map((e: any) => (
                <View key={e.id} style={s.expRow}>
                  <View style={[s.expDot, { backgroundColor: FUND_COLORS[e.fundType] || Colors.muted }]} />
                  <Text style={s.expCat}>{e.category}</Text>
                  <Text style={s.expAmt}>{fmt(e.amount)}</Text>
                </View>
              ))}
            </View>
          )
        })}
      </ScrollView>

      {/* FAB buttons */}
      {canManage && (
        <View style={s.fabs}>
          <TouchableOpacity style={[s.fab, { backgroundColor: Colors.success }]} onPress={() => setModal('fund')} activeOpacity={0.85}>
            <Feather name="plus-circle" size={18} color="#fff" />
            <Text style={s.fabText}>Add Funds</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.fab, { backgroundColor: Colors.primary }]} onPress={() => setModal('expense')} activeOpacity={0.85}>
            <Feather name="minus-circle" size={18} color="#fff" />
            <Text style={s.fabText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Expense Modal */}
      <Modal visible={modal === 'expense'} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add Expense</Text>
              <TouchableOpacity onPress={() => setModal(null)}><Feather name="x" size={20} color={Colors.text2} /></TouchableOpacity>
            </View>
            <Text style={s.fieldLabel}>SITE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {wallets.map(w => (
                  <TouchableOpacity key={w.id} onPress={() => setSiteId(w.id)} activeOpacity={0.8}
                    style={[s.pill, siteId === w.id && { backgroundColor: Colors.primary }]}>
                    <Text style={[s.pillText, siteId === w.id && { color: '#fff' }]}>{w.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={s.fieldLabel}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity key={c} onPress={() => setCategory(c)} activeOpacity={0.8}
                    style={[s.pill, category === c && { backgroundColor: Colors.primary }]}>
                    <Text style={[s.pillText, category === c && { color: '#fff' }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={s.fieldLabel}>AMOUNT (₹)</Text>
            <TextInput style={s.modalInput} value={amount} onChangeText={setAmount} placeholder="0.00" placeholderTextColor={Colors.muted} keyboardType="numeric" />
            <Text style={s.fieldLabel}>NOTES (optional)</Text>
            <TextInput style={s.modalInput} value={notes} onChangeText={setNotes} placeholder="Description..." placeholderTextColor={Colors.muted} />
            <TouchableOpacity style={[s.modalBtn, { backgroundColor: Colors.primary }]} onPress={submitExpense} disabled={submitting} activeOpacity={0.85}>
              {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.modalBtnText}>Add Expense</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Fund Modal */}
      <Modal visible={modal === 'fund'} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add Company Funds</Text>
              <TouchableOpacity onPress={() => setModal(null)}><Feather name="x" size={20} color={Colors.text2} /></TouchableOpacity>
            </View>
            <Text style={s.fieldLabel}>SITE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {wallets.map(w => (
                  <TouchableOpacity key={w.id} onPress={() => setFundSiteId(w.id)} activeOpacity={0.8}
                    style={[s.pill, fundSiteId === w.id && { backgroundColor: Colors.success }]}>
                    <Text style={[s.pillText, fundSiteId === w.id && { color: '#fff' }]}>{w.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={s.fieldLabel}>AMOUNT (₹)</Text>
            <TextInput style={s.modalInput} value={fundAmount} onChangeText={setFundAmount} placeholder="e.g. 50000" placeholderTextColor={Colors.muted} keyboardType="numeric" />
            <Text style={s.fieldLabel}>NOTES (optional)</Text>
            <TextInput style={s.modalInput} value={fundNotes} onChangeText={setFundNotes} placeholder="Fund purpose..." placeholderTextColor={Colors.muted} />
            <TouchableOpacity style={[s.modalBtn, { backgroundColor: Colors.success }]} onPress={submitFund} disabled={submitting} activeOpacity={0.85}>
              {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.modalBtnText}>Add Funds</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  summaryRow:     { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard:    { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center' },
  summaryLabel:   { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },
  summaryValue:   { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 4 },
  siteCard:       { backgroundColor: Colors.card, borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.border },
  siteIcon:       { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  siteName:       { color: Colors.text1, fontWeight: '800', fontSize: 14 },
  siteSub:        { color: Colors.muted, fontSize: 11, marginTop: 1 },
  siteBalance:    { fontWeight: '900', fontSize: 15 },
  miniStat:       { flex: 1, borderRadius: 10, padding: 8, alignItems: 'center' },
  miniStatVal:    { fontWeight: '900', fontSize: 13 },
  miniStatLabel:  { color: Colors.muted, fontSize: 10, marginTop: 1 },
  progressBg:     { height: 4, backgroundColor: Colors.border, borderRadius: 2, marginBottom: 4 },
  progressFill:   { height: 4, borderRadius: 2 },
  progressLabel:  { color: Colors.muted, fontSize: 10, marginBottom: 8 },
  expRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  expDot:         { width: 6, height: 6, borderRadius: 3 },
  expCat:         { flex: 1, color: Colors.text2, fontSize: 12 },
  expAmt:         { color: Colors.text1, fontWeight: '700', fontSize: 12 },
  fabs:           { position: 'absolute', bottom: 24, right: 16, gap: 10 },
  fab:            { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 50, shadowColor: '#000', shadowOffset: {width:0,height:4}, shadowOpacity:0.3, shadowRadius:8, elevation:8 },
  fabText:        { color: '#fff', fontWeight: '800', fontSize: 13 },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard:      { backgroundColor: Colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, borderTopWidth: 1, borderColor: Colors.border },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:     { color: Colors.text1, fontWeight: '900', fontSize: 18 },
  fieldLabel:     { color: Colors.accent + 'cc', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  modalInput:     { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: Colors.text1, fontSize: 14, marginBottom: 14 },
  pill:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.border },
  pillText:       { color: Colors.text2, fontSize: 12, fontWeight: '600' },
  modalBtn:       { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  modalBtnText:   { color: '#fff', fontWeight: '800', fontSize: 15 },
})
