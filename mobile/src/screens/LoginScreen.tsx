import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Phone, Mail, ArrowLeft, Sparkles } from 'lucide-react-native'
import { colors } from '../theme/colors'
import { useNavigation } from '@react-navigation/native'

export default function LoginScreen() {
  const navigation = useNavigation()
  const [phoneOrEmail, setPhoneOrEmail] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = () => {
    // TODO: Implémenter la logique de connexion avec Supabase
    console.log('Connexion avec:', phoneOrEmail)
    
    // Navigation vers le feed après connexion
    // navigation.navigate('Feed')
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec retour */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color={colors.or} size={20} />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        {/* En-tête */}
        <View style={styles.header}>
          <Sparkles color={colors.or} size={40} />
          <Text style={styles.title}>BIENVENUE</Text>
          <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          {/* Input Téléphone/Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>TÉLÉPHONE OU EMAIL</Text>
            <View style={[styles.inputWrapper, isFocused && styles.inputFocused]}>
              <TextInput
                style={styles.input}
                value={phoneOrEmail}
                onChangeText={setPhoneOrEmail}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="+221 77 123 45 67"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="default"
                autoCapitalize="none"
              />
              <View style={styles.iconContainer}>
                {phoneOrEmail.includes('@') ? (
                  <Mail color={colors.or30} size={20} />
                ) : (
                  <Phone color={colors.or30} size={20} />
                )}
              </View>
            </View>
          </View>

          {/* Bouton Continuer */}
          <TouchableOpacity
            style={[styles.button, !phoneOrEmail && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!phoneOrEmail}
          >
            <Text style={styles.buttonText}>CONTINUER</Text>
          </TouchableOpacity>
        </View>

        {/* Séparateur */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>OU</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Lien vers création de compte */}
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Vous n'avez pas de compte ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
            <Text style={styles.linkButton}>Créer un compte SIGNARE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.noir,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 30,
  },
  backText: {
    color: colors.or,
    fontSize: 14,
    letterSpacing: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'serif',
    color: colors.or,
    letterSpacing: 4,
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    letterSpacing: 1,
  },
  form: {
    gap: 30,
  },
  inputContainer: {
    gap: 12,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingBottom: 12,
  },
  inputFocused: {
    borderBottomColor: colors.or,
  },
  input: {
    flex: 1,
    color: colors.blanc,
    fontSize: 18,
    paddingVertical: 8,
  },
  iconContainer: {
    marginLeft: 10,
  },
  button: {
    backgroundColor: colors.or,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.noir,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
    gap: 15,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  separatorText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    letterSpacing: 2,
  },
  linkContainer: {
    alignItems: 'center',
    gap: 10,
  },
  linkText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  linkButton: {
    color: colors.or,
    fontSize: 14,
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.or30,
    paddingBottom: 2,
  },
})

