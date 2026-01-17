# 👨‍💼 Système Admin & Gestion des Rôles - SIGNARE

## 📋 Vue d'Ensemble

Le système admin permet au **SUPER_ADMIN** de créer et gérer les comptes administrateurs avec différents rôles et permissions.

## 🗄️ Structure de la Base de Données

### Table `admin_users`

Stocke les informations des utilisateurs admin :

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Référence à `auth.users(id)` |
| `phone` | TEXT | Numéro de téléphone (unique) |
| `name` | TEXT | Nom complet |
| `email` | TEXT | Email (optionnel) |
| `role` | TEXT | Rôle: `SUPER_ADMIN`, `RESPONSABLE_COMMERCIAL`, `BUSINESS_DEVELOPER`, `ADMIN` |
| `is_active` | BOOLEAN | Statut actif/inactif |
| `created_by` | UUID | ID du SUPER_ADMIN qui a créé ce compte |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Dernière mise à jour |
| `last_active_at` | TIMESTAMPTZ | Dernière activité |

### Table `admin_actions`

Audit trail de toutes les actions admin :

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `admin_id` | UUID | ID de l'admin qui a effectué l'action |
| `action_type` | TEXT | Type: `CREATE_ADMIN`, `UPDATE_ROLE`, `DEACTIVATE_ADMIN`, etc. |
| `target_user_id` | UUID | ID de l'utilisateur concerné |
| `details` | JSONB | Détails de l'action (ancien/nouveau rôle, etc.) |
| `ip_address` | INET | Adresse IP |
| `user_agent` | TEXT | User agent |
| `created_at` | TIMESTAMPTZ | Date de l'action |

## 🚀 Installation

### 1. Exécuter la Migration SQL

```sql
-- Exécuter le fichier de migration
\i supabase-migrations/005_create_admin_system.sql
```

Ou via Supabase Dashboard :
1. Aller dans **SQL Editor**
2. Copier/coller le contenu de `supabase-migrations/005_create_admin_system.sql`
3. Exécuter

### 2. Initialiser le SUPER_ADMIN

**Option A : Via Supabase Dashboard**

1. Créer un utilisateur dans **Authentication** avec le numéro `+781110455`
2. Noter l'UUID de l'utilisateur
3. Exécuter dans SQL Editor :

```sql
INSERT INTO admin_users (id, phone, name, role, is_active)
VALUES (
  'VOTRE_UUID_ICI', -- UUID de l'utilisateur Supabase Auth
  '+781110455',
  'Super Admin',
  'SUPER_ADMIN',
  TRUE
);
```

**Option B : Via API Supabase Admin**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Créer l'utilisateur
const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
  phone: '+781110455',
  user_metadata: {
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
  },
  app_metadata: {
    role: 'SUPER_ADMIN',
  },
})

// Créer l'entrée admin_users
await supabaseAdmin
  .from('admin_users')
  .insert({
    id: user.user.id,
    phone: '+781110455',
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
    is_active: true,
  })
```

## 🔐 Rôles et Permissions

### SUPER_ADMIN
- ✅ Toutes les permissions
- ✅ Créer/modifier/supprimer des admins
- ✅ Gérer les rôles
- ✅ Accès à toutes les pages admin

### RESPONSABLE_COMMERCIAL
- ✅ Voir les tailleurs
- ✅ Gérer les tailleurs (validation, suspension)
- ✅ Voir les statistiques des tailleurs

### BUSINESS_DEVELOPER
- ✅ Voir les tailleurs (lecture seule)
- ✅ Voir les statistiques des tailleurs

### ADMIN
- ✅ Modérer le feed
- ✅ Supprimer des posts
- ✅ Gérer les signalements

## 📝 Fonctions SQL Disponibles

### `create_admin_user(phone, name, email, role, created_by)`

Crée un nouveau compte admin.

```sql
SELECT create_admin_user(
  '+221771234567',
  'Jean Dupont',
  'jean.dupont@signare.sn',
  'RESPONSABLE_COMMERCIAL',
  'UUID_SUPER_ADMIN'
);
```

### `update_admin_role(admin_id, new_role, updated_by)`

Met à jour le rôle d'un admin.

```sql
SELECT update_admin_role(
  'UUID_ADMIN',
  'BUSINESS_DEVELOPER',
  'UUID_SUPER_ADMIN'
);
```

### `deactivate_admin(admin_id, deactivated_by)`

Désactive un compte admin.

```sql
SELECT deactivate_admin(
  'UUID_ADMIN',
  'UUID_SUPER_ADMIN'
);
```

### `log_admin_action(admin_id, action_type, target_user_id, details, ip_address, user_agent)`

Log une action admin (utilisée automatiquement par les fonctions ci-dessus).

```sql
SELECT log_admin_action(
  'UUID_ADMIN',
  'CUSTOM_ACTION',
  'UUID_TARGET',
  '{"key": "value"}'::jsonb,
  '192.168.1.1'::inet,
  'Mozilla/5.0...'
);
```

### `update_admin_last_active(admin_id)`

Met à jour la dernière activité d'un admin (appelé automatiquement).

## 🔒 Sécurité (RLS)

Les politiques RLS garantissent que :

- ✅ Seuls les **SUPER_ADMIN** peuvent voir tous les admins
- ✅ Seuls les **SUPER_ADMIN** peuvent créer des admins
- ✅ Seuls les **SUPER_ADMIN** peuvent modifier des admins
- ✅ Seuls les **SUPER_ADMIN** peuvent voir l'audit trail

## 🔄 Synchronisation avec Supabase Auth

**Important :** Le rôle doit être synchronisé entre :
1. `admin_users.role` (table SQL)
2. `auth.users.app_metadata.role` (Supabase Auth)

**Recommandation :** Utiliser les fonctions SQL qui mettent à jour automatiquement les deux.

## 📊 Vue `admin_users_view`

Vue pratique qui inclut :
- Informations de l'admin
- Nom du créateur
- Nombre total d'actions

```sql
SELECT * FROM admin_users_view;
```

## 🧪 Tests

### Tester la création d'un admin

```sql
-- En tant que SUPER_ADMIN
SELECT create_admin_user(
  '+221771234567',
  'Test Admin',
  'test@signare.sn',
  'ADMIN',
  'UUID_SUPER_ADMIN'
);
```

### Vérifier les actions loggées

```sql
SELECT * FROM admin_actions 
WHERE admin_id = 'UUID_SUPER_ADMIN'
ORDER BY created_at DESC;
```

## 🚨 Points d'Attention

1. **Ne jamais supprimer le dernier SUPER_ADMIN**
2. **Ne jamais modifier le rôle d'un SUPER_ADMIN**
3. **Toujours logger les actions importantes**
4. **Vérifier les permissions avant chaque action**

## 📚 Références

- Migration SQL : `supabase-migrations/005_create_admin_system.sql`
- Types TypeScript : `shared/types/database.types.ts`
- Service : `lib/services/adminUsersManagement.ts`
- Page Admin : `app/admin/users/admins/page.tsx`

