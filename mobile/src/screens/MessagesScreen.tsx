import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <Text style={styles.subtitle}>Salon privé mobile-first (à connecter au backend partagé).</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.noir, padding: 16, gap: 8 },
  title: { color: colors.or, fontSize: 20, fontWeight: '700', letterSpacing: 2 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
})

