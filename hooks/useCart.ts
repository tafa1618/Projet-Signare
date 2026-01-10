'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/frontend/hooks/useAuth'
import { logError } from '@/lib/logger'
import { handleFetchError, handleHTTPError, NetworkError, ServerError } from '@/lib/errors'

export interface CartItem {
  id: string
  productId: string | number // Accepte UUID (string) ou ID numérique (transition)
  title: string
  image: string
  price: number
  currency: string
  quantity: number
  seller?: {
    name: string
    avatar?: string
  }
}

const CART_STORAGE_KEY = 'signare_cart'
const USE_API_CART = true // Flag pour activer/désactiver l'API (transition)

// Données mockées pour l'évaluation (productId en string pour compatibilité UUID)
// TODO: Supprimer ces données mockées une fois l'intégration Supabase complète
const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: 'mock-1',
    productId: '00000000-0000-0000-0000-000000000001', // UUID mock
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
    productId: '00000000-0000-0000-0000-000000000002',
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
    productId: '00000000-0000-0000-0000-000000000003',
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
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ Charger le panier depuis API Supabase (avec fallback localStorage)
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true)
      setError(null)

      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      // Si l'API est activée et l'utilisateur est connecté, utiliser Supabase
      if (USE_API_CART && user?.id) {
        try {
          const response = await fetch('/api/cart', {
            headers: {
              'x-user-id': user.id, // TODO: Remplacer par vrai header auth
            },
          })

          if (!response.ok) {
            const error = await handleHTTPError(response, 'Cart load')
            throw error
          }

          const data = await response.json()
          
          // Mapper les données de l'API vers le format CartItem
          const items: CartItem[] = data.items.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            title: item.title,
            image: item.image_url,
            price: Number(item.price),
            currency: item.currency,
            quantity: item.quantity,
            seller: item.seller_name ? {
              name: item.seller_name,
              avatar: item.seller_avatar_url || undefined,
            } : undefined,
          }))

          setCartItems(items)
          
          // Sync avec localStorage pour transition (backup)
          if (typeof window !== 'undefined') {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
          }
        } catch (err) {
          const error = handleFetchError(err, 'Cart load')
          logError(error, 'Cart load')
          const userMessage = error instanceof Error && 'getUserMessage' in error
            ? (error as any).getUserMessage()
            : 'Erreur lors du chargement du panier'
          setError(userMessage)
          
          // Fallback : charger depuis localStorage
          try {
            const stored = localStorage.getItem(CART_STORAGE_KEY)
            if (stored) {
              const parsed = JSON.parse(stored)
              if (Array.isArray(parsed) && parsed.length > 0) {
                setCartItems(parsed)
              }
            }
          } catch (localErr) {
            // Ignore localStorage errors
          }
        } finally {
          setIsLoading(false)
        }
      } else {
        // Fallback : utiliser localStorage uniquement (utilisateur non connecté ou API désactivée)
        try {
          const stored = localStorage.getItem(CART_STORAGE_KEY)
          if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCartItems(parsed)
            }
          }
        } catch (err) {
          logError(err, 'Cart localStorage load')
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadCart()
  }, [user?.id])

  // ✅ Ajouter un item au panier (avec sync API si disponible)
  const addToCart = async (item: Omit<CartItem, 'id' | 'quantity'>) => {
    // Normaliser productId : convertir number en string (UUID temporaire) pour compatibilité
    // TODO: Une fois les produits migrés vers UUID, supprimer cette conversion
    const productIdStr = typeof item.productId === 'number' 
      ? `00000000-0000-0000-0000-${item.productId.toString().padStart(12, '0')}` // UUID temporaire
      : item.productId

    // Optimistic update local
    setCartItems((prev) => {
      const existing = prev.find((i) => 
        (typeof i.productId === 'number' && typeof item.productId === 'number' && i.productId === item.productId) ||
        (typeof i.productId === 'string' && typeof item.productId === 'string' && i.productId === item.productId) ||
        (i.productId.toString() === item.productId.toString())
      )
      if (existing) {
        return prev.map((i) =>
          (i.productId.toString() === item.productId.toString())
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [
        ...prev,
        {
          ...item,
          productId: productIdStr, // Utiliser la version normalisée
          id: `${productIdStr}-${Date.now()}`, // Temporaire, sera remplacé par UUID de l'API
          quantity: 1,
        },
      ]
    })

    // Sync avec API si disponible et utilisateur connecté
    if (USE_API_CART && user?.id) {
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
          body: JSON.stringify({
            productId: productIdStr, // UUID string pour l'API
            title: item.title,
            image: item.image,
            price: item.price,
            currency: item.currency,
            quantity: 1,
            seller: item.seller,
          }),
        })

        if (!response.ok) {
          const error = await handleHTTPError(response, 'Cart add')
          throw error
        }

        const data = await response.json()
        
        // Mettre à jour avec l'ID réel de l'API
        if (data.item) {
          setCartItems((prev) =>
            prev.map((i) =>
              (i.productId.toString() === productIdStr) && !i.id.startsWith(data.item.id)
                ? { ...i, id: data.item.id, productId: productIdStr }
                : i
            )
          )
        }

        // Recharger le panier depuis l'API pour synchronisation complète
        const reloadResponse = await fetch('/api/cart', {
          headers: { 'x-user-id': user.id },
        })
        if (reloadResponse.ok) {
          const reloadData = await reloadResponse.json()
          const items: CartItem[] = reloadData.items.map((it: any) => ({
            id: it.id,
            productId: it.product_id,
            title: it.title,
            image: it.image_url,
            price: Number(it.price),
            currency: it.currency,
            quantity: it.quantity,
            seller: it.seller_name ? {
              name: it.seller_name,
              avatar: it.seller_avatar_url,
            } : undefined,
          }))
          setCartItems(items)
          
          // Backup localStorage
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
        }
      } catch (err) {
        const error = handleFetchError(err, 'Cart add')
        logError(error, 'Cart add')
        const userMessage = error instanceof Error && 'getUserMessage' in error
          ? (error as any).getUserMessage()
          : 'Erreur lors de l\'ajout au panier'
        setError(userMessage)
      }
    } else {
      // Fallback localStorage uniquement
      setCartItems((prev) => {
        const updated = [...prev]
        const existing = updated.find((i) => i.productId.toString() === item.productId.toString())
        if (existing) {
          existing.quantity += 1
        } else {
          updated.push({
            ...item,
            productId: productIdStr, // Utiliser la version normalisée
            id: `${productIdStr}-${Date.now()}`,
            quantity: 1,
          })
        }
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    }
  }

  // ✅ Supprimer un item du panier
  const removeFromCart = async (itemId: string) => {
    // Sauvegarder l'état précédent pour revert si erreur
    let previousItems: CartItem[] = []

    // Optimistic update
    setCartItems((prev) => {
      previousItems = prev
      return prev.filter((item) => item.id !== itemId)
    })

    // Sync avec API
    if (USE_API_CART && user?.id) {
      try {
        const response = await fetch(`/api/cart?itemId=${itemId}`, {
          method: 'DELETE',
          headers: { 'x-user-id': user.id },
        })

        if (!response.ok) {
          const error = await handleHTTPError(response, 'Cart remove')
          throw error
        }

        // Backup localStorage avec l'état actuel
        setCartItems((prev) => {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(prev))
          return prev
        })
      } catch (err) {
        const error = handleFetchError(err, 'Cart remove')
        logError(error, 'Cart remove')
        // Revert optimistic update en cas d'erreur
        setCartItems(previousItems)
        const userMessage = error instanceof Error && 'getUserMessage' in error
          ? (error as any).getUserMessage()
          : 'Erreur lors de la suppression'
        setError(userMessage)
      }
    } else {
      // Fallback localStorage
      setCartItems((prev) => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(prev))
        return prev
      })
    }
  }

  // ✅ Mettre à jour la quantité
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    // Optimistic update
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )

    // Sync avec API
    if (USE_API_CART && user?.id) {
      try {
        const response = await fetch('/api/cart', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
          body: JSON.stringify({ itemId, quantity }),
        })

        if (!response.ok) {
          const error = await handleHTTPError(response, 'Cart update quantity')
          throw error
        }

        // Backup localStorage avec l'état actuel
        setCartItems((prev) => {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(prev))
          return prev
        })
      } catch (err) {
        const error = handleFetchError(err, 'Cart update quantity')
        logError(error, 'Cart update quantity')
        // Revert optimistic update en cas d'erreur
        try {
          const stored = localStorage.getItem(CART_STORAGE_KEY)
          if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed)) {
              setCartItems(parsed)
            }
          }
        } catch {
          // Ignore localStorage errors
        }
        const userMessage = error instanceof Error && 'getUserMessage' in error
          ? (error as any).getUserMessage()
          : 'Erreur lors de la mise à jour'
        setError(userMessage)
      }
    } else {
      // Fallback localStorage
      setCartItems((prev) => {
        const updated = prev.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    }
  }

  // ✅ Vider le panier
  const clearCart = async () => {
    // Sauvegarder les items pour suppression API
    const itemsToDelete = [...cartItems]
    
    // Optimistic update
    setCartItems([])
    localStorage.removeItem(CART_STORAGE_KEY)

    // Sync avec API si disponible
    if (USE_API_CART && user?.id && itemsToDelete.length > 0) {
      try {
        // Supprimer chaque item via API (à optimiser avec endpoint bulk delete)
        await Promise.all(
          itemsToDelete.map((item) =>
            fetch(`/api/cart?itemId=${item.id}`, {
              method: 'DELETE',
              headers: { 'x-user-id': user.id },
            }).catch((err) => {
              logError(err, `Cart clear item ${item.id}`)
              return null
            })
          )
        )
      } catch (err) {
        logError(err, 'Cart clear')
        setError('Erreur lors du vidage du panier')
      }
    }
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
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  }
}

