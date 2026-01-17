/**
 * BACKEND - Service de gestion des admins
 * @ai-context Service pour récupérer et gérer les rôles admin depuis Supabase
 */

import { getSupabaseAdmin } from '@/backend/lib/supabase'
import { Role } from '@/lib/auth/roles'
import type { User } from '@supabase/supabase-js'

export interface AdminUser {
  id: string
  phone: string
  name: string
  email?: string
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastActiveAt?: string
  createdBy?: string
}

/**
 * Service pour gérer les admins
 */
export class AdminUserService {
  /**
   * Récupérer le rôle d'un utilisateur depuis la base de données
   * 
   * @param userId - ID de l'utilisateur
   * @returns Rôle de l'utilisateur ou null
   */
  static async getUserRole(userId: string): Promise<Role | null> {
    const supabase = getSupabaseAdmin()

    // Vérifier d'abord dans admin_users
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', userId)
      .eq('is_active', true)
      .single()

    if (error || !adminUser) {
      return null
    }

    // Vérifier que le rôle est valide
    if (Object.values(Role).includes(adminUser.role as Role)) {
      return adminUser.role as Role
    }

    return null
  }

  /**
   * Récupérer tous les admins
   */
  static async getAllAdmins(): Promise<AdminUser[]> {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return (data || []).map((admin: any) => ({
      id: admin.id,
      phone: admin.phone,
      name: admin.name,
      email: admin.email,
      role: admin.role as Role,
      isActive: admin.is_active,
      createdAt: admin.created_at,
      updatedAt: admin.updated_at,
      lastActiveAt: admin.last_active_at,
      createdBy: admin.created_by,
    }))
  }

  /**
   * Créer un nouveau compte admin
   * 
   * Note: L'utilisateur doit déjà exister dans auth.users
   * Cette fonction crée uniquement l'entrée dans admin_users
   */
  static async createAdminUser(params: {
    userId: string
    phone: string
    name: string
    email?: string
    role: Role
    createdBy: string
  }): Promise<AdminUser> {
    const supabase = getSupabaseAdmin()

    // Vérifier que le créateur est SUPER_ADMIN
    const creatorRole = await this.getUserRole(params.createdBy)
    if (creatorRole !== Role.SUPER_ADMIN) {
      throw new Error('Seul un SUPER_ADMIN peut créer des comptes admin')
    }

    // Vérifier que le rôle n'est pas SUPER_ADMIN
    if (params.role === Role.SUPER_ADMIN) {
      throw new Error('Impossible de créer un compte SUPER_ADMIN via cette fonction')
    }

    // Utiliser la fonction SQL pour créer l'admin (avec validation)
    const { data: adminId, error: rpcError } = await supabase.rpc('create_admin_user', {
      p_user_id: params.userId,
      p_phone: params.phone,
      p_name: params.name,
      p_email: params.email || null,
      p_role: params.role,
      p_created_by: params.createdBy,
    })

    if (rpcError) {
      throw rpcError
    }

    // Récupérer l'admin créé
    const { data: newAdmin, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', params.userId)
      .single()

    if (fetchError || !newAdmin) {
      throw new Error(`Erreur lors de la récupération de l'admin créé: ${fetchError?.message || 'Admin introuvable'}`)
    }

    // Mettre à jour user_metadata avec le rôle
    await supabase.auth.admin.updateUserById(params.userId, {
      user_metadata: {
        role: params.role,
        admin: true,
        name: params.name,
      },
    })

    return {
      id: newAdmin.id,
      phone: newAdmin.phone,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role as Role,
      isActive: newAdmin.is_active,
      createdAt: newAdmin.created_at,
      updatedAt: newAdmin.updated_at,
      lastActiveAt: newAdmin.last_active_at,
      createdBy: newAdmin.created_by,
    }
  }

  /**
   * Mettre à jour le rôle d'un admin
   */
  static async updateAdminRole(params: {
    adminId: string
    newRole: Role
    updatedBy: string
  }): Promise<void> {
    const supabase = getSupabaseAdmin()

    // Vérifier que le modificateur est SUPER_ADMIN
    const updaterRole = await this.getUserRole(params.updatedBy)
    if (updaterRole !== Role.SUPER_ADMIN) {
      throw new Error('Seul un SUPER_ADMIN peut modifier les rôles')
    }

    // Récupérer l'ancien rôle
    const { data: admin } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', params.adminId)
      .single()

    if (!admin) {
      throw new Error('Admin introuvable')
    }

    // Ne pas permettre de modifier le rôle d'un SUPER_ADMIN
    if (admin.role === Role.SUPER_ADMIN) {
      throw new Error('Impossible de modifier le rôle d\'un SUPER_ADMIN')
    }

    // Ne pas permettre de créer un SUPER_ADMIN
    if (params.newRole === Role.SUPER_ADMIN) {
      throw new Error('Impossible de définir le rôle SUPER_ADMIN')
    }

    // Utiliser la fonction SQL pour mettre à jour le rôle (avec validation)
    const { error: rpcError } = await supabase.rpc('update_admin_role', {
      p_admin_id: params.adminId,
      p_new_role: params.newRole,
      p_updated_by: params.updatedBy,
    })

    if (rpcError) {
      throw rpcError
    }

    // Mettre à jour user_metadata
    await supabase.auth.admin.updateUserById(params.adminId, {
      user_metadata: {
        role: params.newRole,
      },
    })
  }

  /**
   * Désactiver un admin
   */
  static async deactivateAdmin(params: {
    adminId: string
    deactivatedBy: string
  }): Promise<void> {
    const supabase = getSupabaseAdmin()

    // Vérifier que le modificateur est SUPER_ADMIN
    const deactivatorRole = await this.getUserRole(params.deactivatedBy)
    if (deactivatorRole !== Role.SUPER_ADMIN) {
      throw new Error('Seul un SUPER_ADMIN peut désactiver des admins')
    }

    // Vérifier que ce n'est pas un SUPER_ADMIN
    const { data: admin } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', params.adminId)
      .single()

    if (!admin) {
      throw new Error('Admin introuvable')
    }

    if (admin.role === Role.SUPER_ADMIN) {
      throw new Error('Impossible de désactiver un SUPER_ADMIN')
    }

    // Utiliser la fonction SQL pour désactiver (avec validation)
    const { error: rpcError } = await supabase.rpc('deactivate_admin', {
      p_admin_id: params.adminId,
      p_deactivated_by: params.deactivatedBy,
    })

    if (rpcError) {
      throw rpcError
    }
  }

  /**
   * Supprimer un admin (irréversible)
   */
  static async deleteAdmin(params: {
    adminId: string
    deletedBy: string
  }): Promise<void> {
    const supabase = getSupabaseAdmin()

    // Vérifier que le modificateur est SUPER_ADMIN
    const deleterRole = await this.getUserRole(params.deletedBy)
    if (deleterRole !== Role.SUPER_ADMIN) {
      throw new Error('Seul un SUPER_ADMIN peut supprimer des admins')
    }

    // Vérifier que ce n'est pas un SUPER_ADMIN
    const { data: admin } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', params.adminId)
      .single()

    if (!admin) {
      throw new Error('Admin introuvable')
    }

    if (admin.role === Role.SUPER_ADMIN) {
      throw new Error('Impossible de supprimer un SUPER_ADMIN')
    }

    // Logger l'action avant suppression
    await supabase.from('admin_actions').insert({
      admin_id: params.deletedBy,
      action_type: 'DELETE_ADMIN',
      target_user_id: params.adminId,
      details: {
        reason: 'Supprimé par SUPER_ADMIN',
      },
    })

    // Supprimer (CASCADE supprimera aussi les actions liées)
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', params.adminId)

    if (error) {
      throw error
    }
  }

  /**
   * Mettre à jour last_active_at
   */
  static async updateLastActive(userId: string): Promise<void> {
    const supabase = getSupabaseAdmin()

    await supabase
      .from('admin_users')
      .update({
        last_active_at: new Date().toISOString(),
      })
      .eq('id', userId)
  }
}
