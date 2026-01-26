# 🚀 Guide d'hébergement gratuit pour n8n

## 📌 Le problème des plateformes cloud "gratuites"

Après vérification, **aucune plateforme cloud n'offre un hébergement vraiment gratuit** pour n8n :

| Plateforme | Réalité |
|------------|---------|
| ❌ **Render** | Free tier limité à 30 jours |
| ❌ **Railway** | Essai limité à 30 jours OU 5$ de crédit |
| ❌ **Koyeb** | Système de crédits (200$) + PostgreSQL requis |
| ❌ **Fly.io** | Carte bancaire requise |
| ❌ **Oracle Cloud** | Carte bancaire requise |

---

## ✅ La seule solution vraiment gratuite : Self-hosting

### 🏠 Héberger n8n sur votre propre machine

**C'est la seule option 100% gratuite, sans limite de temps et sans carte bancaire.**

**Ce dont vous avez besoin :**
- Une machine qui peut rester allumée (PC, serveur, Raspberry Pi)
- Docker installé
- Une connexion internet stable
- (Optionnel) Un accès depuis l'extérieur via tunnel

---

## 🛠️ Guide de déploiement complet

### Étape 1 : Installer Docker

#### Sur Windows :
1. Télécharger [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Installer et redémarrer
3. Vérifier : `docker --version`

#### Sur Linux (Ubuntu/Debian) :
```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Redémarrer la session
```

#### Sur Raspberry Pi :
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker pi
```

---

### Étape 2 : Créer le fichier Docker Compose

Créer un dossier pour n8n :
```bash
mkdir n8n && cd n8n
```

Créer le fichier `docker-compose.yml` :
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      # Authentification (IMPORTANT pour la sécurité)
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=VotreMotDePasseSecurise123!
      
      # Configuration
      - GENERIC_TIMEZONE=Europe/Paris
      - N8N_DEFAULT_LOCALE=fr
      
      # Webhook (si accès externe)
      # - WEBHOOK_URL=https://votre-domaine.com/
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

> ⚠️ **IMPORTANT** : Changez le mot de passe `VotreMotDePasseSecurise123!` par un mot de passe fort !

---

### Étape 3 : Lancer n8n

```bash
docker-compose up -d
```

**Vérifier que ça fonctionne :**
```bash
docker-compose ps
```

**Voir les logs :**
```bash
docker-compose logs -f n8n
```

---

### Étape 4 : Accéder à n8n

**En local :**
- Ouvrir un navigateur : **http://localhost:5678**
- Se connecter avec les identifiants configurés

---

## 🌐 Accès depuis l'extérieur (optionnel)

Si vous avez besoin d'accéder à n8n depuis l'extérieur (webhooks, accès mobile, etc.), vous avez plusieurs options :

### Option 1 : Cloudflare Tunnel (Recommandé - Gratuit)

**Avantages :**
- ✅ 100% gratuit
- ✅ Pas besoin d'ouvrir de ports
- ✅ HTTPS automatique
- ✅ Protection DDoS incluse

**Installation :**

1. Créer un compte [Cloudflare](https://dash.cloudflare.com/sign-up) (gratuit)
2. Ajouter un domaine (ou utiliser un sous-domaine gratuit)
3. Installer cloudflared :

**Windows :**
```powershell
# Télécharger depuis https://github.com/cloudflare/cloudflared/releases
# Ou avec winget :
winget install Cloudflare.cloudflared
```

**Linux :**
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
```

4. Créer un tunnel :
```bash
cloudflared tunnel login
cloudflared tunnel create n8n
cloudflared tunnel route dns n8n n8n.votre-domaine.com
```

5. Configurer le tunnel (`~/.cloudflared/config.yml`) :
```yaml
tunnel: <ID-DU-TUNNEL>
credentials-file: ~/.cloudflared/<ID-DU-TUNNEL>.json

ingress:
  - hostname: n8n.votre-domaine.com
    service: http://localhost:5678
  - service: http_status:404
```

6. Lancer le tunnel :
```bash
cloudflared tunnel run n8n
```

### Option 2 : ngrok (Simple mais limité)

**Installation :**
```bash
# Windows (avec winget)
winget install ngrok.ngrok

# Ou télécharger depuis https://ngrok.com/download
```

**Utilisation :**
```bash
ngrok http 5678
```

**Limitations du tier gratuit :**
- URL qui change à chaque redémarrage
- Limité en connexions

---

## 📅 Planifier les workflows

> 💡 **Bonne nouvelle** : Votre PC n'a pas besoin de rester allumé 24/7 !
> Pour un workflow hebdomadaire, le PC doit juste être allumé (ou se réveiller) au moment de l'exécution.

### Option 1 : Scheduler natif de n8n + PC allumé manuellement

n8n a un node **Schedule Trigger** intégré qui permet de déclencher des workflows :
- Toutes les heures
- Tous les jours à une heure précise
- Chaque semaine (ex: tous les vendredis à 9h)
- Expression cron personnalisée

**Pour votre workflow hebdomadaire :**
1. Ouvrir n8n
2. Ajouter un node "Schedule Trigger"
3. Configurer : "Every Week" → Friday → 09:00
4. **S'assurer que le PC est allumé** le vendredi à 9h

---

### Option 2 : Réveil automatique du PC avec le Planificateur Windows (RECOMMANDÉ)

Cette option permet à votre PC de **se réveiller automatiquement depuis la veille** pour exécuter le workflow, puis de se remettre en veille.

#### Étape 1 : Créer un script de démarrage

Créer un fichier `start-n8n.bat` dans votre dossier n8n :

```batch
@echo off
REM Démarrer Docker Desktop (si pas déjà en cours)
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

REM Attendre que Docker soit prêt (60 secondes)
timeout /t 60 /nobreak

REM Aller dans le dossier n8n et démarrer les containers
cd /d C:\chemin\vers\votre\dossier\n8n
docker-compose up -d

REM Attendre que n8n soit prêt
timeout /t 30 /nobreak

REM Optionnel : ouvrir n8n dans le navigateur
start http://localhost:5678
```

> ⚠️ Remplacez `C:\chemin\vers\votre\dossier\n8n` par le chemin réel de votre dossier n8n.

#### Étape 2 : Configurer le Planificateur de tâches Windows

1. **Ouvrir le Planificateur de tâches**
   - Appuyer sur `Win + R`
   - Taper `taskschd.msc` et Entrée

2. **Créer une nouvelle tâche**
   - Cliquer sur "Créer une tâche..." (pas "Créer une tâche de base")

3. **Onglet Général**
   - Nom : `Démarrer n8n hebdomadaire`
   - Cocher : "Exécuter même si l'utilisateur n'est pas connecté"
   - Cocher : "Exécuter avec les autorisations maximales"

4. **Onglet Déclencheurs**
   - Cliquer "Nouveau..."
   - Choisir : "Chaque semaine"
   - Jour : Vendredi (ou le jour souhaité)
   - Heure : 09:00 (ou l'heure souhaitée)
   - ✅ Cocher : **"Démarrer la tâche uniquement si l'ordinateur est sur secteur"**

5. **Onglet Actions**
   - Cliquer "Nouveau..."
   - Action : "Démarrer un programme"
   - Programme : `C:\chemin\vers\votre\dossier\n8n\start-n8n.bat`

6. **Onglet Conditions** ⚠️ IMPORTANT
   - ✅ Cocher : **"Sortir l'ordinateur du mode veille pour exécuter cette tâche"**
   - Décocher : "Démarrer uniquement si l'ordinateur est sur secteur" (sauf si vous le souhaitez)

7. **Onglet Paramètres**
   - ✅ Cocher : "Autoriser l'exécution de la tâche à la demande"
   - ✅ Cocher : "Exécuter la tâche dès que possible après un démarrage planifié manqué"

8. **Enregistrer** (entrer votre mot de passe Windows si demandé)

#### Étape 3 : Configurer les options d'alimentation Windows

Pour que le PC puisse se réveiller :

1. **Panneau de configuration → Options d'alimentation**
2. Cliquer sur "Modifier les paramètres du mode"
3. Cliquer sur "Modifier les paramètres d'alimentation avancés"
4. Développer "Veille" → "Autoriser les minuteries de sortie de veille"
5. Mettre sur **"Activer"**

#### Étape 4 : Tester

1. Mettre le PC en veille manuellement
2. Attendre l'heure programmée
3. Le PC devrait se réveiller et lancer n8n automatiquement !

#### (Optionnel) Script pour remettre en veille après le workflow

Créer un fichier `stop-and-sleep.bat` :

```batch
@echo off
REM Arrêter n8n
cd /d C:\chemin\vers\votre\dossier\n8n
docker-compose down

REM Attendre 5 minutes (pour laisser le temps au workflow de finir)
timeout /t 300 /nobreak

REM Remettre en veille
rundll32.exe powrprof.dll,SetSuspendState 0,1,0
```

Vous pouvez planifier ce script pour s'exécuter 30 minutes après le premier (ex: 09:30).

---

### Option 3 : Service cron externe (si la machine n'est pas toujours allumée)

Utiliser [cron-job.org](https://cron-job.org/) (gratuit) pour déclencher un webhook n8n :
1. Créer un workflow avec un node "Webhook" dans n8n
2. Copier l'URL du webhook
3. Configurer cron-job.org pour appeler cette URL chaque semaine

> ⚠️ Cette option nécessite que le PC soit allumé au moment où le cron appelle le webhook.

---

## 🔐 Sécurité

### Bonnes pratiques essentielles :

1. **Toujours activer l'authentification**
   ```yaml
   - N8N_BASIC_AUTH_ACTIVE=true
   - N8N_BASIC_AUTH_USER=admin
   - N8N_BASIC_AUTH_PASSWORD=MotDePasseFort!
   ```

2. **Ne jamais exposer le port 5678 directement sur Internet**
   - Utiliser un tunnel (Cloudflare, ngrok)
   - Ou un reverse proxy (Nginx, Traefik)

3. **Sauvegarder régulièrement**
   ```bash
   # Les données sont dans le volume Docker
   docker cp $(docker-compose ps -q n8n):/home/node/.n8n ./backup
   ```

4. **Mettre à jour n8n régulièrement**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

---

## 💾 Sauvegarde et restauration

### Sauvegarder les workflows :

**Méthode 1 : Export via l'interface**
- n8n → Settings → Export → Download all workflows

**Méthode 2 : Copier le volume Docker**
```bash
docker cp $(docker-compose ps -q n8n):/home/node/.n8n ./n8n-backup-$(date +%Y%m%d)
```

### Restaurer :
```bash
docker cp ./n8n-backup-YYYYMMDD/. $(docker-compose ps -q n8n):/home/node/.n8n/
docker-compose restart
```

---

## ❓ FAQ

**Q : Ma machine doit-elle rester allumée 24/7 ?**
R : Pas nécessairement. Si votre workflow s'exécute une fois par semaine, votre machine doit juste être allumée à ce moment-là. Vous pouvez aussi utiliser le planificateur de tâches Windows pour allumer la machine automatiquement.

**Q : Puis-je utiliser un Raspberry Pi ?**
R : Oui ! Un Raspberry Pi 3 ou 4 est parfait pour n8n. Il consomme peu d'électricité (~5W) et peut rester allumé 24/7.

**Q : Comment recevoir des webhooks si je n'ai pas d'IP fixe ?**
R : Utilisez Cloudflare Tunnel (gratuit) - il crée un tunnel sécurisé vers votre machine sans avoir besoin d'IP fixe ni d'ouvrir de ports.

**Q : Combien ça coûte en électricité ?**
R : 
- PC classique allumé 24/7 : ~10-30€/mois
- Raspberry Pi 24/7 : ~1-2€/mois
- PC allumé quelques heures/semaine : négligeable

---

## 📚 Ressources utiles

- [Documentation officielle n8n](https://docs.n8n.io/)
- [Guide de self-hosting n8n](https://docs.n8n.io/hosting/)
- [Image Docker n8n](https://hub.docker.com/r/n8nio/n8n)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)

---

## 🎯 Conclusion

**Le self-hosting est la seule option vraiment gratuite** pour héberger n8n à long terme.

**Avantages :**
- ✅ 100% gratuit (hors électricité)
- ✅ Aucune carte bancaire
- ✅ Aucune limite de temps
- ✅ Contrôle total sur vos données
- ✅ Conformité RGPD maximale

**Inconvénients :**
- ⚠️ Nécessite une machine disponible
- ⚠️ Configuration initiale technique (mais ce guide vous aide !)

**Pour votre workflow de contrôle des temps hebdomadaire**, un simple PC ou Raspberry Pi suffit largement.

---

**Dernière mise à jour** : Janvier 2026
