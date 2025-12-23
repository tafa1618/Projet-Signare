import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'

export default function EventsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Événements</Text>
      <Text style={styles.subtitle}>Stories / Lives / Billetterie — version mobile.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.noir, padding: 16, gap: 8 },
  title: { color: colors.or, fontSize: 20, fontWeight: '700', letterSpacing: 2 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
})

