'use client'

import { useState, useEffect } from 'react'

export interface CartItem {
  id: string
  productId: number
  title: string
  image: string
  price: number
  currency: string
  quantity: number
  seller?: {
    name: string
    avatar: string
  }
}

const CART_STORAGE_KEY = 'signare_cart'

// Données mockées pour l'évaluation
const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: 'mock-1',
    productId: 1,
    title: 'Boubou Royale Wax Premium',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop',
    price: 125000,
    currency: 'FCFA',
    quantity: 1,
    seller: {
      name: 'Maison Aïda Sow',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aida',
    },
  },
  {
    id: 'mock-2',
    productId: 2,
    title: 'Robe Wax Moderne',
    image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&h=1000&fit=crop',
    price: 75000,
    currency: 'FCFA',
    quantity: 1,
    seller: {
      name: 'Atelier Fatou',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
    },
  },
  {
    id: 'mock-3',
    productId: 3,
    title: 'Ensemble Kaftan Soie',
    image: 'https://images.unsplash.com/photo-1520975892776-3f7c5b37c5b2?w=800&h=1000&fit=crop',
    price: 180000,
    currency: 'FCFA',
    quantity: 1,
    seller: {
      name: 'Awa Ndiaye',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Awa',
    },
  },
]

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    // Vérifier que localStorage est disponible (côté client)
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }
    
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Si le panier existe mais est vide, utiliser les données mockées
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed)
        } else {
          // Initialiser avec les données mockées si le panier est vide
          setCartItems(MOCK_CART_ITEMS)
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(MOCK_CART_ITEMS))
        }
      } else {
        // Pas de panier sauvegardé, utiliser les données mockées
        setCartItems(MOCK_CART_ITEMS)
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(MOCK_CART_ITEMS))
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error)
      // En cas d'erreur, utiliser les données mockées
      setCartItems(MOCK_CART_ITEMS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du panier:', error)
      }
    }
  }, [cartItems, isLoading])

  const addToCart = (item: Omit<CartItem, 'id' | 'quantity'>) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId)
      if (existing) {
        // Augmenter la quantité si l'item existe déjà
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      // Ajouter un nouvel item
      return [
        ...prev,
        {
          ...item,
          id: `${item.productId}-${Date.now()}`,
          quantity: 1,
        },
      ]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return {
    cartItems,
    totalItems,
    totalPrice,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  }
}

