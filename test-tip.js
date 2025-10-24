/**
 * Script de test WaveTip
 * Envoie 1 USDC à un streamer via le contrat WaveTip
 */

const { ethers } = require('ethers');

// Configuration Base Sepolia
const CONFIG = {
  rpcUrl: 'https://sepolia.base.org',
  chainId: 84532,
  waveTipContract: '0xD0c8Ca68cc81fF4486d5D725fCE612ddFeb0672D',
  usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  privateKey: '0x47b0a088fc62101d8aefc501edec2266ff2fc4cf84c93a8e6c315dedb0d942be'
};

// ABIs
const USDC_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

const WAVETIP_ABI = [
  'function tip(string calldata streamerTag, string calldata tipType, uint256 amount) external',
  'function totalTipsByStreamer(string calldata streamerTag) view returns (uint256)',
  'function contractUSDCBalance() view returns (uint256)',
  'function totalTipsCount() view returns (uint256)'
];

async function main() {
  console.log('🚀 Test WaveTip - Envoi de 1 USDC\n');
  console.log('='.repeat(60));

  // 1. Connexion au réseau
  console.log('\n📡 Connexion à Base Sepolia...');
  const provider = new ethers.providers.JsonRpcProvider(CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(CONFIG.privateKey, provider);
  
  console.log(`✅ Wallet connecté: ${wallet.address}`);
  
  // Vérifier la balance ETH pour le gas
  const ethBalance = await wallet.getBalance();
  console.log(`💰 Balance ETH: ${ethers.utils.formatEther(ethBalance)} ETH`);
  
  if (ethBalance.isZero()) {
    console.error('❌ Pas assez d\'ETH pour le gas!');
    console.log('💡 Récupère du ETH sur: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet');
    return;
  }

  // 2. Initialiser les contrats
  const usdcContract = new ethers.Contract(CONFIG.usdcAddress, USDC_ABI, wallet);
  const waveTipContract = new ethers.Contract(CONFIG.waveTipContract, WAVETIP_ABI, wallet);

  // 3. Vérifier la balance USDC
  console.log('\n💵 Vérification de la balance USDC...');
  const usdcBalance = await usdcContract.balanceOf(wallet.address);
  const usdcBalanceFormatted = ethers.utils.formatUnits(usdcBalance, 6);
  console.log(`✅ Balance USDC: ${usdcBalanceFormatted} USDC`);
  
  if (usdcBalance.isZero()) {
    console.error('❌ Pas d\'USDC disponible!');
    console.log('💡 Récupère de l\'USDC depuis un faucet Base Sepolia');
    return;
  }

  // 4. Paramètres du tip
  const streamerTag = 'lofigirl'; // Nom du streamer
  const tipType = 'donation';
  const tipAmount = ethers.utils.parseUnits('1', 6); // 1 USDC
  
  console.log('\n🎯 Paramètres du tip:');
  console.log(`   Streamer: ${streamerTag}`);
  console.log(`   Type: ${tipType}`);
  console.log(`   Montant: 1 USDC`);

  // 5. Vérifier et approuver USDC si nécessaire
  console.log('\n🔐 Vérification de l\'allowance USDC...');
  const allowance = await usdcContract.allowance(wallet.address, CONFIG.waveTipContract);
  console.log(`   Allowance actuelle: ${ethers.utils.formatUnits(allowance, 6)} USDC`);
  
  if (allowance.lt(tipAmount)) {
    console.log('⏳ Approval USDC nécessaire...');
    const approveTx = await usdcContract.approve(
      CONFIG.waveTipContract,
      ethers.utils.parseUnits('1000000', 6) // Approve 1M USDC pour éviter de réapprouver
    );
    console.log(`   Tx hash: ${approveTx.hash}`);
    console.log('   Attente de confirmation...');
    await approveTx.wait();
    console.log('✅ USDC approuvé!');
  } else {
    console.log('✅ Allowance suffisante');
  }

  // 6. Envoyer le tip
  console.log('\n💸 Envoi du tip...');
  try {
    const tipTx = await waveTipContract.tip(streamerTag, tipType, tipAmount);
    console.log(`   Tx hash: ${tipTx.hash}`);
    console.log(`   Explorer: https://sepolia.basescan.org/tx/${tipTx.hash}`);
    console.log('   Attente de confirmation...');
    
    const receipt = await tipTx.wait();
    console.log(`✅ Tip envoyé avec succès! (Block ${receipt.blockNumber})`);
    
    // 7. Vérifier le total pour ce streamer
    console.log('\n📊 Statistiques:');
    const totalForStreamer = await waveTipContract.totalTipsByStreamer(streamerTag);
    console.log(`   Total pour ${streamerTag}: ${ethers.utils.formatUnits(totalForStreamer, 6)} USDC`);
    
    const totalTipsCount = await waveTipContract.totalTipsCount();
    console.log(`   Nombre total de tips: ${totalTipsCount.toString()}`);
    
    const contractBalance = await waveTipContract.contractUSDCBalance();
    console.log(`   Balance du contrat: ${ethers.utils.formatUnits(contractBalance, 6)} USDC`);
    
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'envoi du tip:');
    console.error(error.message);
    
    if (error.error && error.error.message) {
      console.error('Détails:', error.error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Test terminé!\n');
}

// Exécution
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });

