import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native'
import { Settings, Ruler, Award, Sparkles, LogOut, Star, Scissors, MessageCircle, Package, Bike } from 'lucide-react-native'
import { colors } from '../theme/colors'
import { useNavigation } from '@react-navigation/native'

const { width } = Dimensions.get('window')

type ProfileMode = 'client' | 'tailleur'

interface Mesure {
  tour_poitrine: number
  tour_taille: number
  tour_hanches: number
  longueur_bras: number
  body_type: string
  height_cm: number
}

interface ClientProfile {
  id: string
  name: string
  avatar: string
  bio: string
  outfitCount: number
  latestMesure: Mesure
}

interface TailorProfile {
  id: string
  name: string
  avatar: string
  bio: string
  rating: number
  activeOrders: number
  monthlyRevenue: string
  creationsCount: number
}

interface Order {
  id: string
  client: string
  model: string
  status: string
  measures: { poitrine: number; taille: number; hanches: number }
}

const MOCK_CLIENT_PROFILE: ClientProfile = {
  id: 'c1',
  name: 'Fatou Dia',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
  bio: "Inspirée par l'élégance traditionnelle du Sénégal. J'aime les coupes nettes, le wax premium et les finitions couture.",
  outfitCount: 13,
  latestMesure: {
    tour_poitrine: 92,
    tour_taille: 68,
    tour_hanches: 98,
    longueur_bras: 58,
    body_type: 'Sablier',
    height_cm: 168,
  },
}

const MOCK_TAILOR_PROFILE: TailorProfile = {
  id: 't1',
  name: 'Maison Aïda Sow',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aida',
  bio: 'Maîtresse Couturière — Spécialiste boubous de cérémonie & finitions couture.',
  rating: 4.9,
  activeOrders: 8,
  monthlyRevenue: '1.2M FCFA',
  creationsCount: 24,
}

const MOCK_TAILOR_ORDERS: Order[] = [
  {
    id: 'ord-101',
    client: 'Fatou Dia',
    model: 'Boubou perlé Soirée',
    status: 'En cours',
    measures: { poitrine: 92, taille: 68, hanches: 98 },
  },
  {
    id: 'ord-102',
    client: 'Aïssatou Ndiaye',
    model: 'Grand boubou brodé',
    status: 'À livrer',
    measures: { poitrine: 96, taille: 72, hanches: 104 },
  },
  {
    id: 'ord-103',
    client: 'Mame Diarra',
    model: 'Kaftan soie',
    status: 'Patronage',
    measures: { poitrine: 88, taille: 66, hanches: 94 },
  },
]

const gallery = Array.from({ length: 9 }).map((_, i) => ({
  id: `g-${i + 1}`,
  src: `https://images.unsplash.com/photo-15${i + 1}5372039744-b8f02a3ae446?w=400&h=400&fit=crop`,
}))

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating)
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          color={s <= rounded ? colors.or : 'rgba(255,255,255,0.2)'}
          fill={s <= rounded ? colors.or : 'transparent'}
        />
      ))}
    </View>
  )
}

export default function ProfileScreen() {
  const navigation = useNavigation()
  const [mode, setMode] = useState<ProfileMode>('client')
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null)
  const actorUserId = MOCK_CLIENT_PROFILE.id

  const profile = mode === 'client' ? MOCK_CLIENT_PROFILE : MOCK_TAILOR_PROFILE
  const isOwnProfile = mode === 'client' && profile.id === actorUserId

  const handleLogout = () => {
    // TODO: Implémenter la déconnexion Supabase
    navigation.navigate('Login' as never)
  }

  const simulateDeliveryQuote = async () => {
    try {
      setDeliveryStatus('Calcul en cours...')
      const payload = {
        distance_km: 6.2,
        traffic_level: 'medium',
        zone_type: 'dense',
        delivery_datetime: new Date().toISOString(),
      }
      const res = await fetch('http://localhost:8001/api/cost/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Delivery engine indisponible')
      const data = await res.json()
      setDeliveryStatus(`Total: ${data.total_cost?.toFixed?.(0) || data.total_cost} FCFA`)
    } catch (e) {
      setDeliveryStatus('Erreur: impossible de joindre delivery_engine')
    }
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => setMode(mode === 'client' ? 'tailleur' : 'client')}
          style={styles.modeButton}
        >
          <Text style={styles.modeButtonText}>
            MODE {mode === 'client' ? 'CLIENT' : 'TAILLEUR'}
          </Text>
        </TouchableOpacity>
        <View style={styles.topBarActions}>
          <TouchableOpacity>
            <Settings color={colors.or30} size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut color={colors.or} size={16} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header de prestige */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBorder}>
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {mode === 'client' ? 'MEMBRE SIGNARE' : 'ATELIER VÉRIFIÉ'}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
        </View>

        {mode === 'client' ? (
          <>
            {/* CTA: Discuter (seulement si profil d'un autre client) */}
            {!isOwnProfile && (
              <View style={styles.section}>
                <TouchableOpacity style={styles.messageButton}>
                  <MessageCircle color={colors.or} size={18} />
                  <Text style={styles.messageButtonText}>Discuter</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Mes Mensurations */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <Sparkles color={colors.or} size={16} />
                  <Text style={styles.sectionTitle}>Mes mensurations</Text>
                </View>
                {isOwnProfile && (
                  <TouchableOpacity style={styles.updateButton}>
                    <Ruler color={colors.or30} size={14} />
                    <Text style={styles.updateButtonText}>Mettre à jour</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isOwnProfile ? (
                <View style={styles.measuresGrid}>
                  {[
                    { label: 'Poitrine', value: MOCK_CLIENT_PROFILE.latestMesure.tour_poitrine },
                    { label: 'Taille', value: MOCK_CLIENT_PROFILE.latestMesure.tour_taille },
                    { label: 'Hanches', value: MOCK_CLIENT_PROFILE.latestMesure.tour_hanches },
                    { label: 'Bras', value: MOCK_CLIENT_PROFILE.latestMesure.longueur_bras },
                  ].map((m) => (
                    <View key={m.label} style={styles.measureCard}>
                      <Text style={styles.measureLabel}>{m.label}</Text>
                      <Text style={styles.measureValue}>{m.value} cm</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.privateCard}>
                  <Text style={styles.privateTitle}>Mensurations privées</Text>
                  <Text style={styles.privateText}>
                    Seul le propriétaire du profil peut consulter ses mesures.
                  </Text>
                </View>
              )}
            </View>

            {/* Patrimoine Style */}
            <View style={styles.heritageSection}>
              <View style={styles.heritageContent}>
                <Text style={styles.heritageLabel}>Patrimoine style</Text>
                <Text style={styles.heritageValue}>
                  {MOCK_CLIENT_PROFILE.outfitCount} tenues enregistrées
                </Text>
              </View>
              <Award color={colors.or30} size={32} />
            </View>

            {/* Galerie */}
            <View style={styles.gallerySection}>
              <Text style={styles.sectionTitle}>Galerie</Text>
              <View style={styles.galleryGrid}>
                {gallery.map((img) => (
                  <TouchableOpacity key={img.id} style={styles.galleryItem}>
                    <Image source={{ uri: img.src }} style={styles.galleryImage} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Commandes atelier */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitleSmall}>Commandes atelier</Text>
                  <Text style={styles.sectionSubtitle}>Clients, modèles et mesures clés</Text>
                </View>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Package color={colors.noir} size={16} />
                  <Text style={styles.viewAllButtonText}>Voir tout</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.ordersList}>
                {MOCK_TAILOR_ORDERS.map((order) => (
                  <View key={order.id} style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <View>
                        <Text style={styles.orderClient}>{order.client}</Text>
                        <Text style={styles.orderModel}>{order.model}</Text>
                      </View>
                      <View style={styles.orderStatus}>
                        <Text style={styles.orderStatusText}>{order.status}</Text>
                      </View>
                    </View>
                    <View style={styles.orderMeasures}>
                      <Ruler color={colors.or} size={12} />
                      <Text style={styles.orderMeasuresText}>
                        {order.measures.poitrine} / {order.measures.taille} / {order.measures.hanches} cm
                      </Text>
                      <Text style={styles.orderMeasuresLabel}>Poitrine / Taille / Hanches</Text>
                    </View>
                    <TouchableOpacity style={styles.orderButton}>
                      <Text style={styles.orderButtonText}>Ouvrir la commande</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Livraison express */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleSmall}>Livraison express</Text>
                {deliveryStatus && <Text style={styles.deliveryStatus}>{deliveryStatus}</Text>}
              </View>
              <TouchableOpacity onPress={simulateDeliveryQuote} style={styles.deliveryButton}>
                <Bike color={colors.noir} size={18} />
                <Text style={styles.deliveryButtonText}>Livrer (simu API)</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Atelier */}
            <View style={styles.statsGrid}>
              <View style={styles.statCardGold}>
                <Text style={styles.statLabel}>Commandes</Text>
                <Text style={styles.statValueGold}>{MOCK_TAILOR_PROFILE.activeOrders}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Revenus</Text>
                <Text style={styles.statValue}>{MOCK_TAILOR_PROFILE.monthlyRevenue}</Text>
              </View>
            </View>

            {/* Rating */}
            <View style={styles.ratingSection}>
              <View>
                <View style={styles.ratingHeader}>
                  <Scissors color={colors.or} size={14} />
                  <Text style={styles.ratingTitle}>Maître Tailleur</Text>
                </View>
                <Text style={styles.ratingSubtitle}>Qualité basée sur avis & réactivité</Text>
              </View>
              <View style={styles.ratingRight}>
                <StarRating rating={MOCK_TAILOR_PROFILE.rating} />
                <Text style={styles.ratingValue}>{MOCK_TAILOR_PROFILE.rating.toFixed(1)}</Text>
              </View>
            </View>

            {/* Créations */}
            <View style={styles.gallerySection}>
              <View style={styles.galleryHeader}>
                <Text style={styles.sectionTitle}>Créations</Text>
                <Text style={styles.galleryCount}>
                  {MOCK_TAILOR_PROFILE.creationsCount} pièces
                </Text>
              </View>
              <View style={styles.galleryGrid}>
                {gallery.map((img) => (
                  <TouchableOpacity key={img.id} style={styles.galleryItem}>
                    <Image source={{ uri: img.src }} style={styles.galleryImage} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.or20,
  },
  modeButton: {
    borderWidth: 1,
    borderColor: colors.or30,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modeButtonText: {
    fontSize: 9,
    letterSpacing: 2,
    color: colors.or,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoutButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: colors.or20,
    borderWidth: 1,
    borderColor: colors.or20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.or,
    padding: 2,
    shadowColor: colors.or,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 11,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  badge: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: colors.or,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.noir,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 24,
    fontFamily: 'serif',
    color: colors.or,
    marginTop: 8,
  },
  bio: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.noir,
    borderWidth: 1,
    borderColor: colors.or20,
    borderRadius: 12,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
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
  sectionTitleSmall: {
    fontSize: 9,
    color: colors.or,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.or30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  messageButtonText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.or,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  updateButtonText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.or30,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  measuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  measureCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.or20,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  measureLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  measureValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.or,
  },
  privateCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
  },
  privateTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
  },
  privateText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  heritageSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.or20,
    borderLeftWidth: 2,
    borderLeftColor: colors.or,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heritageContent: {
    flex: 1,
  },
  heritageLabel: {
    fontSize: 9,
    color: colors.or,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heritageValue: {
    fontSize: 20,
    fontFamily: 'serif',
    color: colors.blanc,
    marginTop: 4,
  },
  gallerySection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  galleryCount: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  galleryItem: {
    width: (width - 48) / 3 - 6,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.or,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewAllButtonText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.noir,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  ordersList: {
    gap: 12,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: colors.or20,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderClient: {
    fontSize: 10,
    color: colors.or,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  orderModel: {
    fontSize: 13,
    color: colors.blanc,
    marginTop: 2,
  },
  orderStatus: {
    borderWidth: 1,
    borderColor: colors.or20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 9,
    color: colors.or,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  orderMeasures: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  orderMeasuresText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  orderMeasuresLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
  },
  orderButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.or30,
    borderRadius: 8,
    padding: 10,
  },
  orderButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.or,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  deliveryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.or,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  deliveryButtonText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.noir,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  deliveryStatus: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statCardGold: {
    flex: 1,
    backgroundColor: colors.or,
    borderRadius: 12,
    padding: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.or20,
    borderRadius: 12,
    padding: 16,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  statValueGold: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.noir,
    marginTop: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'serif',
    color: colors.or,
    marginTop: 4,
  },
  ratingSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.noir,
    borderWidth: 1,
    borderColor: colors.or20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingTitle: {
    fontSize: 9,
    color: colors.or,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  ratingSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  ratingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.or,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
})
