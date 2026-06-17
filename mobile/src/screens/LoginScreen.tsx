import React from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar
} from 'react-native'
import { login } from '../utils/api'
import { saveToken, saveUser } from '../utils/auth'
import { Colors } from '../utils/theme'

export default function LoginScreen({ onLogin }: { onLogin: (user: any) => void }) {
  const [email,    setEmail]    = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading,  setLoading]  = React.useState(false)

  async function handleLogin() {
    if (!email || !password) { Alert.alert('Error', 'Enter email and password'); return }
    setLoading(true)
    try {
      const r = await login(email, password)
      await saveToken(r.token)
      await saveUser(r.user)
      onLogin(r.user)
    } catch (e: any) {
      Alert.alert('Login Failed', e?.response?.data?.error || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  const demoAccounts = [
    { label: 'Admin',   email: 'admin@wework.com',   pass: 'adminpass',  color: Colors.rose },
    { label: 'Manager', email: 'manager@wework.com', pass: 'manager123', color: Colors.purple },
  ]

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Brand */}
      <View style={s.brand}>
        <View style={s.logoBox}>
          <Text style={s.logoText}>WW</Text>
        </View>
        <Text style={s.appName}>We Work</Text>
        <Text style={s.appSub}>CONSTRUCTIONS MANAGEMENT</Text>
        <View style={s.onlinePill}>
          <View style={s.onlineDot} />
          <Text style={s.onlineText}>System Online</Text>
        </View>
      </View>

      {/* Card */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Welcome back</Text>
        <Text style={s.cardSub}>Sign in to your account</Text>

        <Text style={s.fieldLabel}>EMAIL ADDRESS</Text>
        <TextInput
          style={s.input} value={email} onChangeText={setEmail}
          placeholder="your@email.com" placeholderTextColor={Colors.muted}
          autoCapitalize="none" keyboardType="email-address"
        />

        <Text style={s.fieldLabel}>PASSWORD</Text>
        <TextInput
          style={s.input} value={password} onChangeText={setPassword}
          placeholder="••••••••" placeholderTextColor={Colors.muted}
          secureTextEntry
        />

        <TouchableOpacity style={s.loginBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginBtnText}>Sign In</Text>}
        </TouchableOpacity>

        {/* Divider */}
        <View style={s.divider}><View style={s.divLine} /><Text style={s.divText}>Demo Accounts</Text><View style={s.divLine} /></View>

        <View style={s.demoRow}>
          {demoAccounts.map(a => (
            <TouchableOpacity key={a.label} style={s.demoBtn}
              onPress={() => { setEmail(a.email); setPassword(a.pass) }} activeOpacity={0.75}>
              <View style={[s.demoDot, { backgroundColor: a.color }]} />
              <Text style={s.demoBtnLabel}>{a.label}</Text>
              <Text style={s.demoBtnEmail} numberOfLines={1}>{a.email}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root:         { flex:1, backgroundColor:Colors.bg, justifyContent:'center', padding:24 },
  brand:        { alignItems:'center', marginBottom:28 },
  logoBox:      { width:64, height:64, borderRadius:20, backgroundColor:Colors.primary, justifyContent:'center', alignItems:'center', marginBottom:12, shadowColor:Colors.primary, shadowOffset:{width:0,height:8}, shadowOpacity:0.5, shadowRadius:16, elevation:12 },
  logoText:     { color:'#fff', fontWeight:'900', fontSize:20 },
  appName:      { color:'#fff', fontSize:28, fontWeight:'900', letterSpacing:-0.5 },
  appSub:       { color:Colors.accent+'99', fontSize:10, fontWeight:'700', letterSpacing:3, marginTop:4 },
  onlinePill:   { flexDirection:'row', alignItems:'center', gap:6, marginTop:10, backgroundColor:'rgba(16,185,129,0.12)', paddingHorizontal:12, paddingVertical:5, borderRadius:20 },
  onlineDot:    { width:6, height:6, borderRadius:3, backgroundColor:'#10b981' },
  onlineText:   { color:'#10b981', fontSize:11, fontWeight:'700' },
  card:         { backgroundColor:Colors.card, borderRadius:24, padding:24, borderWidth:1, borderColor:Colors.border },
  cardTitle:    { color:Colors.text1, fontSize:20, fontWeight:'800', marginBottom:4 },
  cardSub:      { color:Colors.text2, fontSize:13, marginBottom:20 },
  fieldLabel:   { color:Colors.accent+'cc', fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:6 },
  input:        { backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:Colors.border, borderRadius:12, paddingHorizontal:16, paddingVertical:12, color:Colors.text1, fontSize:14, marginBottom:16 },
  loginBtn:     { backgroundColor:Colors.primary, borderRadius:14, paddingVertical:14, alignItems:'center', marginTop:4, shadowColor:Colors.primary, shadowOffset:{width:0,height:6}, shadowOpacity:0.4, shadowRadius:12, elevation:8 },
  loginBtnText: { color:'#fff', fontSize:15, fontWeight:'800' },
  divider:      { flexDirection:'row', alignItems:'center', gap:10, marginVertical:20 },
  divLine:      { flex:1, height:1, backgroundColor:Colors.border },
  divText:      { color:Colors.muted, fontSize:11, fontWeight:'600' },
  demoRow:      { flexDirection:'row', gap:10 },
  demoBtn:      { flex:1, backgroundColor:'rgba(255,255,255,0.04)', borderRadius:12, padding:12, borderWidth:1, borderColor:Colors.border },
  demoDot:      { width:8, height:8, borderRadius:4, marginBottom:4 },
  demoBtnLabel: { color:Colors.text1, fontWeight:'700', fontSize:13, marginBottom:2 },
  demoBtnEmail: { color:Colors.muted, fontSize:10 },
})
