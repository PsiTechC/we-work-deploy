import React from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import * as Location from 'expo-location'
import { checkIn, checkOut, fetchMyAttendance, fetchTodayAttendance } from '../utils/api'
import { Colors } from '../utils/theme'
import { Feather } from '@expo/vector-icons'

const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

export default function AttendanceScreen() {
  const [today, setToday] = React.useState<any>(null)
  const [history, setHistory] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [actionLoading, setActionLoading] = React.useState(false)

  async function load() {
    try {
      const [t, h] = await Promise.all([fetchTodayAttendance(), fetchMyAttendance()])
      setToday(t); setHistory(h)
    } finally { setLoading(false) }
  }
  React.useEffect(() => { load() }, [])

  async function doCheckIn() {
    setActionLoading(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      let lat: number | null = null, lng: number | null = null
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
        lat = loc.coords.latitude; lng = loc.coords.longitude
      }
      await checkIn({ lat, lng })
      Alert.alert('✅ Checked In', lat ? `Location: ${lat.toFixed(4)}, ${lng?.toFixed(4)}` : 'No location captured')
      load()
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || 'Check-in failed')
    } finally { setActionLoading(false) }
  }

  async function doCheckOut() {
    setActionLoading(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      let lat: number | null = null, lng: number | null = null
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
        lat = loc.coords.latitude; lng = loc.coords.longitude
      }
      await checkOut({ lat, lng })
      Alert.alert('✅ Checked Out', 'Have a good day!')
      load()
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || 'Check-out failed')
    } finally { setActionLoading(false) }
  }

  const checkedIn  = !!today?.checkIn
  const checkedOut = !!today?.checkOut

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Today's card */}
      <View style={[s.todayCard, checkedOut && { borderColor: Colors.success }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={s.todayTitle}>Today's Attendance</Text>
          <View style={[s.statusPill, { backgroundColor: checkedOut ? Colors.success + '22' : checkedIn ? Colors.accent + '22' : Colors.muted + '22' }]}>
            <Text style={[s.statusText, { color: checkedOut ? Colors.success : checkedIn ? Colors.accent : Colors.muted }]}>
              {checkedOut ? 'Complete' : checkedIn ? 'Checked In' : 'Not Started'}
            </Text>
          </View>
        </View>

        {checkedIn && (
          <View style={s.timeRow}>
            <View style={s.timeItem}>
              <Feather name="log-in" size={14} color={Colors.accent} />
              <Text style={s.timeLabel}>Check-In</Text>
              <Text style={s.timeValue}>{fmtTime(today.checkIn)}</Text>
              {today.checkInLat && <Text style={s.locText}>{today.checkInLat.toFixed(4)}, {today.checkInLng?.toFixed(4)}</Text>}
            </View>
            {checkedOut && (
              <View style={s.timeItem}>
                <Feather name="log-out" size={14} color={Colors.success} />
                <Text style={s.timeLabel}>Check-Out</Text>
                <Text style={s.timeValue}>{fmtTime(today.checkOut)}</Text>
                <Text style={s.hoursText}>{today.hoursWorked}h worked</Text>
              </View>
            )}
          </View>
        )}

        {/* Action buttons */}
        {!loading && (
          <View style={s.btnRow}>
            {!checkedIn && !checkedOut && (
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.primary }]} onPress={doCheckIn} disabled={actionLoading} activeOpacity={0.85}>
                {actionLoading ? <ActivityIndicator color="#fff" size="small" /> : <><Feather name="log-in" size={16} color="#fff" /><Text style={s.actionBtnText}>Check In</Text></>}
              </TouchableOpacity>
            )}
            {checkedIn && !checkedOut && (
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.success }]} onPress={doCheckOut} disabled={actionLoading} activeOpacity={0.85}>
                {actionLoading ? <ActivityIndicator color="#fff" size="small" /> : <><Feather name="log-out" size={16} color="#fff" /><Text style={s.actionBtnText}>Check Out</Text></>}
              </TouchableOpacity>
            )}
            {checkedOut && (
              <View style={[s.actionBtn, { backgroundColor: Colors.success + '22' }]}>
                <Feather name="check-circle" size={16} color={Colors.success} />
                <Text style={[s.actionBtnText, { color: Colors.success }]}>Day Complete — {today.hoursWorked}h</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* History */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Attendance History</Text>
        {loading && <ActivityIndicator color={Colors.accent} style={{ marginVertical: 20 }} />}
        {!loading && history.length === 0 && <Text style={s.emptyText}>No attendance records yet</Text>}
        {history.map((r: any, i: number) => (
          <View key={r.id} style={[s.histRow, i === history.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={[s.histDot, { backgroundColor: r.checkOut ? Colors.success : r.checkIn ? Colors.accent : Colors.muted }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.histDate}>{fmt(r.date)}</Text>
              {r.checkIn && <Text style={s.histTime}>In: {fmtTime(r.checkIn)}{r.checkOut ? `  Out: ${fmtTime(r.checkOut)}` : ''}</Text>}
            </View>
            {r.hoursWorked != null && <Text style={s.histHours}>{r.hoursWorked}h</Text>}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: Colors.bg },
  todayCard:    { backgroundColor: Colors.card, borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 2, borderColor: Colors.border },
  todayTitle:   { color: Colors.text1, fontWeight: '800', fontSize: 16 },
  statusPill:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText:   { fontSize: 11, fontWeight: '700' },
  timeRow:      { flexDirection: 'row', gap: 12, marginBottom: 16 },
  timeItem:     { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12 },
  timeLabel:    { color: Colors.muted, fontSize: 11, marginTop: 4 },
  timeValue:    { color: Colors.text1, fontSize: 16, fontWeight: '900' },
  locText:      { color: Colors.muted, fontSize: 10, marginTop: 2 },
  hoursText:    { color: Colors.success, fontSize: 11, fontWeight: '700', marginTop: 2 },
  btnRow:       { gap: 8 },
  actionBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14 },
  actionBtnText:{ color: '#fff', fontWeight: '800', fontSize: 14 },
  section:      { backgroundColor: Colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { color: Colors.text1, fontWeight: '800', fontSize: 15, marginBottom: 12 },
  histRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  histDot:      { width: 8, height: 8, borderRadius: 4 },
  histDate:     { color: Colors.text1, fontWeight: '700', fontSize: 13 },
  histTime:     { color: Colors.muted, fontSize: 11, marginTop: 2 },
  histHours:    { color: Colors.success, fontWeight: '800', fontSize: 13 },
  emptyText:    { color: Colors.muted, textAlign: 'center', paddingVertical: 20, fontSize: 13 },
})
