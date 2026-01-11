# 🔄 DEV vs PROD - Guide d'Implémentation

## Vue d'ensemble

Le microservice fonctionne en deux modes selon l'environnement :

- **DEV** : Mode développement avec données mockées et fonctionnalités simplifiées
- **PROD** : Mode production avec toutes les fonctionnalités complètes

## 🧪 Mode DEV

### Ce qui fonctionne en DEV :

✅ **Tous les endpoints principaux**
- `/feed` : Fonctionne avec données mockées
- `/search` : Recherche par mots-clés + recherche sémantique mockée
- `/recommend` : Recommandations avec données mockées
- `/track` : Tracking et mise à jour des compteurs

✅ **Données mockées**
- Script de seeding avec 50 items, 5 tailleurs, 100 événements
- Endpoints `/dev/seed`, `/dev/stats`, `/dev/reset`

✅ **Recherche sémantique mockée**
- FAISS optionnel (pas nécessaire en DEV)
- Si FAISS non installé, utilisation d'embeddings mockés
- Recherche vectorielle simulée

### Avantages du mode DEV :

- Démarrage rapide sans dépendances lourdes
- Pas besoin de FAISS (peut être commenté dans requirements.txt)
- Données réalistes mais générées automatiquement
- Test de tous les endpoints sans infrastructure complexe

## 🚀 Mode PROD

### Ce qui doit être implémenté pour PROD :

⏳ **Intégration FAISS complète**
- Installation de FAISS (`faiss-cpu` ou `faiss-gpu`)
- Génération réelle des embeddings (sentence-transformers)
- Index FAISS persistant avec mapping item_id ↔ index
- Synchronisation des embeddings lors de l'ajout/modification d'items

⏳ **Synchronisation des données**
- Script de synchronisation depuis le backend métier
- Webhooks pour mises à jour en temps réel
- Event sourcing (optionnel, avancé)

⏳ **Génération d'embeddings**
- Service d'embedding (ex: sentence-transformers all-MiniLM-L6-v2)
- Pipeline de génération pour nouveaux items
- Mise à jour des embeddings lors de modifications

## 📋 Checklist Migration DEV → PROD

### 1. FAISS & Embeddings

- [ ] Installer FAISS (`faiss-cpu` ou `faiss-gpu`)
- [ ] Implémenter le service d'embedding (sentence-transformers)
- [ ] Créer le pipeline de génération d'embeddings
- [ ] Implémenter le mapping item_id ↔ index FAISS
- [ ] Charger/sauvegarder l'index FAISS
- [ ] Tester la recherche sémantique avec vrais embeddings

### 2. Synchronisation des Données

- [ ] Créer script de synchronisation batch
- [ ] Implémenter les webhooks depuis le backend métier
- [ ] Synchroniser items, tailleurs, événements
- [ ] Gérer les mises à jour incrémentielles
- [ ] Valider la cohérence des données

### 3. Performance

- [ ] Optimiser les requêtes SQL (indexes)
- [ ] Mettre en cache les résultats fréquents (Redis)
- [ ] Optimiser la recherche vectorielle (faire des batch)
- [ ] Monitoring et logging

### 4. Sécurité

- [ ] Désactiver les endpoints DEV (`ENVIRONMENT=production`)
- [ ] Configurer CORS correctement
- [ ] Validation stricte des inputs
- [ ] Rate limiting

## 🎯 Recommandation

**Pour le DEV actuel :**
- ✅ Utiliser les données mockées (suffisant pour tester)
- ✅ Laisser FAISS optionnel (mode mock fonctionne)
- ⏳ Laisser la synchronisation pour plus tard (dépend du backend métier)

**Pour la PROD :**
- Implémenter FAISS avec vrais embeddings
- Créer les scripts de synchronisation
- Configurer les webhooks

## 💡 Stratégie de Migration Progressive

1. **Phase 1 (DEV actuel)** : Tester avec données mockées ✅
2. **Phase 2 (Backend prêt)** : Implémenter la synchronisation
3. **Phase 3 (ML prêt)** : Intégrer FAISS avec vrais embeddings
4. **Phase 4 (PROD)** : Optimisation et monitoring

L'architecture actuelle permet cette migration progressive sans refactoring majeur.

