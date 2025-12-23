import React from 'react'
import { SafeAreaView, StatusBar } from 'react-native'
import BottomTabs from './src/components/BottomTabs'
import { colors } from './src/theme/colors'

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.noir }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.noir} />
      <BottomTabs />
    </SafeAreaView>
  )
}

