/**
 * ADMIN - Système de rôles et permissions (RBAC)
 * @ai-context Gestion centralisée des rôles et permissions pour le dashboard admin
 */

/**
 * Rôles disponibles dans le système
 */
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  RESPONSABLE_COMMERCIAL = 'RESPONSABLE_COMMERCIAL',
  BUSINESS_DEVELOPER = 'BUSINESS_DEVELOPER',
  ADMIN = 'ADMIN',
}

/**
 * Permissions disponibles
 */
export enum Permission {
  // Gestion des tailleurs
  VIEW_TAILORS = 'VIEW_TAILORS',
  MANAGE_TAILORS = 'MANAGE_TAILORS',
  VIEW_TAILOR_STATS = 'VIEW_TAILOR_STATS',
  
  // Modération du feed
  MODERATE_FEED = 'MODERATE_FEED',
  DELETE_POST = 'DELETE_POST',
  
  // Gestion des commandes
  VIEW_ORDERS = 'VIEW_ORDERS',
  MANAGE_ORDERS = 'MANAGE_ORDERS',
  
  // Gestion des paiements
  VIEW_PAYMENTS = 'VIEW_PAYMENTS',
  MANAGE_PAYMENTS = 'MANAGE_PAYMENTS',
  
  // Paramètres système
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  CREATE_ACCOUNTS = 'CREATE_ACCOUNTS',
  
  // Dashboard global
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',

  // Conciergerie
  MANAGE_CONCIERGE = 'MANAGE_CONCIERGE',
}

/**
 * Mapping des rôles vers leurs permissions
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [
    // Toutes les permissions
    Permission.VIEW_TAILORS,
    Permission.MANAGE_TAILORS,
    Permission.VIEW_TAILOR_STATS,
    Permission.MODERATE_FEED,
    Permission.DELETE_POST,
    Permission.VIEW_ORDERS,
    Permission.MANAGE_ORDERS,
    Permission.VIEW_PAYMENTS,
    Permission.MANAGE_PAYMENTS,
    Permission.MANAGE_SETTINGS,
    Permission.MANAGE_ROLES,
    Permission.CREATE_ACCOUNTS,
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_CONCIERGE,
  ],
  
  [Role.RESPONSABLE_COMMERCIAL]: [
    Permission.VIEW_TAILORS,
    Permission.MANAGE_TAILORS,
    Permission.VIEW_TAILOR_STATS,
    Permission.MANAGE_CONCIERGE,
    Permission.VIEW_DASHBOARD,
  ],
  
  [Role.BUSINESS_DEVELOPER]: [
    Permission.VIEW_TAILORS,
    Permission.VIEW_TAILOR_STATS,
  ],
  
  [Role.ADMIN]: [
    Permission.MODERATE_FEED,
    Permission.DELETE_POST,
  ],
}

/**
 * Récupérer les permissions d'un rôle
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Vérifier si un rôle a une permission
 */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  const permissions = getPermissionsForRole(role)
  return permissions.includes(permission)
}

/**
 * Numéro de téléphone du SUPER_ADMIN
 */
export const SUPER_ADMIN_PHONE = '+221781110455'
