import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform } from 'react-native'
import { Search, Plus, MoreVertical, Send, Ruler, Sparkles, ChevronLeft, Scissors, Star, Phone, Video, Mic, Camera } from 'lucide-react-native'
import { colors } from '../theme/colors'

const { width } = Dimensions.get('window')

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
  type: 'text' | 'post_share' | 'measurements'
  status: 'sent' | 'delivered' | 'read'
  postData?: {
    image: string
    title: string
    price: string
  }
}

interface Conversation {
  id: string
  user: {
    name: string
    avatar: string
    role: 'client' | 'tailleur'
    rankLabel: string
    rating?: number
    isMasterTailor?: boolean
    status: 'online' | 'atelier' | 'offline'
  }
  lastMessage: string
  unreadCount: number
  updatedAt: string
  messages: Message[]
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    user: {
      name: 'Atelier Fatou',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
      role: 'tailleur',
      rankLabel: 'Maître Tailleur',
      rating: 4.9,
      isMasterTailor: true,
      status: 'atelier',
    },
    lastMessage: 'Votre boubou sera prêt pour l\'essayage demain.',
    unreadCount: 2,
    updatedAt: '10:30',
    messages: [
      { id: 'm1', senderId: 'user-123', text: 'Bonjour Fatou, où en est ma commande ?', timestamp: '09:00', type: 'text', status: 'read' },
      { id: 'm2', senderId: 'conv-1', text: 'Bonjour ! J\'ai presque terminé les broderies.', timestamp: '09:15', type: 'text', status: 'read' },
      { id: 'm3', senderId: 'conv-1', text: 'Votre boubou sera prêt pour l\'essayage demain.', timestamp: '10:30', type: 'text', status: 'read' },
    ],
  },
  {
    id: 'conv-2',
    user: {
      name: 'Moussa Sy',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moussa',
      role: 'client',
      rankLabel: 'Client SIGNARE',
      status: 'online',
    },
    lastMessage: 'J\'aime beaucoup ce modèle en basin.',
    unreadCount: 0,
    updatedAt: 'Hier',
    messages: [
      {
        id: 'm4',
        senderId: 'conv-2',
        text: 'J\'aime beaucoup ce modèle en basin.',
        timestamp: 'Hier',
        type: 'post_share',
        status: 'read',
        postData: {
          image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&fit=crop',
          title: 'Boubou Royale Or',
          price: '125 000 FCFA',
        },
      },
    ],
  },
]

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating)
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={10}
          color={s <= rounded ? colors.or : 'rgba(255,255,255,0.2)'}
          fill={s <= rounded ? colors.or : 'transparent'}
        />
      ))}
    </View>
  )
}

export default function MessagesScreen() {
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [inputText, setInputText] = useState('')
  const [showQuickMenu, setShowQuickMenu] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS)
  const currentUserId = 'user-123'

  const quickActions = [
    { id: 'ref', label: 'Modèle de référence', icon: Sparkles },
    { id: 'mes', label: 'Fiche de mesures', icon: Ruler },
  ]

  const handleSend = () => {
    if (!inputText.trim() || !selectedConv) return

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      senderId: currentUserId,
      text: inputText,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      status: 'sent',
    }

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConv.id
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: inputText,
              updatedAt: 'Maintenant',
            }
          : conv
      )
    )

    setInputText('')
  }

  if (selectedConv) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header Chat */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedConv(null)} style={styles.backButton}>
            <ChevronLeft color={colors.or} size={24} />
          </TouchableOpacity>

          <View style={styles.chatHeaderUser}>
            <View
              style={[
                styles.chatAvatarContainer,
                selectedConv.user.isMasterTailor && styles.chatAvatarMaster,
              ]}
            >
              <Image source={{ uri: selectedConv.user.avatar }} style={styles.chatAvatar} />
            </View>
            <View style={styles.chatHeaderInfo}>
              <View style={styles.chatHeaderNameRow}>
                <Text style={styles.chatHeaderName}>{selectedConv.user.name}</Text>
                {selectedConv.user.status === 'atelier' && (
                  <Scissors color={colors.or} size={12} />
                )}
              </View>
              <View style={styles.chatHeaderMeta}>
                <Text style={styles.chatHeaderRank}>{selectedConv.user.rankLabel}</Text>
                {typeof selectedConv.user.rating === 'number' && (
                  <StarRating rating={selectedConv.user.rating} />
                )}
              </View>
            </View>
          </View>

          <View style={styles.chatHeaderActions}>
            <TouchableOpacity style={styles.callButton}>
              <Phone color={colors.or} size={14} />
              <Text style={styles.callButtonText}>Appel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callButton}>
              <Video color={colors.or} size={14} />
              <Text style={styles.callButtonText}>Vidéo</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <MoreVertical color="rgba(255,255,255,0.3)" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {selectedConv.messages.map((msg) => {
            const isMe = msg.senderId === currentUserId
            return (
              <View key={msg.id} style={[styles.messageWrapper, isMe && styles.messageWrapperRight]}>
                <View
                  style={[
                    styles.messageBubble,
                    isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
                  ]}
                >
                  {msg.type === 'post_share' && msg.postData ? (
                    <View style={styles.postShareContainer}>
                      <Text style={styles.postShareLabel}>Modèle de référence</Text>
                      <Image source={{ uri: msg.postData.image }} style={styles.postShareImage} />
                      <View style={styles.postShareInfo}>
                        <Text style={styles.postShareTitle}>{msg.postData.title}</Text>
                        <Text style={styles.postSharePrice}>{msg.postData.price}</Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.messageText}>{msg.text}</Text>
                  )}
                </View>
              </View>
            )
          })}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity
              onPress={() => setShowQuickMenu(!showQuickMenu)}
              style={styles.inputIconButton}
            >
              <Plus color={colors.or30} size={18} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="VOTRE MESSAGE..."
              placeholderTextColor="rgba(255,255,255,0.15)"
              multiline
            />

            <TouchableOpacity style={styles.inputIconButton}>
              <Mic color="rgba(255,255,255,0.2)" size={18} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.inputIconButton}>
              <Camera color="rgba(255,255,255,0.2)" size={18} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Send color={colors.noir} size={18} />
            </TouchableOpacity>
          </View>

          {showQuickMenu && (
            <View style={styles.quickMenu}>
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <TouchableOpacity
                    key={action.id}
                    onPress={() => setShowQuickMenu(false)}
                    style={styles.quickMenuItem}
                  >
                    <Icon color={colors.or} size={16} />
                    <Text style={styles.quickMenuText}>{action.label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MESSAGES</Text>
        <TouchableOpacity>
          <Plus color={colors.or30} size={20} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search color={colors.or20} size={16} />
        <TextInput
          style={styles.searchInput}
          placeholder="RECHERCHER..."
          placeholderTextColor="rgba(255,255,255,0.2)"
        />
      </View>

      {/* Conversations List */}
      <ScrollView style={styles.conversationsList} showsVerticalScrollIndicator={false}>
        {conversations.map((conv) => (
          <TouchableOpacity
            key={conv.id}
            onPress={() => setSelectedConv(conv)}
            style={styles.conversationItem}
          >
            <View
              style={[
                styles.conversationAvatarContainer,
                conv.user.isMasterTailor && styles.conversationAvatarMaster,
              ]}
            >
              <Image source={{ uri: conv.user.avatar }} style={styles.conversationAvatar} />
            </View>

            <View style={styles.conversationContent}>
              <View style={styles.conversationHeader}>
                <View style={styles.conversationNameContainer}>
                  <Text style={styles.conversationName}>{conv.user.name}</Text>
                  <Text style={styles.conversationRank}>{conv.user.rankLabel}</Text>
                </View>
                <Text style={styles.conversationTime}>{conv.updatedAt}</Text>
              </View>
              <View style={styles.conversationFooter}>
                <Text style={styles.conversationLastMessage} numberOfLines={1}>
                  {conv.lastMessage}
                </Text>
                {conv.unreadCount > 0 && <View style={styles.unreadBadge} />}
              </View>
              {typeof conv.user.rating === 'number' && (
                <View style={styles.conversationRating}>
                  <StarRating rating={conv.user.rating} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.or20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'serif',
    color: colors.or,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.or20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: colors.blanc,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  conversationAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 2,
  },
  conversationAvatarMaster: {
    borderColor: colors.or30,
  },
  conversationAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  conversationContent: {
    flex: 1,
    gap: 4,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  conversationNameContainer: {
    flex: 1,
  },
  conversationName: {
    fontSize: 14,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
  },
  conversationRank: {
    fontSize: 7,
    color: colors.or30,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  conversationTime: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  conversationLastMessage: {
    flex: 1,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.or,
  },
  conversationRating: {
    marginTop: 4,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.or20,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  chatHeaderUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  chatAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 1.5,
  },
  chatAvatarMaster: {
    borderColor: colors.or30,
  },
  chatAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatHeaderName: {
    fontSize: 12,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: colors.or,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  chatHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  chatHeaderRank: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  chatHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.or30,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  callButtonText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.or,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  messageWrapperRight: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  messageBubbleMe: {
    backgroundColor: '#141414',
    borderColor: 'rgba(255,255,255,0.1)',
    borderTopRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: colors.noir,
    borderColor: colors.or20,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  postShareContainer: {
    gap: 8,
  },
  postShareLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.or30,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  postShareImage: {
    width: '100%',
    aspectRatio: 4 / 5,
    maxHeight: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.or20,
  },
  postShareInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  postShareTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.blanc,
    flex: 1,
  },
  postSharePrice: {
    fontSize: 13,
    fontFamily: 'serif',
    color: colors.or,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.or20,
    backgroundColor: colors.noir,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },
  inputIconButton: {
    padding: 6,
  },
  input: {
    flex: 1,
    color: colors.blanc,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.or,
    padding: 8,
    borderRadius: 12,
  },
  quickMenu: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    width: 200,
    backgroundColor: colors.noir,
    borderWidth: 1,
    borderColor: colors.or20,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  quickMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  quickMenuText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
})
