import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, TextInput, Dimensions, Alert } from 'react-native'
import { Wand2, Camera, Shirt, Sparkles, ImageIcon, Sparkle, SlidersHorizontal, Palette } from 'lucide-react-native'
import { colors } from '../theme/colors'
import * as ImagePicker from 'expo-image-picker'

const { width } = Dimensions.get('window')

interface TryOnResult {
  id: string
  userImage: string
  modelImage: string
  outputImage: string
  prompt: string
}

interface InspirationResult {
  id: string
  image: string
  title: string
  style: string
}

const PLACEHOLDER_USER = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop'
const PLACEHOLDER_MODEL = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop'

const MOCK_INSPI: InspirationResult[] = [
  {
    id: 'i1',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop',
    title: 'Kaftan Soie • Drapé fluide',
    style: 'soie, dorures fines, soirée',
  },
  {
    id: 'i2',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1000&fit=crop',
    title: 'Robe Wax • Coupe sirène',
    style: 'wax premium, broderies, mariage',
  },
  {
    id: 'i3',
    image: 'https://images.unsplash.com/photo-1520975958225-12b1f1f1d9a7?w=800&h=1000&fit=crop',
    title: 'Boubou Royal • Broderie',
    style: 'basin riche, motifs géométriques, cérémonial',
  },
]

const presetTags = ['soie', 'wax', 'lin', 'soirée', 'mariage', 'quotidien', 'minimal']

function trackIAInteraction(event: string, data: Record<string, unknown>) {
  console.log('[ML] ia_interaction', { event, ...data, timestamp: new Date().toISOString() })
}

export default function InspirationScreen() {
  const [mode, setMode] = useState<'client' | 'tailleur'>('client')
  const [userImage, setUserImage] = useState<string>('')
  const [modelImage, setModelImage] = useState<string>('')
  const [prompt, setPrompt] = useState('kaftan soie dorée, broderies fines, coupe fluide')
  const [styleTags, setStyleTags] = useState<string[]>(['soie', 'luxe', 'soirée'])
  const [tryOnResults, setTryOnResults] = useState<TryOnResult[]>([])
  const [inspiResults, setInspiResults] = useState<InspirationResult[]>(MOCK_INSPI)
  const [tailorImages, setTailorImages] = useState<string[]>([])

  const canGenerate = useMemo(() => {
    return (userImage || modelImage) && prompt.length >= 8
  }, [userImage, modelImage, prompt])

  const pickImage = async (setter: (uri: string) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de l\'accès à vos photos.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setter(result.assets[0].uri)
    }
  }

  const pickMultipleImages = async (setter: (uris: string[]) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de l\'accès à vos photos.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })

    if (!result.canceled && result.assets) {
      setter(result.assets.slice(0, 4).map((asset) => asset.uri))
    }
  }

  const toggleTag = (tag: string) => {
    setStyleTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleGenerateTryOn = () => {
    if (!canGenerate) return
    const output: TryOnResult = {
      id: `try-${Date.now()}`,
      userImage: userImage || PLACEHOLDER_USER,
      modelImage: modelImage || PLACEHOLDER_MODEL,
      outputImage: modelImage || PLACEHOLDER_MODEL,
      prompt,
    }
    setTryOnResults([output, ...tryOnResults].slice(0, 3))
    trackIAInteraction('try_on_generate', {
      style_tags: styleTags,
      prompt_length: prompt.length,
      has_user_image: Boolean(userImage),
      has_model_image: Boolean(modelImage),
    })
  }

  const handleGenerateInspiration = () => {
    const newInspi: InspirationResult = {
      id: `inspi-${Date.now()}`,
      image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&h=1000&fit=crop',
      title: 'Inspiration IA • Fusion',
      style: styleTags.join(', '),
    }
    setInspiResults([newInspi, ...inspiResults].slice(0, 6))
    trackIAInteraction('inspiration_generate', {
      style_tags: styleTags,
      prompt_length: prompt.length,
    })
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Wand2 color={colors.noir} size={20} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Inspiration IA</Text>
              <Text style={styles.headerSubtitle}>Essayage + Moodboard</Text>
            </View>
          </View>
        </View>

        {/* Toggle mode */}
        <View style={styles.modeToggle}>
          <Text style={styles.modeLabel}>
            Mode : {mode === 'client' ? 'Essayage client' : 'Inspiration tailleur'}
          </Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity
              onPress={() => setMode('client')}
              style={[styles.modeButton, mode === 'client' && styles.modeButtonActive]}
            >
              <Text style={[styles.modeButtonText, mode === 'client' && styles.modeButtonTextActive]}>
                Client
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('tailleur')}
              style={[styles.modeButton, mode === 'tailleur' && styles.modeButtonActive]}
            >
              <Text style={[styles.modeButtonText, mode === 'tailleur' && styles.modeButtonTextActive]}>
                Tailleur
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode Client - Try-On */}
        {mode === 'client' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Camera color={colors.or} size={16} />
              <Text style={styles.sectionTitle}>Essayage IA</Text>
            </View>

            <View style={styles.uploadGrid}>
              <TouchableOpacity
                onPress={() => pickImage(setUserImage)}
                style={styles.uploadBox}
              >
                <Text style={styles.uploadLabel}>Photo utilisateur</Text>
                {userImage ? (
                  <Image source={{ uri: userImage }} style={styles.uploadImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Camera color={colors.or} size={24} />
                    <Text style={styles.uploadPlaceholderText}>
                      Cliquez pour choisir
                    </Text>
                  </View>
                )}
                <Text style={styles.uploadHint}>Portrait clair, frontal.</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => pickImage(setModelImage)}
                style={styles.uploadBox}
              >
                <Text style={styles.uploadLabel}>Photo du modèle</Text>
                {modelImage ? (
                  <Image source={{ uri: modelImage }} style={styles.uploadImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Shirt color={colors.or} size={24} />
                    <Text style={styles.uploadPlaceholderText}>
                      Cliquez pour choisir
                    </Text>
                  </View>
                )}
                <Text style={styles.uploadHint}>Tenue à tester sur vous.</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.promptContainer}>
              <Text style={styles.promptLabel}>Prompt (style, matière, occasion)</Text>
              <TextInput
                style={styles.promptInput}
                value={prompt}
                onChangeText={setPrompt}
                placeholder="Ex: robe wax premium, broderies or, coupe sirène, mariage"
                placeholderTextColor="rgba(255,255,255,0.25)"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.tagsContainer}>
              {presetTags.map((tag) => {
                const active = styleTags.includes(tag)
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={[styles.tag, active && styles.tagActive]}
                  >
                    <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <View style={styles.mlInfo}>
              <SlidersHorizontal color={colors.or} size={14} />
              <Text style={styles.mlInfoText}>
                ML-ready : nous loggons style_tags, prompt_length, présence photo.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleGenerateTryOn}
              disabled={!canGenerate}
              style={[styles.generateButton, !canGenerate && styles.generateButtonDisabled]}
            >
              <Text style={styles.generateButtonText}>Simuler sur moi</Text>
            </TouchableOpacity>

            {tryOnResults.length > 0 && (
              <View style={styles.resultsGrid}>
                {tryOnResults.map((r) => (
                  <View key={r.id} style={styles.resultCard}>
                    <View style={styles.resultImageContainer}>
                      <Image source={{ uri: r.outputImage }} style={styles.resultImage} />
                      <View style={styles.resultOverlay} />
                      <View style={styles.resultBadge}>
                        <Sparkle color={colors.or} size={12} />
                        <Text style={styles.resultBadgeText}>IA</Text>
                      </View>
                    </View>
                    <View style={styles.resultContent}>
                      <Text style={styles.resultPrompt} numberOfLines={2}>
                        {r.prompt}
                      </Text>
                      <Text style={styles.resultLabel}>Simulation</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Mode Tailleur - Inspiration */}
        {mode === 'tailleur' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Palette color={colors.or} size={16} />
              <Text style={styles.sectionTitle}>Inspiration Tailleur</Text>
            </View>

            <Text style={styles.sectionDescription}>
              Génère des silhouettes ou motifs pour nourrir tes moodboards et briefs clients.
            </Text>

            <TouchableOpacity
              onPress={() => pickMultipleImages(setTailorImages)}
              style={styles.moodboardBox}
            >
              <Text style={styles.uploadLabel}>Moodboard (jusqu'à 4 photos)</Text>
              {tailorImages.length === 0 ? (
                <View style={styles.uploadPlaceholder}>
                  <ImageIcon color={colors.or} size={24} />
                  <Text style={styles.uploadPlaceholderText}>
                    Cliquez pour choisir vos références
                  </Text>
                </View>
              ) : (
                <View style={styles.moodboardGrid}>
                  {tailorImages.map((img, idx) => (
                    <Image key={idx} source={{ uri: img }} style={styles.moodboardImage} />
                  ))}
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.tagsContainer}>
              {['silhouette', 'motif', 'palette'].map((tag) => (
                <View key={tag} style={styles.tagInactive}>
                  <Text style={styles.tagTextInactive}>{tag}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleGenerateInspiration}
              style={styles.generateButtonTailor}
            >
              <Text style={styles.generateButtonTextTailor}>Générer une inspiration</Text>
            </TouchableOpacity>

            <View style={styles.resultsGrid}>
              {inspiResults.map((ins) => (
                <View key={ins.id} style={styles.resultCard}>
                  <View style={styles.resultImageContainer}>
                    <Image source={{ uri: ins.image }} style={styles.resultImage} />
                    <View style={styles.resultOverlay} />
                    <View style={styles.resultBadge}>
                      <ImageIcon color={colors.or} size={12} />
                      <Text style={styles.resultBadgeText}>IA</Text>
                    </View>
                  </View>
                  <View style={styles.resultContent}>
                    <Text style={styles.resultTitle} numberOfLines={2}>
                      {ins.title}
                    </Text>
                    <Text style={styles.resultStyle} numberOfLines={2}>
                      {ins.style}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.noir,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.or20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    backgroundColor: colors.or,
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'serif',
    color: colors.or,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginTop: 2,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  modeLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  modeButtonActive: {
    backgroundColor: colors.or,
    borderColor: colors.or,
  },
  modeButtonText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  modeButtonTextActive: {
    color: colors.noir,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'serif',
    color: colors.or,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionDescription: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 16,
  },
  uploadGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadBox: {
    flex: 1,
    gap: 8,
  },
  uploadLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  uploadPlaceholder: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.noir,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadPlaceholderText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  uploadImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.or20,
  },
  uploadHint: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
  },
  moodboardBox: {
    gap: 8,
  },
  moodboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodboardImage: {
    width: (width - 80) / 2,
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.or20,
  },
  promptContainer: {
    gap: 8,
  },
  promptLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  promptInput: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    color: colors.blanc,
    fontSize: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tagActive: {
    backgroundColor: colors.or,
    borderColor: colors.or,
  },
  tagText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tagTextActive: {
    color: colors.noir,
  },
  tagInactive: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tagTextInactive: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  mlInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mlInfoText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    flex: 1,
  },
  generateButton: {
    backgroundColor: colors.or,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.4,
  },
  generateButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.noir,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  generateButtonTailor: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.or30,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonTextTailor: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.or,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  resultCard: {
    width: (width - 64) / 3 - 8,
    backgroundColor: colors.noir,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultImageContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    position: 'relative',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  resultOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(10,10,10,0.6)',
  },
  resultBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.or,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  resultContent: {
    padding: 12,
    gap: 4,
  },
  resultPrompt: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
  },
  resultLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  resultTitle: {
    fontSize: 12,
    fontFamily: 'serif',
    color: colors.or,
    lineHeight: 16,
  },
  resultStyle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 14,
  },
})
