import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { View } from 'react-native'
import { Home, MessageCircle, Sparkles, Ticket, User } from 'lucide-react-native'
import FeedScreen from '../screens/FeedScreen'
import MessagesScreen from '../screens/MessagesScreen'
import InspirationScreen from '../screens/InspirationScreen'
import EventsScreen from '../screens/EventsScreen'
import ProfileScreen from '../screens/ProfileScreen'
import { colors } from '../theme/colors'

const Tab = createBottomTabNavigator()

const iconSize = 22

export default function BottomTabs() {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  )
}

