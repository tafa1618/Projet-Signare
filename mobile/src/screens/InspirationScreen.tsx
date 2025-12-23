import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'

export default function InspirationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inspiration IA</Text>
      <Text style={styles.subtitle}>Try-on & moodboard mobile (mock) — partage du backend Supabase.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.noir, padding: 16, gap: 8 },
  title: { color: colors.or, fontSize: 20, fontWeight: '700', letterSpacing: 2 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
})

