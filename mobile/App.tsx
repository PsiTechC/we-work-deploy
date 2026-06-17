import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StatusBar, View, ActivityIndicator } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { getToken, getUser, clearAll } from './src/utils/auth'
import { Colors } from './src/utils/theme'

import LoginScreen    from './src/screens/LoginScreen'
import DashboardScreen from './src/screens/DashboardScreen'
import AttendanceScreen from './src/screens/AttendanceScreen'
import ExpenseScreen   from './src/screens/ExpenseScreen'

const Stack = createNativeStackNavigator()
const Tab   = createBottomTabNavigator()

function MainTabs({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle:      { backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border, shadowColor: 'transparent' },
        headerTintColor:  Colors.text1,
        headerTitleStyle: { fontWeight: '800', fontSize: 16 },
        tabBarStyle:      { backgroundColor: Colors.card, borderTopColor: Colors.border, borderTopWidth: 1, height: 64, paddingBottom: 8 },
        tabBarActiveTintColor:   Colors.accent,
        tabBarInactiveTintColor: Colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: -2 },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Feather.glyphMap> = {
            Dashboard:  'grid',
            Expenses:   'credit-card',
            Attendance: 'clock',
          }
          return <Feather name={icons[route.name] || 'circle'} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Dashboard">
        {() => <DashboardScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Expenses">
        {() => <ExpenseScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Attendance">
        {() => <AttendanceScreen />}
      </Tab.Screen>
    </Tab.Navigator>
  )
}

export default function App() {
  const [user,    setUser]    = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function bootstrap() {
      try {
        const [token, u] = await Promise.all([getToken(), getUser()])
        if (token && u) setUser(u)
      } finally { setLoading(false) }
    }
    bootstrap()
  }, [])

  function handleLogin(u: any) { setUser(u) }

  async function handleLogout() {
    await clearAll()
    setUser(null)
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login">
            {() => <LoginScreen onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main">
            {() => <MainTabs user={user} onLogout={handleLogout} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
