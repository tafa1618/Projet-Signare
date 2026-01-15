'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, X, Sparkles } from 'lucide-react'
import { useAuth } from '@/frontend/hooks/useAuth'

interface Notification {
  id: string
  type: 'order' | 'message' | 'like' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // Mock notifications pour le développement
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'order',
        title: 'Nouvelle commande',
        message: 'Votre commande #1234 a été confirmée',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        read: false,
        actionUrl: '/orders/1234'
      },
      {
        id: '2',
        type: 'message',
        title: 'Nouveau message',
        message: 'Tapha Tailleur vous a envoyé un message',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: false,
        actionUrl: '/messages'
      },
      {
        id: '3',
        type: 'like',
        title: 'Nouveau like',
        message: 'Votre publication a reçu 5 nouveaux likes',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: true
      },
      {
        id: '4',
        type: 'system',
        title: 'Mise à jour',
        message: 'Nouvelle fonctionnalité disponible : Mesures automatiques par IA',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true
      }
    ]
    setNotifications(mockNotifications)
  }, [])

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return '📦'
      case 'message':
        return '💬'
      case 'like':
        return '❤️'
      case 'system':
        return '✨'
      default:
        return '🔔'
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="sticky top-16 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#D4AF37]/20 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#D4AF37] p-2 rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <Bell className="w-5 h-5 text-[#0A0A0A]" />
              </div>
              <div>
                <h1 className="text-xl font-serif text-[#D4AF37] tracking-wider">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-white/60">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                className="text-sm text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors px-3 py-1.5 rounded-lg border border-[#D4AF37]/20 hover:border-[#D4AF37]/40"
              >
                Tout marquer lu
              </motion.button>
            )}
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('all')}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${filter === 'all' 
                  ? 'bg-[#D4AF37] text-[#0A0A0A] shadow-[0_0_12px_rgba(212,175,55,0.4)]' 
                  : 'bg-white/5 text-white/60 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
                }
              `}
            >
              Toutes
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('unread')}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all relative
                ${filter === 'unread' 
                  ? 'bg-[#D4AF37] text-[#0A0A0A] shadow-[0_0_12px_rgba(212,175,55,0.4)]' 
                  : 'bg-white/5 text-white/60 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
                }
              `}
            >
              Non lues
              {unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-[#0A0A0A] text-[#D4AF37] text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Liste des notifications */}
        <div className="py-4 space-y-3">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="bg-[#D4AF37]/10 p-6 rounded-full mb-4">
                  <Bell className="w-12 h-12 text-[#D4AF37]/40" />
                </div>
                <p className="text-white/60 text-lg font-medium mb-2">
                  Aucune notification
                </p>
                <p className="text-white/40 text-sm">
                  {filter === 'unread' 
                    ? 'Vous avez lu toutes vos notifications' 
                    : 'Vous n\'avez pas encore de notifications'}
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`
                    relative p-4 rounded-xl border transition-all
                    ${notification.read 
                      ? 'bg-white/5 border-[#D4AF37]/10' 
                      : 'bg-[#D4AF37]/10 border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.1)]'
                    }
                  `}
                >
                  <div className="flex gap-3">
                    {/* Icône */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-xl">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`
                          font-semibold text-sm
                          ${notification.read ? 'text-white/80' : 'text-white'}
                        `}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-[#D4AF37] rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className={`
                        text-sm mb-2
                        ${notification.read ? 'text-white/60' : 'text-white/80'}
                      `}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-white/40">
                        {new Date(notification.timestamp).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5">
                      {!notification.read && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => markAsRead(notification.id)}
                          className="p-1.5 rounded-lg bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 transition-colors"
                          title="Marquer comme lu"
                        >
                          <Check className="w-4 h-4 text-[#D4AF37]" />
                        </motion.button>
                      )}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        title="Supprimer"
                      >
                        <X className="w-4 h-4 text-white/60" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

