import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import PostCard from '../components/PostCard'
import { colors } from '../theme/colors'

// Types pour les posts
type PostType = 'tailor' | 'client'

interface Post {
  id: number
  type: PostType
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

const mockPosts: Post[] = [
  {
    id: 0,
    type: 'client',
    user: {
      name: 'Vous',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RepostDemo',
      isVerified: false,
      role: 'Repost',
    },
    repostOfId: 1,
    repostedByMe: true,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop',
    caption: 'Boubou Royale en basin riche. Un travail de broderie de plus de 40 heures. ✨🇸🇳',
    likes: 0,
    comments: 0,
    reposts: 1,
    isLiked: false,
    isSaved: false,
    isReposted: true,
    taggedTailor: {
      name: 'Atelier Fatou',
      id: 'tailor-fatou',
    },
    garment_type: 'Boubou',
    quote_comment: '🔥 À voir absolument — finitions dignes d'un défilé.',
    quote_media: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1200&fit=crop',
  },
  {
    id: 1,
    type: 'tailor',
    user: {
      name: 'Atelier Fatou',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
      isVerified: true,
      role: 'Maître Tailleur',
      specialty: 'Spécialiste Basin Riche & Broderie Royale',
    },
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop',
    caption: 'Boubou Royale en basin riche. Un travail de broderie de plus de 40 heures. ✨🇸🇳',
    price: '125 000 FCFA',
    likes: 856,
    comments: 45,
    isLiked: false,
    isSaved: false,
    garment_type: 'Boubou',
  },
  {
    id: 2,
    type: 'client',
    user: {
      name: 'Mariama Diallo',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariama',
      isVerified: false,
      role: 'Passionnée de Mode',
    },
    taggedTailor: {
      name: 'Maison Ndèye',
      id: 'tailor-ndeye',
    },
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1000&fit=crop',
    caption: 'Tellement satisfaite de ma tenue pour le mariage de ma sœur ! 😍👜',
    likes: 1243,
    comments: 89,
    isLiked: true,
    isSaved: true,
    garment_type: 'Robe Wax',
  },
  {
    id: 3,
    type: 'tailor',
    user: {
      name: 'Couture Aminata',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata',
      isVerified: true,
      role: 'Designer Mode',
      specialty: 'Prêt-à-porter de luxe & Wax contemporain',
    },
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop',
    caption: 'Collection capsule : Le lin rencontre le wax. L\'élégance au quotidien. 🌿✨',
    price: '55 000 FCFA',
    likes: 432,
    comments: 24,
    isLiked: false,
    isSaved: false,
    garment_type: 'Ensemble Tailleur',
  },
  {
    id: 4,
    type: 'client',
    user: {
      name: 'Khadija Sy',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khadija',
      isVerified: true,
      role: 'Influenceuse SIGNARE',
    },
    taggedTailor: {
      name: 'Atelier Fatou',
      id: 'tailor-fatou',
    },
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop',
    caption: 'Le chic sénégalais dans toute sa splendeur. Toujours fidèle à mon tailleur préféré. ✨🇸🇳',
    likes: 3567,
    comments: 156,
    isLiked: false,
    isSaved: true,
    garment_type: 'Kaftan de Soirée',
  },
]

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [refreshing, setRefreshing] = useState(false)

  const handleLike = (id: number) => {
    // TODO: Implémenter avec Supabase
    console.log('Like post:', id)
    // ML tracking pour recommandations
  }

  const handleSave = (id: number) => {
    // TODO: Implémenter avec Supabase
    console.log('Save post:', id)
  }

  const handleRepost = (id: number) => {
    // TODO: Implémenter avec Supabase
    console.log('Repost:', id)
  }

  const handleComment = (id: number) => {
    // TODO: Navigation vers écran de commentaires
    console.log('Comment on post:', id)
  }

  const onRefresh = () => {
    setRefreshing(true)
    // TODO: Recharger les posts depuis Supabase
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.or}
            colors={[colors.or]}
          />
        }
      >
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onSave={handleSave}
            onRepost={handleRepost}
            onComment={handleComment}
          />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
})
