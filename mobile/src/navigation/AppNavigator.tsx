import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Home, MessageCircle, Sparkles, Ticket, User } from 'lucide-react-native'
import { colors } from '../theme/colors'

// Screens
import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import FeedScreen from '../screens/FeedScreen'
import MessagesScreen from '../screens/MessagesScreen'
import InspirationScreen from '../screens/InspirationScreen'
import EventsScreen from '../screens/EventsScreen'
import ProfileScreen from '../screens/ProfileScreen'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

const iconSize = 22

// Tab Navigator (main app)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.noir,
          borderTopColor: colors.or20,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.or,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color }) => <Home color={color} size={iconSize} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={iconSize} />,
        }}
      />
      <Tab.Screen
        name="Inspiration"
        component={InspirationScreen}
        options={{
          tabBarLabel: 'IA',
          tabBarIcon: ({ color }) => <Sparkles color={color} size={iconSize} />,
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: ({ color }) => <Ticket color={color} size={iconSize} />,
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => <User color={color} size={iconSize} />,
        }}
      />
    </Tab.Navigator>
  )
}

// Root Navigator (handles auth)
export default function AppNavigator() {
  // TODO: Vérifier l'état d'authentification avec Supabase
  const isAuthenticated = false // À remplacer par la logique d'auth réelle

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Main App
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

