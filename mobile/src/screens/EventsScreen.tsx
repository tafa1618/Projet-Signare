import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, TextInput, Dimensions, Modal } from 'react-native'
import { Ticket, Radio, Sparkles, Clock3, Users, MapPin, PlayCircle, ArrowRight, Heart, Laugh, Star, Bookmark, MessageSquare, X } from 'lucide-react-native'
import { colors } from '../theme/colors'

const { width } = Dimensions.get('window')

interface Story {
  id: string
  label: string
  type: 'live' | 'story'
  thumbnail: string
  media?: string
}

interface StoryComment {
  id: string
  author: string
  text: string
  timestamp: string
}

interface LiveEvent {
  id: string
  title: string
  creators: string[]
  viewers: number
  startsIn?: string
  banner: string
}

interface UpcomingEvent {
  id: string
  title: string
  date: string
  location: string
  cta: 'M'inscrire' | 'Rappeler'
  image: string
}

const STORIES: Story[] = [
  { id: 'me', label: 'Ma Story', type: 'story', thumbnail: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop', media: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop' },
  { id: 'atelier', label: 'Atelier Diorane', type: 'live', thumbnail: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop', media: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop' },
  { id: 'defile', label: 'Défilé Dakar 2024', type: 'story', thumbnail: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop', media: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop' },
]

const LIVE_FEATURED: LiveEvent = {
  id: 'live-1',
  title: 'Défilé Dakar • Capsule Or & Soie',
  creators: ['Maison Saliou', 'Atelier Diorane', 'Fatou Cissé'],
  viewers: 1284,
  startsIn: '00:12:45',
  banner: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=400&fit=crop',
}

const UPCOMING: UpcomingEvent[] = [
  {
    id: 'event-1',
    title: 'Soirée Wax Royale',
    date: '12 Jan • 20:00',
    location: 'Dakar • Corniche Ouest',
    cta: 'M'inscrire',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=400&fit=crop',
  },
  {
    id: 'event-2',
    title: 'Atelier Broderie Luxe',
    date: '18 Jan • 15:00',
    location: 'Saint-Louis • Atelier Téranga',
    cta: 'Rappeler',
    image: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=600&h=400&fit=crop',
  },
  {
    id: 'event-3',
    title: 'Masterclass Soie & Or',
    date: '26 Jan • 10:00',
    location: 'Abidjan • Plateau',
    cta: 'M'inscrire',
    image: 'https://images.unsplash.com/photo-1542293787938-4d22170c3b99?w=600&h=400&fit=crop',
  },
]

const reactions = ['✨', '🔥', '😍', '👏', '❤️']

export default function EventsScreen() {
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)
  const [savedBookmark, setSavedBookmark] = useState(false)
  const [commentSheetOpen, setCommentSheetOpen] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [comments, setComments] = useState<Record<string, StoryComment[]>>({
    me: [{ id: 'c1', author: 'Aïssatou', text: 'Tellement élégant, j'adore !', timestamp: 'il y a 5 min' }],
    atelier: [{ id: 'c2', author: 'Moussa', text: 'Les broderies sont folles 🔥', timestamp: 'il y a 2 min' }],
    defile: [{ id: 'c3', author: 'Khadija', text: 'On dirait un vrai runway Paris-Dakar.', timestamp: 'il y a 10 min' }],
  })

  const activeStory = STORIES.find((s) => s.id === activeStoryId) ?? null

  const openStory = (id: string) => {
    setActiveStoryId(id)
    setProgress(0)
    setSelectedReaction(null)
    setSavedBookmark(false)
    setCommentSheetOpen(false)
  }

  const closeStory = () => {
    setActiveStoryId(null)
    setProgress(0)
    setSelectedReaction(null)
    setSavedBookmark(false)
    setCommentSheetOpen(false)
  }

  const goNextStory = () => {
    if (!activeStoryId) return
    const idx = STORIES.findIndex((s) => s.id === activeStoryId)
    const next = STORIES[(idx + 1) % STORIES.length]
    setActiveStoryId(next.id)
    setProgress(0)
    setSelectedReaction(null)
    setSavedBookmark(false)
    setCommentSheetOpen(false)
  }

  const goPrevStory = () => {
    if (!activeStoryId) return
    const idx = STORIES.findIndex((s) => s.id === activeStoryId)
    const prev = STORIES[(idx - 1 + STORIES.length) % STORIES.length]
    setActiveStoryId(prev.id)
    setProgress(0)
    setSelectedReaction(null)
    setSavedBookmark(false)
    setCommentSheetOpen(false)
  }

  const handleSendComment = () => {
    if (!activeStoryId) return
    const text = commentDraft.trim()
    if (!text) return
    const newComment: StoryComment = {
      id: `local-${Date.now()}`,
      author: 'Vous',
      text,
      timestamp: 'à l'instant',
    }
    setComments((prev) => ({
      ...prev,
      [activeStoryId]: [newComment, ...(prev[activeStoryId] ?? [])],
    }))
    setCommentDraft('')
  }

  useEffect(() => {
    if (!activeStoryId) return
    setProgress(0)
    const totalMs = 5500
    const step = 55
    const increment = 100 / (totalMs / step)
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = p + increment
        if (next >= 100) {
          clearInterval(timer)
          goNextStory()
        }
        return next
      })
    }, step)
    return () => clearInterval(timer)
  }, [activeStoryId])

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ticket color={colors.noir} size={20} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Events</Text>
              <Text style={styles.headerSubtitle}>Lives & Défilés</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Sparkles color={colors.or30} size={16} />
            <Text style={styles.headerMode}>Mode Dakar</Text>
          </View>
        </View>

        {/* Stories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stories & Lives</Text>
            <Text style={styles.sectionHint}>Swipe →</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesContainer}>
            {STORIES.map((story) => (
              <TouchableOpacity key={story.id} onPress={() => openStory(story.id)} style={styles.storyItem}>
                <View style={[styles.storyCircle, story.type === 'live' && styles.storyCircleLive]}>
                  <Image source={{ uri: story.thumbnail }} style={styles.storyThumbnail} />
                  {story.type === 'live' && (
                    <View style={styles.liveBadge}>
                      <Text style={styles.liveBadgeText}>Live</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.storyLabel} numberOfLines={2}>
                  {story.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Live Featured */}
        <View style={styles.section}>
          <View style={styles.liveCard}>
            <Image source={{ uri: LIVE_FEATURED.banner }} style={styles.liveBanner} />
            <View style={styles.liveOverlay} />
            <View style={styles.liveContent}>
              <View style={styles.liveBadges}>
                <View style={styles.liveBadgeMain}>
                  <Radio color={colors.noir} size={12} />
                  <Text style={styles.liveBadgeMainText}>Live</Text>
                </View>
                {LIVE_FEATURED.startsIn && (
                  <View style={styles.liveBadgeTime}>
                    <Clock3 color="rgba(255,255,255,0.8)" size={12} />
                    <Text style={styles.liveBadgeTimeText}>{LIVE_FEATURED.startsIn}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.liveTitle}>{LIVE_FEATURED.title}</Text>
              <Text style={styles.liveCreators}>
                Créateurs : {LIVE_FEATURED.creators.join(' • ')}
              </Text>
              <View style={styles.liveStats}>
                <View style={styles.liveStat}>
                  <Users color="rgba(255,255,255,0.8)" size={14} />
                  <Text style={styles.liveStatText}>{LIVE_FEATURED.viewers.toLocaleString()} spectateurs</Text>
                </View>
                <View style={[styles.liveStat, styles.liveStatGold]}>
                  <Sparkles color={colors.or} size={14} />
                  <Text style={styles.liveStatTextGold}>Mode Luxe</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.liveButton}>
                <PlayCircle color={colors.noir} size={16} />
                <Text style={styles.liveButtonText}>Rejoindre le Live</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Réactions */}
          <View style={styles.reactionsContainer}>
            <Text style={styles.reactionsLabel}>Réactions</Text>
            <View style={styles.reactionsList}>
              {reactions.map((emoji) => (
                <TouchableOpacity key={emoji} style={styles.reactionButton}>
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Événements à venir */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Événements à venir</Text>
          <View style={styles.eventsList}>
            {UPCOMING.map((ev) => (
              <TouchableOpacity key={ev.id} style={styles.eventCard}>
                <Image source={{ uri: ev.image }} style={styles.eventImage} />
                <View style={styles.eventContent}>
                  <View style={styles.eventDate}>
                    <Clock3 color={colors.or30} size={12} />
                    <Text style={styles.eventDateText}>{ev.date}</Text>
                  </View>
                  <Text style={styles.eventTitle}>{ev.title}</Text>
                  <View style={styles.eventLocation}>
                    <MapPin color="rgba(255,255,255,0.5)" size={12} />
                    <Text style={styles.eventLocationText}>{ev.location}</Text>
                  </View>
                  <View style={styles.eventFooter}>
                    <TouchableOpacity style={styles.eventButton}>
                      <Text style={styles.eventButtonText}>{ev.cta}</Text>
                    </TouchableOpacity>
                    <ArrowRight color="rgba(255,255,255,0.3)" size={16} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Story Viewer Modal */}
      <Modal visible={activeStory !== null} transparent animationType="fade" onRequestClose={closeStory}>
        <View style={styles.storyModal}>
          <TouchableOpacity style={styles.storyModalBackdrop} activeOpacity={1} onPress={closeStory} />
          {activeStory && (
            <View style={styles.storyViewer}>
              <View style={styles.storyViewerHeader}>
                <View style={styles.storyViewerUser}>
                  <Image source={{ uri: activeStory.thumbnail }} style={styles.storyViewerAvatar} />
                  <View>
                    <Text style={styles.storyViewerName}>{activeStory.label}</Text>
                    <Text style={styles.storyViewerType}>
                      {activeStory.type === 'live' ? 'Live en cours' : 'Story'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={closeStory}>
                  <X color="rgba(255,255,255,0.6)" size={20} />
                </TouchableOpacity>
              </View>
              <View style={styles.storyProgressBar}>
                <View style={[styles.storyProgress, { width: `${Math.min(progress, 100)}%` }]} />
              </View>
              <View style={styles.storyMediaContainer}>
                <Image source={{ uri: activeStory.media ?? activeStory.thumbnail }} style={styles.storyMedia} />
                {activeStory.type === 'live' && (
                  <View style={styles.storyLiveBadge}>
                    <Text style={styles.storyLiveBadgeText}>Live</Text>
                  </View>
                )}
                <View style={styles.storyNav}>
                  <TouchableOpacity style={styles.storyNavButton} onPress={goPrevStory} />
                  <TouchableOpacity style={styles.storyNavButton} onPress={goNextStory} />
                </View>
              </View>
              <View style={styles.storyActions}>
                {[
                  { icon: Heart, id: 'heart' },
                  { icon: Laugh, id: 'laugh' },
                  { icon: Star, id: 'star' },
                  { icon: Bookmark, id: 'save' },
                ].map(({ icon: Icon, id }) => {
                  const isActive = id === 'save' ? savedBookmark : selectedReaction === id
                  return (
                    <TouchableOpacity
                      key={id}
                      onPress={() => {
                        if (id === 'save') {
                          setSavedBookmark(!savedBookmark)
                        } else {
                          setSelectedReaction(id)
                        }
                      }}
                      style={[styles.storyActionButton, isActive && styles.storyActionButtonActive]}
                    >
                      <Icon color={isActive ? colors.noir : colors.or} size={18} />
                    </TouchableOpacity>
                  )
                })}
                <TouchableOpacity
                  onPress={() => setCommentSheetOpen(true)}
                  style={styles.storyActionButton}
                >
                  <MessageSquare color={colors.or} size={18} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Comment Sheet Modal */}
      <Modal visible={commentSheetOpen} transparent animationType="slide" onRequestClose={() => setCommentSheetOpen(false)}>
        <View style={styles.commentModal}>
          <TouchableOpacity style={styles.commentModalBackdrop} activeOpacity={1} onPress={() => setCommentSheetOpen(false)} />
          <View style={styles.commentSheet}>
            <View style={styles.commentSheetHeader}>
              <View style={styles.commentSheetUser}>
                <Image source={{ uri: activeStory?.thumbnail }} style={styles.commentSheetAvatar} />
                <View>
                  <Text style={styles.commentSheetName}>{activeStory?.label}</Text>
                  <Text style={styles.commentSheetLabel}>Commentaires</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setCommentSheetOpen(false)}>
                <Text style={styles.commentSheetClose}>Fermer</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
              {(activeStory && (comments[activeStory.id] ?? [])).map((c) => (
                <View key={c.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{c.author}</Text>
                    <Text style={styles.commentTime}>{c.timestamp}</Text>
                  </View>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                value={commentDraft}
                onChangeText={setCommentDraft}
                placeholder="Ajouter un commentaire…"
                placeholderTextColor="rgba(255,255,255,0.4)"
                multiline
              />
              <TouchableOpacity onPress={handleSendComment} style={styles.commentSendButton} disabled={!commentDraft.trim()}>
                <Text style={styles.commentSendButtonText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
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
    fontSize: 18,
    fontFamily: 'serif',
    color: colors.or,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerMode: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'serif',
    color: colors.or,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionHint: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  storiesContainer: {
    gap: 16,
    paddingRight: 16,
  },
  storyItem: {
    alignItems: 'center',
    gap: 8,
    minWidth: 72,
  },
  storyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.or20,
    padding: 2,
    overflow: 'hidden',
  },
  storyCircleLive: {
    borderColor: colors.or,
  },
  storyThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  liveBadge: {
    position: 'absolute',
    bottom: 2,
    left: '50%',
    transform: [{ translateX: -20 }],
    backgroundColor: colors.or,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.noir,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  storyLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
    textAlign: 'center',
    width: 64,
  },
  liveCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.or20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 12,
  },
  liveBanner: {
    width: '100%',
    height: 280,
  },
  liveOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(10,10,10,0.85)',
  },
  liveContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    gap: 12,
  },
  liveBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  liveBadgeMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.or,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveBadgeMainText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.noir,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  liveBadgeTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveBadgeTimeText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
  },
  liveTitle: {
    fontSize: 20,
    fontFamily: 'serif',
    color: colors.blanc,
    fontWeight: 'bold',
  },
  liveCreators: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  liveStats: {
    flexDirection: 'row',
    gap: 8,
  },
  liveStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  liveStatGold: {
    backgroundColor: colors.or20,
    borderColor: colors.or30,
  },
  liveStatText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  liveStatTextGold: {
    fontSize: 11,
    color: colors.or,
  },
  liveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.or,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  liveButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.noir,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reactionsLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  reactionsList: {
    flexDirection: 'row',
    gap: 8,
  },
  reactionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.or20,
    borderWidth: 1,
    borderColor: colors.or30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: {
    fontSize: 18,
  },
  eventsList: {
    gap: 16,
    marginTop: 12,
  },
  eventCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  eventImage: {
    width: 96,
    height: 96,
    borderRadius: 8,
  },
  eventContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  eventDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eventDateText: {
    fontSize: 10,
    color: colors.or30,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.blanc,
    marginBottom: 4,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  eventLocationText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventButton: {
    backgroundColor: colors.or,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  eventButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.noir,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  storyModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  storyModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  storyViewer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  storyViewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    marginBottom: 12,
  },
  storyViewerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storyViewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.or20,
  },
  storyViewerName: {
    fontSize: 13,
    fontFamily: 'serif',
    color: colors.blanc,
  },
  storyViewerType: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  storyProgressBar: {
    width: '100%',
    maxWidth: 320,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  storyProgress: {
    height: '100%',
    backgroundColor: colors.or,
  },
  storyMediaContainer: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 9 / 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.or20,
    marginBottom: 12,
  },
  storyMedia: {
    width: '100%',
    height: '100%',
  },
  storyLiveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.or,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  storyLiveBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.noir,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  storyNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  storyNavButton: {
    flex: 1,
  },
  storyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  storyActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.or30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyActionButtonActive: {
    backgroundColor: colors.or,
    borderColor: colors.or,
  },
  commentModal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  commentModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  commentSheet: {
    backgroundColor: colors.noir,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: colors.or30,
    padding: 16,
    maxHeight: '70%',
  },
  commentSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  commentSheetUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  commentSheetAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.or20,
  },
  commentSheetName: {
    fontSize: 13,
    fontFamily: 'serif',
    color: colors.blanc,
  },
  commentSheetLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  commentSheetClose: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  commentsList: {
    maxHeight: 240,
    marginBottom: 12,
  },
  commentItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.or20,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  commentTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  commentText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.or20,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.blanc,
    fontSize: 12,
    maxHeight: 80,
  },
  commentSendButton: {
    backgroundColor: colors.or,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  commentSendButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.noir,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
})
