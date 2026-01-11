# 🔍 Hypothèses et Choix Architecturaux

## Hypothèses Prises

### 1. Read Model
**Hypothèse** : Le microservice maintient une base de données séparée (Read Model) contenant uniquement les données nécessaires au ranking et à la recommandation.

**Justification** : 
- Isolation complète du service métier
- Optimisation pour les requêtes de recherche/recommendation
- Scalabilité indépendante

**Synchronisation** :
- Méthode 1 : Synchronisation batch (cron job) depuis le backend métier
- Méthode 2 : Webhooks depuis le backend métier lors des mises à jour
- À implémenter dans une phase ultérieure

### 2. Embeddings Sémantiques
**Hypothèse** : Les embeddings seront pré-calculés et stockés dans la base de données (JSONB).

**Justification** :
- Performance (pas de calcul en temps réel)
- Flexibilité (peut utiliser différents modèles)

**Modèle à utiliser** :
- En v1 : Modèle léger local (ex: sentence-transformers all-MiniLM-L6-v2, 384 dimensions)
- Stockage : JSONB dans PostgreSQL
- À terme : Migration vers FAISS pour recherche vectorielle performante

### 3. Cold Start Strategy
**Hypothèse** : Utilisateur considéré "cold start" si moins de 5 interactions.

**Justification** :
- Seuil basé sur l'expérience des systèmes de recommandation
- Permet une personnalisation progressive

**Stratégie** :
- Trending + New Arrivals + Budget (si disponible)
- Pas de personnalisation au début

### 4. Ranking Hybride (Search)
**Hypothèse** : Similarité sémantique (40%) + Signaux business (60%).

**Justification** :
- Orientation conversion (objectif principal)
- Évite les résultats obsolètes ou non pertinents
- Favorise la qualité et la performance

**Signaux business** :
- Récence (30%)
- Qualité tailleur (20%)
- Performance historique (20%)
- Disponibilité (15%)
- Prix cohérent (15%)

### 5. Feed Structure
**Hypothèse** : Feed composé de 4-6 sections maximum, 10 items par section.

**Justification** :
- Équilibre entre personnalisation et découverte
- Performance (limite le nombre d'items à charger)
- UX (pas de feed trop long)

### 6. Vector Search (FAISS)
**Hypothèse** : FAISS local en v1 (pas de service externe).

**Justification** :
- Coût (gratuit)
- Contrôle (pas de dépendance externe)
- Performance acceptable pour débuter

**Limites** :
- Ne scale pas horizontalement nativement
- Migration vers solution cloud (Pinecone, Weaviate) en cas de besoin

### 7. Pas d'Authentification
**Hypothèse** : Le microservice ne gère pas l'authentification.

**Justification** :
- Séparation des responsabilités
- L'authentification est gérée par le BFF/API Gateway
- Le service reçoit uniquement des user_id anonymisés

### 8. Stateless
**Hypothèse** : Le service est complètement stateless.

**Justification** :
- Scalabilité horizontale
- Pas de dépendance aux sessions
- Toute information nécessaire est dans la requête

### 9. Logs et Monitoring
**Hypothèse** : Logs explicites, pas de training ML en temps réel en v1.

**Justification** :
- Focus sur la mise en place de l'infrastructure
- Training ML sera ajouté dans une phase ultérieure
- Logs pour analyse postérieure

### 10. Données Mockées (v1)
**Hypothèse** : En développement, utilisation de données mockées.

**Justification** :
- Permet de tester l'architecture sans dépendre du backend métier
- Facilite le développement itératif

**Migration** :
- Script de synchronisation des données réelles
- Webhooks pour mises à jour en temps réel

## Prochaines Étapes

1. **Implémentation Search** : Logique de recherche hybride avec embeddings
2. **Implémentation Recommendation** : Content-based + fallback
3. **Vector Search** : Intégration FAISS pour recherche sémantique
4. **Synchronisation Données** : Script de sync depuis le backend métier
5. **Tests** : Tests unitaires et d'intégration
6. **Docker** : Containerisation du service
7. **Monitoring** : Métriques et logs structurés

