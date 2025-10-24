# 💸 Guide du Tipping WaveTip

## 🎯 Vue d'ensemble

WaveTip permet aux utilisateurs de **tipper des streamers Twitch avec de l'USDC** sur **Base Sepolia**. Tous les tips sont envoyés au smart contract `0xD0c8Ca68cc81fF4486d5D725fCE612ddFeb0672D`.

---

## 🏗️ Architecture

```
User Wallet → Approve USDC → WaveTip Contract
                              ↓
                    tip(streamerTag, tipType, amount)
                              ↓
                    Contract stocke USDC + metadata
```

---

## 📝 Signature du contrat

### Fonction `tip()`

```solidity
function tip(
    string calldata streamerTag,  // ex: "lofigirl"
    string calldata tipType,      // ex: "donation"
    uint256 amount                // ex: 1000000 (1 USDC = 6 decimals)
) external
```

### Paramètres

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `streamerTag` | string | Nom du streamer (lowercase) | `"lofigirl"` |
| `tipType` | string | Type de tip | `"donation"`, `"subscription"`, `"support"`, `"gift"` |
| `amount` | uint256 | Montant en USDC (6 decimals) | `1000000` (= 1 USDC) |

---

## ⚙️ Configuration

### Contrats sur Base Sepolia

```javascript
const WAVETIP_CONTRACT = "0xD0c8Ca68cc81fF4486d5D725fCE612ddFeb0672D";
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const CHAIN_ID = 84532;
```

### RPC & Explorer

```javascript
const RPC_URL = "https://sepolia.base.org";
const EXPLORER = "https://sepolia.basescan.org";
```

---

## 🚀 Utilisation dans l'app

### 1. Connexion du wallet

L'utilisateur doit d'abord connecter son wallet dans l'onglet **Profile** de l'app.

```typescript
// app/page.tsx - Profile Tab
<Wallet>
  <ConnectWallet>
    <Avatar />
    <Name />
  </ConnectWallet>
</Wallet>
```

### 2. Regarder un stream

L'utilisateur recherche un streamer (ex: "lofigirl") et accède à la page `/lofigirl`.

### 3. Envoyer un tip

Sur la page du stream, l'utilisateur peut choisir :
- **Montants fixes** : $1, $2, $5
- **Montant custom** : Montant libre

```typescript
// app/[channel]/page.tsx
const handleTip = async (amount: string) => {
  const amountInWei = parseUnits(amount, 6); // 1 → 1000000
  
  writeContract({
    address: WAVETIP_CONTRACT,
    abi: WAVETIP_ABI,
    functionName: 'tip',
    args: [channel, 'donation', amountInWei]
  });
};
```

### 4. Approval USDC

⚠️ **IMPORTANT** : L'utilisateur doit avoir **approuvé** le contrat WaveTip à dépenser ses USDC.

Actuellement, l'approval doit être fait **manuellement avant** (via Etherscan ou script).

**TODO** : Ajouter une vérification d'allowance et demander l'approve automatiquement dans l'UI.

---

## 🧪 Tests

### Test manuel avec Node.js

Un script de test est fourni : `test-tip.js`

```bash
# Installer ethers.js
npm install --save-dev ethers@5.7.2

# Lancer le test
node test-tip.js
```

Le script va :
1. ✅ Vérifier la balance ETH (pour le gas)
2. ✅ Vérifier la balance USDC
3. ✅ Vérifier l'allowance USDC
4. ✅ Approuver si nécessaire
5. ✅ Envoyer un tip de 1 USDC
6. ✅ Afficher les statistiques

### Résultat du test

```
🚀 Test WaveTip - Envoi de 1 USDC

📡 Connexion à Base Sepolia...
✅ Wallet connecté: 0xf6d3C9Ed2115A5197F96f6189F6D63B51022Fe16
💰 Balance ETH: 0.019996818799447068 ETH

💵 Vérification de la balance USDC...
✅ Balance USDC: 8.5 USDC

🎯 Paramètres du tip:
   Streamer: lofigirl
   Type: donation
   Montant: 1 USDC

🔐 Vérification de l'allowance USDC...
   Allowance actuelle: 1000.0 USDC
✅ Allowance suffisante

💸 Envoi du tip...
   Tx hash: 0x38fdc744177ca91161c98a86325da7ed521f20cf330a27ea87fb5a3938e7cc12
   Explorer: https://sepolia.basescan.org/tx/0x38fdc744177ca91161c98a86325da7ed521f20cf330a27ea87fb5a3938e7cc12
✅ Tip envoyé avec succès! (Block 32779356)

📊 Statistiques:
   Balance du contrat: 1.5 USDC
   Nombre total de tips: 2
```

---

## 📋 Checklist pour l'intégration complète

### ✅ Fait
- [x] ABI correct pour le contrat WaveTip
- [x] Fonction `tip()` avec les bons paramètres
- [x] Script de test fonctionnel
- [x] UI pour choisir le montant du tip
- [x] Connexion wallet via OnchainKit
- [x] Affichage du status de transaction

### ⏳ À faire
- [ ] Vérification automatique de l'allowance USDC
- [ ] Demande d'approve automatique si nécessaire
- [ ] Affichage de la balance USDC de l'utilisateur
- [ ] Historique des tips envoyés
- [ ] Affichage du total des tips par streamer
- [ ] Notification de succès avec confettis 🎉
- [ ] Gestion d'erreur améliorée (messages personnalisés)

---

## 🔧 Fonctions du contrat disponibles

### Lecture (view)

```solidity
// Total des tips pour un streamer
function totalTipsByStreamer(string calldata streamerTag) view returns (uint256)

// Balance USDC du contrat
function contractUSDCBalance() view returns (uint256)

// Nombre total de tips
function totalTipsCount() view returns (uint256)

// Récupérer un tip par index
function getTip(uint256 index) view returns (
    address sender,
    uint256 amount,
    string memory streamerTag,
    string memory tipType,
    uint256 timestamp
)

// Vérifier l'owner
function owner() view returns (address)
```

### Écriture (payable/nonpayable)

```solidity
// Envoyer un tip
function tip(string calldata streamerTag, string calldata tipType, uint256 amount) external

// Retirer tous les fonds (owner uniquement)
function withdrawAll() external
```

---

## 💡 Exemples de code

### Vérifier l'allowance et approuver

```typescript
import { parseUnits } from 'viem';
import { useReadContract, useWriteContract } from 'wagmi';

// 1. Lire l'allowance
const { data: allowance } = useReadContract({
  address: USDC_ADDRESS,
  abi: USDC_ABI,
  functionName: 'allowance',
  args: [userAddress, WAVETIP_CONTRACT],
});

// 2. Approuver si nécessaire
const { writeContract: approve } = useWriteContract();

if (allowance < parseUnits('1', 6)) {
  await approve({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'approve',
    args: [WAVETIP_CONTRACT, parseUnits('1000000', 6)],
  });
}
```

### Obtenir les statistiques

```typescript
const { data: totalTips } = useReadContract({
  address: WAVETIP_CONTRACT,
  abi: WAVETIP_ABI,
  functionName: 'totalTipsByStreamer',
  args: ['lofigirl'],
});

console.log(`Total tips for lofigirl: ${formatUnits(totalTips || 0n, 6)} USDC`);
```

---

## 🌐 Liens utiles

- **Contrat WaveTip** : https://sepolia.basescan.org/address/0xD0c8Ca68cc81fF4486d5D725fCE612ddFeb0672D
- **USDC Base Sepolia** : https://sepolia.basescan.org/address/0x036CbD53842c5426634e7929541eC2318f3dCF7e
- **Base Sepolia Faucet** : https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **OnchainKit Docs** : https://onchainkit.xyz

---

## 🐛 Debugging

### Erreur : "Transfer failed"

Vérifier que :
1. L'utilisateur a assez d'USDC
2. L'allowance est suffisante
3. L'utilisateur a assez d'ETH pour le gas

### Erreur : "User rejected transaction"

L'utilisateur a annulé la transaction dans son wallet.

### Erreur : "Insufficient funds"

Pas assez d'ETH pour payer le gas ou pas assez d'USDC.

---

## 📞 Support

Pour toute question ou problème :
- Vérifier la transaction sur BaseScan
- Consulter les logs de la console
- Tester avec le script `test-tip.js`

---

**Built with ❤️ on Base**

