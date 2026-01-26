# 📊 Tableau de Bord - Gestion des Temps Supabase

Ce projet est un tableau de bord minimaliste (Single Page App) pour visualiser les données de temps exportées depuis Pennylane.

## 🚀 Architecture
- **Pennylane** : Source de données.
- **n8n** : Automatisation et calcul des anomalies.
- **Supabase** : Base de données (PostgreSQL) et Authentification (SSO Microsoft).
- **GitHub Pages** : Hébergement du tableau de bord.

## 🛠 Installation / Déploiement
1. Le fichier principal est `index.html`.
2. Il se connecte directement à Supabase via l'API publique (sécurisée par RLS).
3. L'authentification se fait via Microsoft Azure AD.

## 🔑 Configuration
Les clés Supabase sont demandées au premier lancement et stockées localement dans le navigateur.
