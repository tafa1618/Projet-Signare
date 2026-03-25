import { Post } from '@/app/page';

export interface Reel {
  id: number
  user: { name: string; avatar: string; role: string; isVerified: boolean }
  mediaUrl: string
  mediaType: 'image' | 'video'
  caption: string
  garment_type: string
  fabric_type?: string
  duration: number
  likes: number
  isSeen: boolean
}

export const mockReels: Reel[] = [
  {
    id: 1,
    user: { name: 'Atelier Fatou', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&q=80', role: 'Tailleur', isVerified: true },
    mediaUrl: 'https://images.unsplash.com/photo-1594938291221-94f18dd5e26c?w=600&h=900&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Boubou Royale — broderie 40h, basin riche exclusif. Nouvelle collection Tabaski.',
    garment_type: 'Boubou',
    fabric_type: 'Basin Riche',
    duration: 6,
    likes: 1204,
    isSeen: false,
  },
  {
    id: 2,
    user: { name: 'Mariama D.', avatar: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&h=100&fit=crop&q=80', role: 'Look', isVerified: false },
    mediaUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=900&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Ma tenue de mariage par @MaisonNdèye. La coupe est juste parfaite.',
    garment_type: 'Robe Wax',
    duration: 5,
    likes: 873,
    isSeen: false,
  },
  {
    id: 3,
    user: { name: 'Atelier Téranga', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80', role: 'Tailleur', isVerified: true },
    mediaUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=900&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Kaftan soie premium — lumière, fluidité, détails couture. Disponible sur commande.',
    garment_type: 'Kaftan',
    fabric_type: 'Soie',
    duration: 7,
    likes: 2310,
    isSeen: false,
  },
  {
    id: 4,
    user: { name: 'Khadija Sy', avatar: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=100&h=100&fit=crop&q=80', role: 'Look', isVerified: true },
    mediaUrl: 'https://images.unsplash.com/photo-1620655474668-c11ad124c6fc?w=600&h=900&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Le chic sénégalais au quotidien. Toujours fidèle à @AtelierFatou.',
    garment_type: 'Kaftan de Soirée',
    duration: 4,
    likes: 3567,
    isSeen: true,
  },
  {
    id: 5,
    user: { name: 'Maison Ndèye', avatar: 'https://images.unsplash.com/photo-1589571894960-20bbe2815d22?w=100&h=100&fit=crop&q=80', role: 'Tailleur', isVerified: true },
    mediaUrl: 'https://images.unsplash.com/photo-1607525357879-11ba1886cb4f?w=600&h=900&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Robe wax couture — tombé parfait, finitions main. Ceinture signature.',
    garment_type: 'Robe Wax',
    fabric_type: 'Wax Premium',
    duration: 5,
    likes: 918,
    isSeen: true,
  },
  {
    id: 6,
    user: { name: 'Awa Ndiaye', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80', role: 'Look', isVerified: false },
    mediaUrl: 'https://images.unsplash.com/photo-1548142340-97e3cb7d206c?w=600&h=900&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Tenue Tabaski. Broderies fines, coupe impeccable. Merci @CoutureAminata.',
    garment_type: 'Boubou',
    duration: 4,
    likes: 654,
    isSeen: false,
  },
  {
    id: 7,
    user: { name: 'Elegant Coutures', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80', role: 'Tailleur', isVerified: true },
    mediaUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=900&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Collection Mariage. Chaque perle posée à la main. Pour le plus beau jour.',
    garment_type: 'Robe de Mariée',
    fabric_type: 'Dentelle & Soie',
    duration: 6,
    likes: 2891,
    isSeen: false,
  },
  {
    id: 8,
    user: { name: 'Studio Dakar Luxe', avatar: 'https://images.unsplash.com/photo-1522512115668-c09775d6f424?w=100&h=100&fit=crop&q=80', role: 'Tailleur', isVerified: true },
    mediaUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=900&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Ensemble lin texturé — coupe moderne, détails discrets en or. Le luxe au masculin.',
    garment_type: 'Ensemble',
    fabric_type: 'Lin',
    duration: 5,
    likes: 740,
    isSeen: false,
  },
]

export const mockPosts: Post[] = [
  {
    id: 1,
    type: 'tailor',
    user: {
      name: 'Atelier Fatou',
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&q=80',
      isVerified: true,
      role: 'Maître Tailleur',
      specialty: 'Spécialiste Basin Riche & Broderie Royale',
    },
    image: 'https://images.unsplash.com/photo-1594938291221-94f18dd5e26c?w=900&h=1200&fit=crop&q=80',
    media: [
      { url: 'https://images.unsplash.com/photo-1594938291221-94f18dd5e26c?w=900&h=1200&fit=crop&q=80', type: 'image' },
      { url: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=900&h=1200&fit=crop&q=80', type: 'image' }
    ],
    caption: 'Boubou Royale en basin riche. Un travail de broderie de plus de 40 heures pour ce modèle unique. ✨🇸🇳 #ModeSenegal #Luxe',
    price: '125 000 FCFA',
    likes: 856,
    comments: 45,
    reposts: 12,
    isLiked: false,
    isSaved: false,
    garment_type: 'Boubou',
    fabric_type: 'Basin Riche',
    complexity_score: 5,
    quality_rating: 5
  },
  {
    id: 2,
    type: 'client',
    user: {
      name: 'Mariama Diallo',
      avatar: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&h=100&fit=crop&q=80',
      isVerified: false,
      role: 'Passionnée de Mode',
    },
    taggedTailor: {
      name: 'Maison Ndèye',
      id: 'tailor-ndeye',
    },
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&h=1200&fit=crop&q=80',
    media: [
       { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&h=1200&fit=crop&q=80', type: 'image' }
    ],
    caption: 'Tellement satisfaite de ma tenue pour le mariage de ma sœur ! La coupe est juste parfaite. 😍👜 Merci @MaisonNdèye',
    likes: 1243,
    comments: 89,
    reposts: 5,
    isLiked: true,
    isSaved: true,
    garment_type: 'Robe Wax',
    quality_rating: 5,
  },
  {
    id: 3,
    type: 'tailor',
    user: {
      name: 'Couture Aminata',
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&q=80',
      isVerified: true,
      role: 'Designer Mode',
      specialty: 'Prêt-à-porter de luxe & Wax contemporain',
    },
    image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=900&h=1200&fit=crop&q=80',
    media: [
        { url: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=900&h=1200&fit=crop&q=80', type: 'image' },
        { url: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=900&h=1200&fit=crop&q=80', type: 'image' }
    ],
    caption: 'Collection capsule : Le lin rencontre le wax. L\'élégance au quotidien, pour la femme moderne. 🌿✨ Disponible en 3 coloris.',
    price: '55 000 FCFA',
    likes: 432,
    comments: 24,
    reposts: 8,
    isLiked: false,
    isSaved: false,
    garment_type: 'Ensemble Tailleur',
    fabric_type: 'Lin & Wax',
    complexity_score: 4,
    quality_rating: 5
  },
  {
    id: 4,
    type: 'client',
    user: {
      name: 'Khadija Sy',
      avatar: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=100&h=100&fit=crop&q=80',
      isVerified: true,
      role: 'Influenceuse SIGNARE',
    },
    taggedTailor: {
      name: 'Atelier Fatou',
      id: 'tailor-fatou',
    },
    image: 'https://images.unsplash.com/photo-1620655474668-c11ad124c6fc?w=900&h=1200&fit=crop&q=80',
    media: [
        { url: 'https://images.unsplash.com/photo-1620655474668-c11ad124c6fc?w=900&h=1200&fit=crop&q=80', type: 'image' }
    ],
    caption: 'Le chic sénégalais dans toute sa splendeur. Toujours fidèle à mon tailleur préféré @AtelierFatou pour les grands événements. ✨🇸🇳',
    likes: 3567,
    comments: 156,
    reposts: 42,
    isLiked: false,
    isSaved: true,
    garment_type: 'Kaftan de Soirée',
    quality_rating: 5,
  },
  {
    id: 5,
    type: 'tailor',
    user: {
      name: 'Maison Ndèye',
      avatar: 'https://images.unsplash.com/photo-1589571894960-20bbe2815d22?w=100&h=100&fit=crop&q=80',
      isVerified: true,
      role: 'Atelier Vérifié',
      specialty: 'Wax Premium & Coupe Ajustée',
    },
    image: 'https://images.unsplash.com/photo-1607525357879-11ba1886cb4f?w=900&h=1200&fit=crop&q=80',
    media: [
        { url: 'https://images.unsplash.com/photo-1607525357879-11ba1886cb4f?w=900&h=1200&fit=crop&q=80', type: 'image' }
    ],
    caption: 'Robe wax couture : tombé parfait, finitions main et ceinture signature. Élégance sobre pour vos sorties. ✨',
    price: '75 000 FCFA',
    likes: 642,
    comments: 31,
    reposts: 15,
    isLiked: false,
    isSaved: false,
    garment_type: 'Robe Wax',
    fabric_type: 'Wax Premium',
    complexity_score: 4,
    quality_rating: 5
  },
  {
    id: 6,
    type: 'client',
    user: {
      name: 'Awa Ndiaye',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80',
      isVerified: false,
      role: 'Membre SIGNARE',
    },
    taggedTailor: {
      name: 'Couture Aminata',
      id: 'tailor-aminata',
    },
    image: 'https://images.unsplash.com/photo-1548142340-97e3cb7d206c?w=900&h=1200&fit=crop&q=80',
    media: [
        { url: 'https://images.unsplash.com/photo-1548142340-97e3cb7d206c?w=900&h=1200&fit=crop&q=80', type: 'image' }
    ],
    caption: 'Tenue parfaite pour la Tabaski. Broderies fines, coupe impeccable. Merci ! 🇸🇳',
    likes: 982,
    comments: 64,
    reposts: 3,
    isLiked: false,
    isSaved: true,
    garment_type: 'Boubou',
    quality_rating: 5,
  },
  {
    id: 7,
    type: 'tailor',
    user: {
      name: 'Atelier Téranga',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
      isVerified: true,
      role: 'Maître Tailleur',
      specialty: 'Kaftans premium & Soie',
    },
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&h=1200&fit=crop&q=80',
     media: [
        { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&h=1200&fit=crop&q=80', type: 'image' }
    ],
    caption: 'Kaftan de soirée en soie : lumière, fluidité, détails couture. Une pièce premium pour celles qui osent briller. ✨',
    price: '98 000 FCFA',
    likes: 1240,
    comments: 77,
    reposts: 28,
    isLiked: true,
    isSaved: false,
    garment_type: 'Kaftan',
    fabric_type: 'Soie',
    complexity_score: 4,
    quality_rating: 5
  },
  {
    id: 8,
    type: 'client',
    user: {
      name: 'Sokhna Fall',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop&q=80',
      isVerified: true,
      role: 'Membre SIGNARE',
    },
    taggedTailor: {
      name: 'Atelier Fatou',
      id: 'tailor-fatou',
    },
    image: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=900&h=1200&fit=crop&q=80',
     media: [
        { url: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=900&h=1200&fit=crop&q=80', type: 'image' }
    ],
    caption: 'Minimaliste mais royal. Le tissu est incroyable et les finitions sont nettes. Un investissement qui vaut le coup.',
    likes: 2103,
    comments: 102,
    reposts: 10,
    isLiked: false,
    isSaved: false,
    garment_type: 'Ensemble',
    quality_rating: 4,
  },
  {
    id: 9,
    type: 'tailor',
    user: {
      name: 'Studio Dakar Luxe',
      avatar: 'https://images.unsplash.com/photo-1522512115668-c09775d6f424?w=100&h=100&fit=crop&q=80',
      isVerified: true,
      role: 'Designer Mode',
      specialty: 'Prêt-à-porter luxe & Lin',
    },
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=900&h=1200&fit=crop&q=80',
     media: [
        { url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=900&h=1200&fit=crop&q=80', type: 'image' }
    ],
    caption: 'Ensemble en lin texturé : coupe moderne, confort premium, détails discrets en or. Le luxe au masculin.',
    price: '55 000 FCFA',
    likes: 518,
    comments: 22,
    reposts: 7,
    isLiked: false,
    isSaved: true,
    garment_type: 'Ensemble',
    fabric_type: 'Lin',
    complexity_score: 3,
    quality_rating: 5
  },
  {
    id: 10,
    type: 'client',
    user: {
      name: 'Fatou Dia',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&q=80',
      isVerified: false,
      role: 'Membre SIGNARE',
    },
    taggedTailor: {
      name: 'Maison Ndèye',
      id: 'tailor-ndeye',
    },
    image: 'https://images.unsplash.com/photo-1509319117116-308fa831de64?w=900&h=1200&fit=crop&q=80',
     media: [
        { url: 'https://images.unsplash.com/photo-1509319117116-308fa831de64?w=900&h=1200&fit=crop&q=80', type: 'image' }
    ],
    caption: 'Un look quotidien chic. J’adore le tombé et le confort. Parfait pour aller travailler.',
    likes: 721,
    comments: 38,
    reposts: 2,
    isLiked: false,
    isSaved: false,
    garment_type: 'Robe',
    quality_rating: 4,
  },
  {
    id: 11,
    type: 'tailor',
    user: {
      name: 'Elegant Coutures',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80',
      isVerified: true,
      role: 'Duo de Designers',
      specialty: 'Robes de Mariée & Soirée',
    },
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&h=1200&fit=crop&q=80',
    media: [
        { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&h=1200&fit=crop&q=80', type: 'image' }
    ],
    caption: 'Nouvelle collection Mariage. Chaque perle est posée à la main. Pour le plus beau jour de votre vie.',
    price: 'Sur Devis',
    likes: 1542,
    comments: 88,
    reposts: 55,
    isLiked: false,
    isSaved: true,
    garment_type: 'Robe de Mariée',
    fabric_type: 'Dentelle & Soie',
    complexity_score: 5,
    quality_rating: 5
  },
  {
    id: 12,
    type: 'client',
    user: {
      name: 'Ousmane Sow',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&q=80',
      isVerified: false,
      role: 'Client Satisfait',
    },
    taggedTailor: {
      name: 'Studio Dakar Luxe',
      id: 'tailor-dakar',
    },
    image: 'https://images.unsplash.com/photo-1504194921103-f8b80cadd5e4?w=900&h=1200&fit=crop&q=80',
    media: [
        { url: 'https://images.unsplash.com/photo-1504194921103-f8b80cadd5e4?w=900&h=1200&fit=crop&q=80', type: 'image' }
    ],
    caption: 'Tenue impeccable pour le gala. Merci pour la rapidité et le professionnalisme. 👌🏾',
    likes: 320,
    comments: 12,
    reposts: 0,
    isLiked: true,
    isSaved: false,
    garment_type: 'Costume 3 pièces',
    quality_rating: 5,
  }
];
