import React, { useState } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { Heart, MessageSquare, Repeat2, Bookmark, CheckCircle2, Scissors } from 'lucide-react-native'
import { colors } from '../theme/colors'

const { width } = Dimensions.get('window')

interface PostCardProps {
  post: {
    id: number
    type: 'tailor' | 'client'
    user: {
      name: string
      avatar: string
      isVerified: boolean
      role: string
      specialty?: string
    }
    image: string
    caption: string
    price?: string
    likes: number
    comments: number
    reposts?: number
    isLiked: boolean
    isSaved: boolean
    isReposted?: boolean
    repostOfId?: number | null
    repostedByMe?: boolean
    taggedTailor?: {
      name: string
      id: string
    }
    garment_type: string
    quote_comment?: string | null
    quote_media?: string | null
  }
  onLike: (id: number) => void
  onSave: (id: number) => void
  onRepost: (id: number) => void
  onComment: (id: number) => void
}

export default function PostCard({ post, onLike, onSave, onRepost, onComment }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [isSaved, setIsSaved] = useState(post.isSaved)
  const [likes, setLikes] = useState(post.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
    onLike(post.id)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    onSave(post.id)
  }

  const handleRepost = () => {
    onRepost(post.repostOfId || post.id)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{post.user.name}</Text>
            {post.user.isVerified && <CheckCircle2 color={colors.or} size={14} />}
          </View>
          <Text style={styles.userRole}>{post.user.role}</Text>
        </View>
      </View>

      {/* Repost Block */}
      {post.repostOfId && (
        <View style={styles.repostBlock}>
          <Text style={styles.repostLabel}>
            REPUBLIÉ · <Text style={styles.repostBy}>par {post.user.name}</Text>
          </Text>
          {post.quote_comment && (
            <Text style={styles.quoteComment}>{post.quote_comment}</Text>
          )}
          {post.quote_media && (
            <Image source={{ uri: post.quote_media }} style={styles.quoteMedia} />
          )}
        </View>
      )}

      {/* Image */}
      <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <Heart 
            color={isLiked ? colors.or : 'rgba(255,255,255,0.5)'} 
            size={20} 
            fill={isLiked ? colors.or : 'transparent'}
          />
          <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
            {likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onComment(post.id)} style={styles.actionButton}>
          <MessageSquare color="rgba(255,255,255,0.5)" size={20} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRepost} style={styles.actionButton}>
          <Repeat2 
            color={post.isReposted ? colors.or : 'rgba(255,255,255,0.5)'} 
            size={20} 
          />
          <Text style={[styles.actionText, post.isReposted && styles.actionTextActive]}>
            {post.reposts || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
          <Bookmark 
            color={isSaved ? colors.or : 'rgba(255,255,255,0.5)'} 
            size={20} 
            fill={isSaved ? colors.or : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={styles.caption}>{post.caption}</Text>
        {post.taggedTailor && (
          <View style={styles.taggedContainer}>
            <Scissors color={colors.or30} size={12} />
            <Text style={styles.taggedText}>@{post.taggedTailor.name}</Text>
          </View>
        )}
        {post.price && (
          <Text style={styles.price}>{post.price}</Text>
        )}
        <Text style={styles.garmentType}>{post.garment_type}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.noir,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    color: colors.blanc,
    fontSize: 14,
    fontWeight: '600',
  },
  userRole: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 2,
  },
  repostBlock: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.or20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 8,
  },
  repostLabel: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.or,
    fontWeight: 'bold',
  },
  repostBy: {
    color: 'rgba(255,255,255,0.7)',
  },
  quoteComment: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
  },
  quoteMedia: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    marginTop: 8,
  },
  image: {
    width: width,
    height: width * 1.25, // Aspect ratio 4:5
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionTextActive: {
    color: colors.or,
  },
  captionContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 6,
  },
  caption: {
    color: colors.blanc,
    fontSize: 14,
    lineHeight: 20,
  },
  taggedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  taggedText: {
    color: colors.or,
    fontSize: 12,
  },
  price: {
    color: colors.or,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  garmentType: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
})

