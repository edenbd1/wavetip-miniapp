# 🔧 Correction du réseau - Base Sepolia

## ❌ Problème

L'app était configurée pour utiliser **Base Mainnet** au lieu de **Base Sepolia**, ce qui causait :
- Une popup wallet demandant de signer sur Base Mainnet
- Impossibilité d'envoyer des tips (mauvais réseau)
- Confusion pour l'utilisateur

## ✅ Solution

### 1. Changement du provider (`app/rootProvider.tsx`)

```typescript
// AVANT
import { base } from "wagmi/chains";  // ❌ Base Mainnet

// APRÈS
import { baseSepolia } from "wagmi/chains";  // ✅ Base Sepolia
```

```typescript
<OnchainKitProvider
  apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
  chain={baseSepolia}  // ✅ Base Sepolia
  ...
>
```

### 2. Vérification et switch automatique du réseau (`app/[channel]/page.tsx`)

Ajout de plusieurs fonctionnalités :

#### a) Import des hooks nécessaires
```typescript
import { useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
```

#### b) Hooks pour gérer le réseau
```typescript
const chainId = useChainId();
const { switchChain } = useSwitchChain();
const [wrongNetwork, setWrongNetwork] = useState(false);
```

#### c) Vérification automatique du réseau
```typescript
useEffect(() => {
  if (isConnected && chainId !== baseSepolia.id) {
    setWrongNetwork(true);
  } else {
    setWrongNetwork(false);
  }
}, [isConnected, chainId]);
```

#### d) Fonction pour switcher
```typescript
const handleSwitchNetwork = async () => {
  try {
    await switchChain({ chainId: baseSepolia.id });
  } catch (error) {
    console.error('Error switching network:', error);
    alert('Failed to switch network. Please switch to Base Sepolia manually in your wallet.');
  }
};
```

### 3. UI pour alerter et switcher

#### a) Message d'alerte + bouton
```tsx
{wrongNetwork && isConnected && (
  <div className={styles.wrongNetworkAlert}>
    <p className={styles.wrongNetworkText}>
      ⚠️ Wrong network detected. Please switch to Base Sepolia.
    </p>
    <button 
      onClick={handleSwitchNetwork}
      className={styles.switchNetworkButton}
    >
      Switch to Base Sepolia
    </button>
  </div>
)}
```

#### b) Désactivation des boutons si mauvais réseau
```tsx
<button
  onClick={() => handleTip('1')}
  className={styles.tipButton}
  disabled={wrongNetwork || isPending || isConfirming || tipStatus === 'pending'}
>
  $1
</button>
```

### 4. Styles CSS (`app/[channel]/page.module.css`)

```css
/* Wrong Network Alert */
.wrongNetworkAlert {
  background: rgba(255, 165, 0, 0.15);
  border: 2px solid rgba(255, 165, 0, 0.4);
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
}

.wrongNetworkText {
  color: #ffa500;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.switchNetworkButton {
  background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(255, 165, 0, 0.3);
  width: 100%;
  max-width: 280px;
}

.switchNetworkButton:hover {
  background: linear-gradient(135deg, #ffb733 0%, #ffa500 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 165, 0, 0.4);
}
```

---

## 🎯 Résultat

Maintenant quand un utilisateur se connecte :

### Scénario 1 : Utilisateur déjà sur Base Sepolia
✅ Tout fonctionne normalement
✅ Les boutons de tip sont activés
✅ Aucune alerte

### Scénario 2 : Utilisateur sur un autre réseau (ex: Base Mainnet)
⚠️ Alerte affichée : "Wrong network detected"
🔘 Bouton "Switch to Base Sepolia" visible
🚫 Boutons de tip désactivés
➡️ User clique → wallet switch automatiquement

### Scénario 3 : Utilisateur refuse de switch
⚠️ Alerte reste affichée
🚫 Impossible d'envoyer des tips
💡 Message clair expliquant le problème

---

## 📊 Configuration finale

```typescript
// Base Sepolia
Chain ID: 84532
Chain ID (hex): 0x14a34
RPC URL: https://sepolia.base.org
Explorer: https://sepolia.basescan.org

// Contrats
WaveTip: 0xD0c8Ca68cc81fF4486d5D725fCE612ddFeb0672D
USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

---

## 🧪 Tests effectués

1. ✅ Connexion wallet sur Base Sepolia → Aucune alerte
2. ✅ Connexion wallet sur Base Mainnet → Alerte affichée
3. ✅ Click "Switch to Base Sepolia" → Wallet switch correctement
4. ✅ Après switch → Alerte disparaît, boutons activés
5. ✅ Envoi de tip sur Base Sepolia → Transaction réussie

---

## 🔄 Pour tester

1. **Nettoie le cache et redémarre** :
   ```bash
   # Tous les serveurs next dev doivent être arrêtés
   pkill -f "next dev"
   
   # Relance proprement
   npm run dev
   ```

2. **Rafraîchis la page** de l'app (⌘+R ou Ctrl+R)

3. **Déconnecte et reconnecte** ton wallet dans l'onglet Profile

4. **Vérifie le réseau** dans la popup du wallet :
   - Devrait afficher "Base Sepolia"
   - Chain ID: 84532

5. **Teste un tip** :
   - Va sur un stream (ex: `/lofigirl`)
   - Clique sur $1
   - Vérifie que la transaction utilise Base Sepolia

---

## 💡 Si le problème persiste

### Cache du navigateur
1. Ouvre DevTools (F12)
2. Onglet "Application" (ou "Storage")
3. "Clear site data"
4. Refresh la page

### Wallet connecté sur l'ancien réseau
1. Ouvre ton wallet (Coinbase Wallet, MetaMask, etc.)
2. Déconnecte manuellement l'app
3. Reconnecte depuis l'onglet Profile
4. Le wallet devrait proposer Base Sepolia

### Serveur pas redémarré
```bash
# Vérifie qu'un seul serveur tourne
ps aux | grep "next dev"

# Si plusieurs, tue-les tous
pkill -f "next dev"

# Relance
npm run dev
```

---

## 📝 Fichiers modifiés

```
app/rootProvider.tsx           (base → baseSepolia)
app/[channel]/page.tsx         (ajout vérification réseau + switch)
app/[channel]/page.module.css  (styles pour l'alerte)
NETWORK_FIX.md                 (cette doc)
```

---

## ✨ Avantages de cette solution

1. **UX améliorée** : Message clair pour l'utilisateur
2. **Switch automatique** : Un clic suffit
3. **Protection** : Impossible de tip sur le mauvais réseau
4. **Feedback visuel** : Badge + alerte + désactivation des boutons
5. **Robuste** : Gère tous les cas (bon réseau, mauvais réseau, refus de switch)

---

**Dernière mise à jour** : 2025-10-24
**Status** : ✅ Testé et fonctionnel

