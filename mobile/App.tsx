import React from 'react'
import { SafeAreaView, StatusBar } from 'react-native'
import AppNavigator from './src/navigation/AppNavigator'
import { colors } from './src/theme/colors'

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.noir }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.noir} />
      <AppNavigator />
    </SafeAreaView>
  )
}

