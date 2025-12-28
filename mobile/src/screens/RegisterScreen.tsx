import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Phone, Mail, User, ArrowLeft, Sparkles, Check, Calendar, Scissors } from 'lucide-react-native'
import { colors } from '../theme/colors'
import { useNavigation } from '@react-navigation/native'

export default function RegisterScreen() {
  const navigation = useNavigation()
  const [phoneOrEmail, setPhoneOrEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState<'signare' | 'ndanane' | null>(null)
  const [isTailor, setIsTailor] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isFocusedPhone, setIsFocusedPhone] = useState(false)
  const [isFocusedName, setIsFocusedName] = useState(false)
  const [isFocusedDate, setIsFocusedDate] = useState(false)

  const handleSubmit = () => {
    // Calcul de l'âge pour ML
    const age = dateOfBirth ? Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null
    
    // Données ML-ready
    const registrationData = {
      phoneOrEmail,
      fullName,
      dateOfBirth,
      age,
      gender,
      isTailor,
      mlMetadata: {
        age_group: age ? (age < 18 ? 'teen' : age < 25 ? 'young_adult' : age < 35 ? 'adult' : age < 50 ? 'mature' : 'senior') : null,
        gender_preference: gender,
        user_type: isTailor ? 'creator' : 'client',
        registration_date: new Date().toISOString(),
      }
    }
    
    // TODO: Implémenter la logique d'inscription avec Supabase
    console.log('Inscription ML-ready:', registrationData)
    
    // Navigation vers le feed après inscription
    // navigation.navigate('Feed')
  }

  const isFormValid = phoneOrEmail && fullName && dateOfBirth && gender && acceptTerms

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
          <Text style={styles.title}>REJOIGNEZ-NOUS</Text>
          <Text style={styles.subtitle}>Créez votre compte SIGNARE</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          {/* Input Nom Complet */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>NOM COMPLET</Text>
            <View style={[styles.inputWrapper, isFocusedName && styles.inputFocused]}>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setIsFocusedName(true)}
                onBlur={() => setIsFocusedName(false)}
                placeholder="Fatou Diop"
                placeholderTextColor="rgba(255,255,255,0.3)"
                autoCapitalize="words"
              />
              <View style={styles.iconContainer}>
                <User color={colors.or30} size={20} />
              </View>
            </View>
          </View>

          {/* Input Téléphone/Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>TÉLÉPHONE OU EMAIL</Text>
            <View style={[styles.inputWrapper, isFocusedPhone && styles.inputFocused]}>
              <TextInput
                style={styles.input}
                value={phoneOrEmail}
                onChangeText={setPhoneOrEmail}
                onFocus={() => setIsFocusedPhone(true)}
                onBlur={() => setIsFocusedPhone(false)}
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

          {/* Input Date de Naissance */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>DATE DE NAISSANCE</Text>
            <View style={[styles.inputWrapper, isFocusedDate && styles.inputFocused]}>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                onFocus={() => setIsFocusedDate(true)}
                onBlur={() => setIsFocusedDate(false)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
              />
              <View style={styles.iconContainer}>
                <Calendar color={colors.or30} size={20} />
              </View>
            </View>
          </View>

          {/* Sélection Genre */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>GENRE</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'signare' && styles.genderButtonActive]}
                onPress={() => setGender('signare')}
              >
                <Text style={[styles.genderText, gender === 'signare' && styles.genderTextActive]}>
                  SIGNARE
                </Text>
                <Text style={styles.genderSubtext}>Femme</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.genderButton, gender === 'ndanane' && styles.genderButtonActive]}
                onPress={() => setGender('ndanane')}
              >
                <Text style={[styles.genderText, gender === 'ndanane' && styles.genderTextActive]}>
                  NDANANE
                </Text>
                <Text style={styles.genderSubtext}>Homme</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Checkbox Tailleur */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              onPress={() => setIsTailor(!isTailor)}
              style={styles.checkbox}
            >
              <View style={[styles.checkboxBox, isTailor && styles.checkboxBoxActive]}>
                {isTailor && <Check color={colors.noir} size={12} strokeWidth={3} />}
              </View>
            </TouchableOpacity>
            <View style={styles.checkboxContent}>
              <Scissors color={colors.or30} size={16} />
              <Text style={styles.checkboxText}>Je suis tailleur</Text>
            </View>
          </View>

          {/* Checkbox Conditions */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              onPress={() => setAcceptTerms(!acceptTerms)}
              style={styles.checkbox}
            >
              <View style={[styles.checkboxBox, acceptTerms && styles.checkboxBoxActive]}>
                {acceptTerms && <Check color={colors.noir} size={12} strokeWidth={3} />}
              </View>
            </TouchableOpacity>
            <Text style={styles.checkboxText}>
              J'accepte les{' '}
              <Text style={styles.linkText}>Conditions d'utilisation</Text>
              {' '}et la{' '}
              <Text style={styles.linkText}>Politique de confidentialité</Text>
            </Text>
          </View>

          {/* Bouton Créer le compte */}
          <TouchableOpacity
            style={[styles.button, !isFormValid && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid}
          >
            <Text style={styles.buttonText}>CRÉER MON COMPTE</Text>
          </TouchableOpacity>
        </View>

        {/* Séparateur */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>OU</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Lien vers connexion */}
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Vous avez déjà un compte ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.linkButton}>Se connecter</Text>
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
    gap: 25,
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
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    gap: 6,
  },
  genderButtonActive: {
    backgroundColor: colors.or20,
    borderColor: colors.or,
  },
  genderText: {
    fontSize: 16,
    fontFamily: 'serif',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.6)',
  },
  genderTextActive: {
    color: colors.or,
  },
  genderSubtext: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    marginTop: 2,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxActive: {
    backgroundColor: colors.or,
    borderColor: colors.or,
  },
  checkboxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  checkboxText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  linkText: {
    color: colors.or,
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
    marginBottom: 20,
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

