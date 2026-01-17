/**
 * ADMIN - Fonctions d'autorisation
 * @ai-context Vérification des permissions et accès pour le dashboard admin
 */

import type { User } from '@supabase/supabase-js'
import { Role, Permission, getPermissionsForRole, SUPER_ADMIN_PHONE } from './roles'

/**
 * Interface pour un utilisateur avec rôle
 */
export interface UserWithRole extends User {
  role?: Role
}

/**
 * Récupérer le rôle d'un utilisateur
 * 
 * @param user - Utilisateur Supabase
 * @returns Rôle de l'utilisateur ou null
 * 
 * Priorité de récupération :
 * 1. Numéro de téléphone SUPER_ADMIN (pour compatibilité dev)
 * 2. Table admin_users (production)
 * 3. user_metadata/app_metadata (fallback)
 */
export function getUserRole(user: User | null): Role | null {
  if (!user) return null

  // SUPER_ADMIN identifié par numéro de téléphone (pour développement)
  const phone = user.phone || user.user_metadata?.phone
  if (phone === SUPER_ADMIN_PHONE || phone === '781110455') {
    return Role.SUPER_ADMIN
  }

  // En production, le rôle sera récupéré depuis la table admin_users
  // via AdminUserService.getUserRole() côté serveur
  // Pour le client, on utilise les metadata comme fallback

  // Récupérer le rôle depuis user_metadata ou app_metadata
  const roleFromMetadata = user.user_metadata?.role || user.app_metadata?.role
  
  if (roleFromMetadata && Object.values(Role).includes(roleFromMetadata as Role)) {
    return roleFromMetadata as Role
  }

  return null
}

/**
 * Vérifier si un utilisateur a une permission
 * 
 * @param user - Utilisateur
 * @param permission - Permission à vérifier
 * @returns true si l'utilisateur a la permission
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false

  const role = getUserRole(user)
  if (!role) return false

  const permissions = getPermissionsForRole(role)
  return permissions.includes(permission)
}

/**
 * Vérifier si un utilisateur est SUPER_ADMIN
 * 
 * @param user - Utilisateur
 * @returns true si l'utilisateur est SUPER_ADMIN
 */
export function isSuperAdmin(user: User | null): boolean {
  if (!user) return false
  return getUserRole(user) === Role.SUPER_ADMIN
}

/**
 * Vérifier si un utilisateur a au moins une des permissions
 * 
 * @param user - Utilisateur
 * @param permissions - Liste de permissions
 * @returns true si l'utilisateur a au moins une permission
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(user, permission))
}

/**
 * Vérifier si un utilisateur a toutes les permissions
 * 
 * @param user - Utilisateur
 * @param permissions - Liste de permissions
 * @returns true si l'utilisateur a toutes les permissions
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(user, permission))
}

/**
 * Require une permission (throw si non autorisé)
 * 
 * @param user - Utilisateur
 * @param permission - Permission requise
 * @throws Error si l'utilisateur n'a pas la permission
 */
export function requirePermission(user: User | null, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Permission requise: ${permission}`)
  }
}

/**
 * Require au moins une permission
 * 
 * @param user - Utilisateur
 * @param permissions - Liste de permissions
 * @throws Error si l'utilisateur n'a aucune permission
 */
export function requireAnyPermission(user: User | null, permissions: Permission[]): void {
  if (!hasAnyPermission(user, permissions)) {
    throw new Error(`Au moins une permission requise parmi: ${permissions.join(', ')}`)
  }
}
