# Plan de Pivot Stratégique : Signare Brand & Agents

## 1. Vision : De "Marketplace" à "Maison de Couture Tech"
**Objectif** : Positionner Signare non plus comme une place de marché ouverte (type Etsy) mais comme une **Marque Digitale unifiée** (type Sézane ou Farfetch, mais pour le sur-mesure africain). Les tailleurs deviennent des "Partenaires de production" invisibles ou labellisés "Ateliers Signare", garantissant une qualité uniforme.

### Changements Structurels :
- **Architecture Hybride** : Conservation du **Feed Social** pour la viralité (la "Grande Armée" de créateurs), mais superposé d'une couche "Garantie Signare" pour la transaction.
- **Catalogue Intelligent** : Les produits du feed sont automatiquement catégorisés par l'IA.

---

## 2. Architecture Agentique (The "Brain" of Signare)
Introduction de trois agents autonomes.

### Agent A : "Le Maître Tailleur" (Assistant de Mesure)
**Mission** : Garantir la prise de mesure parfaite à distance.
- *Voir section précédente...*

### Agent B : "Le Concierge" (Service Client & Vente)
**Mission** : Vendre, rassurer et gérer le SAV.
- *Voir section précédente...*

### Agent C : "Le Chasseur de Tendances" (Pinterest Bot) (NOUVEAU)
**Mission** : Scanner le web pour anticiper la mode.
- **Action** : Scrappe Pinterest/Instagram pour identifier les tendances "Afro-Chic".
- **Twin Creation** : Génère des "Jumeaux Numériques" (Digital Twins) de ces tenues.
- **Matching** : Propose aux tailleurs de réaliser ces modèles en cas de commande ("Ce modèle trend à Dakar, pouvez-vous le faire ?").

---

## 3. Plan d'Action UI/UX (Modifications Requises)

### A. Homepage (`/`)
- **Avant** : Feed social infini (type Instagram).
- **Après** : **Vitrine de Marque**.
    - Hero Section : "L'Élégance Sur-Mesure par IA".
    - Collections en vedette.
    - Call-to-Action : "Créer ma tenue (IA)".

### B. Page Messages (`/messages`)
- **Avant** : Liste de contacts (Tailleurs).
- **Après** : **Conversation Unique "Concierge Signare"**.
    - L'utilisateur parle à Signare. En coulisse, c'est l'Agent IA + BD.

### C. Page Atelier (`/atelier`)
- **Avant** : Formulaire de données.
- **Après** : **Expérience Immersive**.
    - "Démarrer une session de mesure".
    - Interface Chat/Voice guidée.

---

## 4. Stack Technique Proposée pour les Agents
- **Orchestration** : LangChain ou LangGraph (Python).
- **LLM** : GPT-4o (pour la vision et le dialogue naturel fluide).
- **Vector Store** : Supabase `pgvector` (pour la mémoire des conversations et la base de connaissances FAQ/Produits).
- **Backend** : Les services existants (`Signare_Measurements`) deviennent des "Outils" (Tools) appelés par les agents.
- **Data-First (CRITIQUE)** : Architecture "ML-Ready" obligatoire.
    - **Tracking** : Chaque clic, messure, et interaction de chat est loggée (`user_interactions`).
    - **Training** : Les données alimentent le Fine-Tuning des modèles (ex: préférences de style, ajustements de coupe).
    - **Pipeline** : Ingestion temps-réel vers Supabase pour analytics et réentraînement futur.
