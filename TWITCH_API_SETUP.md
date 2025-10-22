# 🔧 Configuration de l'API Twitch

Pour activer la recherche intelligente sur tous les streamers Twitch, vous devez configurer l'API Twitch.

## 📝 Étape 1 : Créer une application Twitch

1. Allez sur [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Connectez-vous avec votre compte Twitch
3. Cliquez sur **"Register Your Application"**

## ⚙️ Étape 2 : Configurer l'application

Remplissez le formulaire :

- **Name** : `Twitch Viewer Mini App` (ou le nom de votre choix)
- **OAuth Redirect URLs** : 
  - `http://localhost:3000` (pour le dev local)
  - `https://votre-app.vercel.app` (pour la production)
- **Category** : `Website Integration`

Cliquez sur **Create**.

## 🔑 Étape 3 : Récupérer les credentials

1. Une fois l'app créée, cliquez dessus pour voir les détails
2. Vous verrez :
   - **Client ID** : Une longue chaîne (ex: `abc123xyz456...`)
   - **Client Secret** : Cliquez sur **"New Secret"** pour en générer un

⚠️ **Important** : Copiez le Client Secret immédiatement, il ne sera affiché qu'une seule fois !

## 📋 Étape 4 : Ajouter à votre .env.local

Créez/éditez le fichier `.env.local` à la racine du projet :

```env
# OnchainKit
NEXT_PUBLIC_ONCHAINKIT_API_KEY=votre_key

# App URL
NEXT_PUBLIC_URL=http://localhost:3000

# Twitch API
TWITCH_CLIENT_ID=votre_client_id_ici
TWITCH_CLIENT_SECRET=votre_client_secret_ici
```

⚠️ **Ne committez JAMAIS ce fichier** ! Il est déjà dans `.gitignore`.

## 🧪 Étape 5 : Tester

1. Redémarrez le serveur :
```bash
npm run dev
```

2. Allez sur [http://localhost:3000](http://localhost:3000)

3. Tapez dans la barre de recherche : **"inox"**

4. Vous devriez voir apparaître **"inoxtag"** dans les suggestions ! 🎉

## 🎯 Comment ça marche ?

### Architecture

```
User tape "inox"
    ↓
Frontend (debounce 300ms)
    ↓
/api/twitch/search?q=inox
    ↓
Twitch API (avec vos credentials)
    ↓
Résultats filtrés
    ↓
Affichage avec badge LIVE
```

### Endpoints utilisés

- **Token** : `https://id.twitch.tv/oauth2/token`
- **Search** : `https://api.twitch.tv/helix/search/channels`

### Caching

Le token d'authentification est **caché pendant 50 minutes** pour éviter de le redemander à chaque recherche.

## 🌐 Déploiement sur Vercel

### Variables d'environnement

Ajoutez les credentials Twitch sur Vercel :

```bash
vercel env add TWITCH_CLIENT_ID production
# Collez votre Client ID

vercel env add TWITCH_CLIENT_SECRET production
# Collez votre Client Secret
```

### Mettre à jour l'OAuth Redirect

1. Retournez sur [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Éditez votre application
3. Ajoutez votre URL Vercel dans **OAuth Redirect URLs** :
   ```
   https://votre-app.vercel.app
   ```
4. Sauvegardez

### Redéployer

```bash
vercel --prod
```

## 🔍 Fonctionnalités de recherche

### Ce qui est affiché

Pour chaque streamer trouvé :
- ✅ **Nom du channel** (display name)
- ✅ **Jeu joué** (si disponible)
- ✅ **Badge LIVE** (🔴 si en direct)
- ✅ **Icône** : 🔴 si live, 📺 sinon

### Limite de résultats

- **Maximum 8 suggestions** par recherche
- Triées par pertinence (algorithme Twitch)

### Debounce

- La recherche attend **300ms** après votre dernière frappe
- Évite de spammer l'API Twitch

## 🐛 Dépannage

### "Twitch API not configured"

**Cause** : Les variables d'environnement ne sont pas définies

**Solution** :
1. Vérifiez que `.env.local` existe
2. Vérifiez que les valeurs sont bien renseignées
3. Redémarrez le serveur : `npm run dev`

### Aucune suggestion ne s'affiche

**Vérifiez** :
1. Vous avez tapé au moins **2 caractères**
2. Les credentials sont corrects
3. Regardez la console browser (F12) pour les erreurs
4. Regardez les logs serveur dans votre terminal

### "Failed to get Twitch token"

**Cause** : Client ID ou Secret incorrect

**Solution** :
1. Vérifiez vos credentials sur [Twitch Dev Console](https://dev.twitch.tv/console/apps)
2. Regénérez un nouveau Client Secret si nécessaire
3. Mettez à jour `.env.local`

### Rate limiting

Si vous faites trop de requêtes :
- Twitch peut temporairement bloquer votre IP
- Attendez quelques minutes
- Le debounce de 300ms aide à éviter ça

## 📊 Limites de l'API Twitch

### Gratuit (App Access Token)

- ✅ **800 requêtes par minute**
- ✅ Suffisant pour une mini-app
- ✅ Pas besoin d'authentification utilisateur

### Payant non nécessaire

Pour cette mini-app, le tier gratuit est **largement suffisant** !

## 🚀 Améliorations possibles

### 1. Cache côté client

```typescript
const cachedResults = new Map<string, TwitchChannel[]>();

if (cachedResults.has(query)) {
  setSuggestions(cachedResults.get(query)!);
  return;
}
```

### 2. Afficher les vignettes

```tsx
<img 
  src={channel.thumbnailUrl} 
  alt={channel.displayName}
  className={styles.thumbnail}
/>
```

### 3. Filtrer par catégorie

```typescript
// Uniquement les streamers en live
const liveOnly = channels.filter(c => c.isLive);

// Uniquement un jeu spécifique
const gameChannels = channels.filter(c => 
  c.gameName === "Just Chatting"
);
```

## 📚 Documentation Twitch

- [API Reference](https://dev.twitch.tv/docs/api/reference)
- [Search Channels](https://dev.twitch.tv/docs/api/reference/#search-channels)
- [Authentication](https://dev.twitch.tv/docs/authentication)

## ✅ Checklist

- [ ] Application créée sur Twitch Dev Console
- [ ] Client ID et Secret copiés
- [ ] `.env.local` configuré
- [ ] Serveur redémarré
- [ ] Recherche testée avec "inox" → "inoxtag"
- [ ] Badge LIVE visible pour les streams en direct

---

**Votre recherche intelligente est maintenant active ! 🎉**

Tapez n'importe quel nom de streamer et les suggestions apparaîtront dynamiquement depuis l'API Twitch !

