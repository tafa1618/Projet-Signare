import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Feed (mobile)</Text>
        <Text style={styles.subtitle}>Same backend (Supabase) — UI compacte mobile.</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.noir },
  content: { padding: 16, gap: 8 },
  title: { color: colors.or, fontSize: 20, fontWeight: '700', letterSpacing: 2 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
})

