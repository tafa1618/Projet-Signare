# 📊 Signaux Business - Documentation

## Vue d'ensemble

Les **signaux business** sont des métriques dérivées qui mesurent la qualité, la performance et le potentiel de conversion d'un item ou d'un tailleur.

Dans le système de ranking, ces signaux représentent **60%** du score final, l'objectif étant de maximiser les conversions plutôt que seulement la pertinence sémantique.

## 🔍 Composantes des Signaux Business

### 1. Récence (30% du score business)

**Objectif** : Favoriser les items récents pour éviter les produits obsolètes.

**Calcul actuel** :
```python
days_old = (datetime.utcnow() - item.created_at).days

if days_old <= 7:      return 1.0   # Items très récents
elif days_old <= 30:   return 0.8   # Items récents
elif days_old <= 90:   return 0.5   # Items moyens
elif days_old <= 180:  return 0.3   # Items anciens
else:                  return 0.1   # Items très anciens
```

**Source de données** :
- `items.created_at` (depuis le Read Model)

**Améliorations possibles** :
- Prendre en compte `updated_at` si l'item a été mis à jour récemment
- Boost pour les items avec "new_arrival" flag

### 2. Qualité du Tailleur (20% du score business)

**Objectif** : Favoriser les tailleurs performants et fiables.

**Calcul actuel** :
```python
rating_score = (tailor.rating / 5.0) * 0.6          # Normalisé 0-1, poids 60%
performance_score = min(tailor.performance_score, 1.0) * 0.4  # Poids 40%

tailor_score = rating_score + performance_score
```

**Sources de données** :
- `tailors.rating` : Note moyenne du tailleur (1-5)
- `tailors.performance_score` : Score agrégé de performance (0-1)

**Performance Score - Comment est-il calculé ?**

Le `performance_score` devrait être calculé par le backend métier lors de la synchronisation :

```python
# Exemple de calcul (à faire dans le backend métier ou script de sync)
performance_factors = {
    "completion_rate": 0.3,      # Taux de complétion des commandes
    "on_time_delivery": 0.25,    # Livraisons à l'heure
    "client_satisfaction": 0.25,  # Satisfaction client moyenne
    "repeat_customers": 0.2      # Taux de clients récurrents
}

performance_score = (
    completion_rate * 0.3 +
    on_time_delivery * 0.25 +
    client_satisfaction * 0.25 +
    repeat_customers * 0.2
)
```

**Améliorations possibles** :
- Prendre en compte le nombre de commandes (volume)
- Période d'activité du tailleur
- Spécialisation (expert dans certaines catégories)

### 3. Performance Historique de l'Item (20% du score business)

**Objectif** : Favoriser les items qui génèrent de l'engagement.

**Calcul actuel** :
```python
total_interactions = (
    item.view_count + 
    item.click_count * 2 +      # Clic = engagement plus fort
    item.purchase_count * 5      # Achat = engagement maximum
)

# Normalisation logarithmique
normalized = log(1 + total_interactions) / log(100)
performance_score = min(normalized, 1.0)
```

**Sources de données** :
- `items.view_count` : Nombre de vues
- `items.click_count` : Nombre de clics
- `items.purchase_count` : Nombre d'achats

**Comment ces compteurs sont-ils mis à jour ?**

Ces compteurs sont mis à jour via le endpoint `/track` :

```python
# Lors d'un événement "view_item"
item.view_count += 1

# Lors d'un événement "click"
item.click_count += 1

# Lors d'un événement "purchase"
item.purchase_count += 1
```

**Améliorations possibles** :
- Prendre en compte la récence des interactions (décroissance temporelle)
- Taux de conversion (purchases / views)
- Temps moyen passé sur l'item
- Taux de rebond

### 4. Disponibilité (15% du score business)

**Objectif** : Ne jamais proposer d'items indisponibles en haut des résultats.

**Calcul actuel** :
```python
availability_score = 1.0 if item.availability else 0.0
```

**Source de données** :
- `items.availability` (boolean)

**Améliorations possibles** :
- Stock disponible (si applicable)
- Temps de fabrication estimé
- Statut de commande en cours

### 5. Cohérence du Prix (15% du score business)

**Objectif** : Favoriser les prix cohérents avec les attentes du marché SIGNARE.

**Calcul actuel** :
```python
if 5000 <= price <= 50000:       return 1.0   # Gamme optimale
elif 50000 < price <= 100000:    return 0.8   # Haut de gamme
elif 1000 <= price < 5000:       return 0.6   # Entrée de gamme
elif 100000 < price <= 200000:   return 0.5   # Luxe
else:                            return 0.3   # Extrêmes
```

**Source de données** :
- `items.price`

**Améliorations possibles** :
- Prendre en compte le contexte de la requête (budget utilisateur)
- Comparaison avec prix moyens de la catégorie
- Évaluation qualité/prix
- Gamme de prix par type de vêtement

## 📈 Synchronisation des Données

Les signaux business sont calculés à partir du **Read Model**, qui est synchronisé depuis le backend métier.

### Stratégies de synchronisation

1. **Batch Sync** (recommandé pour débuter)
   - Script qui tourne périodiquement (ex: toutes les heures)
   - Met à jour les compteurs et scores agrégés

2. **Webhooks** (temps réel)
   - Le backend métier envoie des webhooks lors des événements
   - Mise à jour immédiate des compteurs

3. **Event Sourcing** (avancé)
   - Consommation d'événements depuis un bus
   - Agrégation des événements pour calculer les scores

### Exemple de script de synchronisation

```python
# scripts/sync_business_signals.py

def sync_item_signals():
    """
    Synchronise les signaux business des items depuis le backend métier
    """
    # 1. Récupérer les événements depuis le backend métier
    events = fetch_events_from_backend(since=last_sync)
    
    # 2. Agréger par item
    item_stats = {}
    for event in events:
        item_id = event.item_id
        if item_id not in item_stats:
            item_stats[item_id] = {
                'views': 0,
                'clicks': 0,
                'purchases': 0
            }
        
        if event.type == 'view_item':
            item_stats[item_id]['views'] += 1
        elif event.type == 'click':
            item_stats[item_id]['clicks'] += 1
        elif event.type == 'purchase':
            item_stats[item_id]['purchases'] += 1
    
    # 3. Mettre à jour le Read Model
    for item_id, stats in item_stats.items():
        update_item_signals(item_id, stats)

def sync_tailor_performance():
    """
    Synchronise les scores de performance des tailleurs
    """
    tailors = fetch_tailors_from_backend()
    
    for tailor in tailors:
        performance_score = calculate_performance_score(tailor)
        update_tailor_performance(tailor.id, performance_score)
```

## 🎯 Poids des Signaux dans le Score Final

```
Score Final = (Similarité Sémantique * 0.4) + (Business Score * 0.6)

Business Score = 
    Récence (30%) +
    Qualité Tailleur (20%) +
    Performance Historique (20%) +
    Disponibilité (15%) +
    Cohérence Prix (15%)
```

## 🔄 Mise à jour Continue

Les signaux business doivent être mis à jour régulièrement :

1. **Temps réel** : Via le endpoint `/track` (compteurs)
2. **Périodique** : Script de synchronisation (scores agrégés)
3. **On-demand** : Lors de changements importants (disponibilité, prix)

## 📊 Métriques à Surveiller

Pour valider l'efficacité des signaux business :

- **Taux de conversion** : Achats / Vues des items en haut des résultats
- **Taux de clic** : Clics / Vues
- **Taux de rebond** : Utilisateurs qui quittent sans interaction
- **Satisfaction client** : Notes après achat
- **Réactivité** : Temps moyen avant interaction

## 🔄 Mise à Jour Automatique via `/track`

Le endpoint `/track` met maintenant à jour automatiquement les compteurs d'items :

### Exemple d'utilisation

```python
POST /api/v1/track
{
  "events": [
    {
      "event_type": "view_item",
      "entity_id": "item123",
      "user_id": "user456",
      "session_id": "session789",
      "context": {}
    },
    {
      "event_type": "click",
      "entity_id": "item123",
      "user_id": "user456",
      "session_id": "session789",
      "context": {}
    }
  ]
}
```

**Résultat** :
- L'événement `view_item` incrémente `item.view_count` de 1
- L'événement `click` incrémente `item.click_count` de 1
- Les compteurs sont mis à jour atomiquement

### Endpoint de statistiques

Pour consulter les statistiques d'un item :

```bash
GET /api/v1/track/item/{item_id}/stats
```

**Réponse** :
```json
{
  "view_count": 1250,
  "click_count": 340,
  "purchase_count": 45,
  "conversion_rate": 3.6
}
```

## 🚀 Améliorations Futures

1. **Machine Learning** : Entraîner un modèle pour prédire la probabilité de conversion
2. **A/B Testing** : Tester différents poids pour les signaux
3. **Personnalisation** : Adapter les signaux selon le profil utilisateur
4. **Contexte temporel** : Prendre en compte les événements (Tabaski, mariage, etc.)
5. **Localisation** : Adapter selon la région (Dakar vs autres villes)

