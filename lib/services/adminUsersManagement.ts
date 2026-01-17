/**
 * ADMIN - Service de gestion des utilisateurs admin
 * @ai-context Gestion des comptes admin pour SUPER_ADMIN
 * Utilise AdminUserService côté serveur pour accéder à Supabase
 */

import { Role } from '@/lib/auth/roles'
import { AdminUserService } from '@/backend/services'
import type { AdminUser as BackendAdminUser } from '@/backend/services/AdminUserService'

export interface AdminUser {
  id: string
  phone: string
  name: string
  email?: string
  role: Role
  createdAt: string
  lastActiveAt?: string
  isActive: boolean
}

/**
 * Récupérer la liste des admins
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    // Utiliser le service backend qui accède à Supabase
    const admins = await AdminUserService.getAllAdmins()
    
    return admins.map(admin => ({
      id: admin.id,
      phone: admin.phone,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
      lastActiveAt: admin.lastActiveAt,
      isActive: admin.isActive,
    }))
  } catch (error) {
    console.error('Error fetching admin users:', error)
    
    // Fallback vers mock en développement si la table n'existe pas encore
    if (process.env.NODE_ENV === 'development') {
      return getMockAdmins()
    }
    
    throw error
  }
}

/**
 * Créer un nouveau compte admin
 */
export interface CreateAdminUserInput {
  phone: string
  name: string
  email?: string
  role: Role
  createdBy: string // ID du SUPER_ADMIN qui crée
}

export async function createAdminUser(input: CreateAdminUserInput): Promise<AdminUser> {
  try {
    // En production, l'utilisateur doit d'abord être créé dans Supabase Auth
    // Pour l'instant, on simule la création
    
    // TODO: En production, créer l'utilisateur via Supabase Auth API avant
    // const { data: authUser } = await supabase.auth.admin.createUser({
    //   phone: input.phone,
    //   user_metadata: { name: input.name },
    // })
    
    // Pour le développement, on utilise un ID temporaire
    const tempUserId = `temp-${Date.now()}`
    
    const admin = await AdminUserService.createAdminUser({
      userId: tempUserId, // En production, utiliser authUser.id
      phone: input.phone,
      name: input.name,
      email: input.email,
      role: input.role,
      createdBy: input.createdBy,
    })

    return {
      id: admin.id,
      phone: admin.phone,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
      lastActiveAt: admin.lastActiveAt,
      isActive: admin.isActive,
    }
  } catch (error) {
    console.error('Error creating admin user:', error)
    throw error
  }
}

/**
 * Mettre à jour un admin (rôle, statut)
 */
export interface UpdateAdminUserInput {
  id: string
  name?: string
  email?: string
  role?: Role
  isActive?: boolean
  updatedBy: string // ID du SUPER_ADMIN qui modifie
}

export async function updateAdminUser(input: UpdateAdminUserInput): Promise<AdminUser> {
  try {
    // Si le rôle est modifié
    if (input.role) {
      await AdminUserService.updateAdminRole({
        adminId: input.id,
        newRole: input.role,
        updatedBy: input.updatedBy,
      })
    }

    // Si le statut est modifié
    if (input.isActive === false) {
      await AdminUserService.deactivateAdmin({
        adminId: input.id,
        deactivatedBy: input.updatedBy,
      })
    }

    // Récupérer l'admin mis à jour
    const admins = await AdminUserService.getAllAdmins()
    const updatedAdmin = admins.find(a => a.id === input.id)

    if (!updatedAdmin) {
      throw new Error('Admin introuvable après mise à jour')
    }

    return {
      id: updatedAdmin.id,
      phone: updatedAdmin.phone,
      name: input.name || updatedAdmin.name,
      email: input.email !== undefined ? input.email : updatedAdmin.email,
      role: updatedAdmin.role,
      createdAt: updatedAdmin.createdAt,
      lastActiveAt: updatedAdmin.lastActiveAt,
      isActive: updatedAdmin.isActive,
    }
  } catch (error) {
    console.error('Error updating admin user:', error)
    throw error
  }
}

/**
 * Désactiver un compte admin
 */
export async function deactivateAdminUser(adminId: string, deactivatedBy: string): Promise<void> {
  try {
    await AdminUserService.deactivateAdmin({
      adminId,
      deactivatedBy,
    })
  } catch (error) {
    console.error('Error deactivating admin user:', error)
    throw error
  }
}

/**
 * Supprimer un compte admin (irréversible)
 */
export async function deleteAdminUser(adminId: string, deletedBy: string): Promise<void> {
  try {
    await AdminUserService.deleteAdmin({
      adminId,
      deletedBy,
    })
  } catch (error) {
    console.error('Error deleting admin user:', error)
    throw error
  }
}

/**
 * Données mockées pour le développement (fallback)
 */
function getMockAdmins(): AdminUser[] {
  return [
    {
      id: 'super-admin-781110455',
      phone: '+781110455',
      name: 'Super Admin',
      role: Role.SUPER_ADMIN,
      createdAt: '2024-01-01T00:00:00Z',
      lastActiveAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: 'admin-1',
      phone: '+221771234567',
      name: 'Jean Dupont',
      email: 'jean.dupont@signare.sn',
      role: Role.RESPONSABLE_COMMERCIAL,
      createdAt: '2024-06-15T10:00:00Z',
      lastActiveAt: '2026-01-14T15:30:00Z',
      isActive: true,
    },
    {
      id: 'admin-2',
      phone: '+221772345678',
      name: 'Marie Diop',
      email: 'marie.diop@signare.sn',
      role: Role.BUSINESS_DEVELOPER,
      createdAt: '2024-08-20T14:00:00Z',
      lastActiveAt: '2026-01-13T09:20:00Z',
      isActive: true,
    },
    {
      id: 'admin-3',
      phone: '+221773456789',
      name: 'Amadou Ba',
      email: 'amadou.ba@signare.sn',
      role: Role.ADMIN,
      createdAt: '2024-10-10T11:00:00Z',
      lastActiveAt: '2026-01-15T10:15:00Z',
      isActive: true,
    },
  ]
}
