"use client";
import { useParams, useRouter } from "next/navigation";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect, useState, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import styles from "./page.module.css";

// WaveTip Contract on Base Sepolia
const WAVETIP_CONTRACT = '0xD0c8Ca68cc81fF4486d5D725fCE612ddFeb0672D' as const;

// USDC Contract on Base Sepolia
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const;

// WaveTip Contract ABI (signature correcte)
const WAVETIP_ABI = [
  {
    inputs: [
      { name: 'streamerTag', type: 'string' },
      { name: 'tipType', type: 'string' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'tip',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// USDC ABI (pour l'approval et lecture)
const USDC_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'account', type: 'address' }
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default function StreamerPage() {
  const params = useParams();
  const router = useRouter();
  const { isFrameReady, setFrameReady } = useMiniKit();
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const channel = (params.channel as string).toLowerCase();
  
  // Get chainId from the connected wallet's chain
  const chainId = chain?.id || 0;
  
  // Get network name from chainId
  const getNetworkName = useCallback((id: number) => {
    const networks: { [key: number]: string } = {
      1: 'Ethereum Mainnet',
      5: 'Goerli',
      11155111: 'Sepolia',
      8453: 'Base Mainnet',
      84532: 'Base Sepolia',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
    };
    return networks[id] || `Unknown Network (${id})`;
  }, []);

  const isCorrectNetwork = chainId === 84532; // Base Sepolia
  
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [tipStatus, setTipStatus] = useState<'idle' | 'pending' | 'approving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [txStartTime, setTxStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [optimisticBalance, setOptimisticBalance] = useState<bigint | null>(null);
  const [pendingTipAmount, setPendingTipAmount] = useState<bigint | null>(null);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
    timeout: 60000, // 60 secondes max
  });

  // Lire l'allowance USDC
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, WAVETIP_CONTRACT] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Lire la balance USDC
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Auto-switch to Base Sepolia when wallet connects
  useEffect(() => {
    if (isConnected && chainId > 0) {
      console.log(`📡 Connected wallet - chainId: ${chainId}, chain name: ${chain?.name || 'unknown'}`);
      console.log(`🎯 Target network - chainId: ${baseSepolia.id} (Base Sepolia)`);
      console.log(`✅ Match: ${chainId === baseSepolia.id}`);
      
      if (chainId !== baseSepolia.id && switchChain) {
        console.log(`🔄 Auto-switching to Base Sepolia (chainId ${baseSepolia.id})`);
        try {
          switchChain({ chainId: baseSepolia.id });
        } catch (error) {
          console.error('❌ Failed to switch network:', error);
        }
      }
    }
  }, [isConnected, chainId, chain, switchChain]);

  // Manual network switch function
  const handleSwitchNetwork = () => {
    if (switchChain) {
      try {
        switchChain({ chainId: baseSepolia.id });
      } catch (error) {
        console.error('❌ Failed to switch network:', error);
      }
    }
  };

  // Tracker le temps écoulé pendant les transactions
  useEffect(() => {
    if (isConfirming && (tipStatus === 'pending' || tipStatus === 'approving')) {
      if (!txStartTime) {
        setTxStartTime(Date.now());
      }
      
      const interval = setInterval(() => {
        if (txStartTime) {
          const elapsed = Math.floor((Date.now() - txStartTime) / 1000);
          setElapsedTime(elapsed);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setTxStartTime(null);
      setElapsedTime(0);
    }
  }, [isConfirming, tipStatus, txStartTime]);

  // Note: Les messages de progression sont affichés directement dans le JSX
  // pour éviter les duplications avec errorMessage

  // Mettre à jour la balance de façon optimiste quand la transaction est envoyée
  useEffect(() => {
    if (hash && tipStatus === 'pending' && pendingTipAmount && usdcBalance) {
      // Déduire immédiatement le montant de la balance affichée
      const newBalance = usdcBalance - pendingTipAmount;
      setOptimisticBalance(newBalance);
      console.log('💰 Optimistic balance update:', formatUnits(newBalance, 6), 'USDC');
    }
  }, [hash, tipStatus, pendingTipAmount, usdcBalance]);

  // Gérer les erreurs d'écriture
  useEffect(() => {
    if (writeError) {
      console.error('Write error:', writeError);
      let message = 'Transaction failed';
      if (writeError.message.includes('User rejected')) {
        message = 'Transaction rejected by user';
      } else if (writeError.message.includes('insufficient funds')) {
        message = 'Insufficient funds for gas';
      }
      setErrorMessage(message);
      setTipStatus('error');
      // Restaurer la balance réelle en cas d'erreur
      setOptimisticBalance(null);
      setPendingTipAmount(null);
      setTimeout(() => {
        setTipStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  }, [writeError]);

  useEffect(() => {
    if (isConfirmed) {
      console.log('Transaction confirmed! Hash:', hash);
      // Si c'était un approve, refetch l'allowance et réinitialiser
      if (tipStatus === 'approving') {
        refetchAllowance();
        refetchBalance(); // Rafraîchir la balance après l'approval
        setTipStatus('idle');
        setErrorMessage('✅ USDC approved! Click tip again to send.');
        setTimeout(() => setErrorMessage(''), 5000);
      } else if (tipStatus === 'pending') {
        // C'était un tip - rafraîchir la balance réelle et nettoyer l'optimistic update
        refetchBalance();
        console.log('✅ Tip confirmed! Refreshing balance...');
        setOptimisticBalance(null);
        setPendingTipAmount(null);
        setTipStatus('success');
        setErrorMessage('');
        setTimeout(() => {
          setTipStatus('idle');
          setShowCustomInput(false);
          setCustomAmount('');
        }, 3000);
      }
    }
  }, [isConfirmed, tipStatus, refetchAllowance, refetchBalance, hash]);

  // Gérer le rejet de transaction
  useEffect(() => {
    if (!isPending && !isConfirming && !isConfirmed && hash === undefined) {
      if (tipStatus === 'approving' || tipStatus === 'pending') {
        // Transaction rejetée ou erreur - restaurer la balance
        setOptimisticBalance(null);
        setPendingTipAmount(null);
        setTimeout(() => {
          if (tipStatus === 'approving' || tipStatus === 'pending') {
            setTipStatus('idle');
            setErrorMessage('');
          }
        }, 1000);
      }
    }
  }, [isPending, isConfirming, isConfirmed, hash, tipStatus]);

  const handleTip = async (amount: string) => {
    if (!isConnected || !address) {
      setErrorMessage('Please connect your wallet first');
      setTipStatus('error');
      setTimeout(() => {
        setTipStatus('idle');
        setErrorMessage('');
      }, 3000);
      return;
    }

    try {
      setErrorMessage('');
      const amountInWei = parseUnits(amount, 6);

      // 1. Vérifier la balance USDC
      if (usdcBalance !== undefined && usdcBalance < amountInWei) {
        setErrorMessage(`Insufficient USDC balance. You have ${formatUnits(usdcBalance, 6)} USDC`);
        setTipStatus('error');
        setTimeout(() => {
          setTipStatus('idle');
          setErrorMessage('');
        }, 5000);
        return;
      }

      // 2. Vérifier l'allowance et approuver si nécessaire
      if (allowance === undefined || allowance < amountInWei) {
        setTipStatus('approving');
        console.log('🔓 Approval required, requesting approve...');
        console.log('Current allowance:', allowance?.toString());
        console.log('Required amount:', amountInWei.toString());
        
        // Approuver un montant raisonnable pour éviter de réapprouver à chaque fois
        const approveAmount = parseUnits('100', 6); // 100 USDC
        console.log('Approving:', approveAmount.toString(), 'USDC');
        
        try {
          writeContract({
            address: USDC_ADDRESS,
            abi: USDC_ABI,
            functionName: 'approve',
            args: [WAVETIP_CONTRACT, approveAmount],
          });
          console.log('✅ Approval transaction sent');
        } catch (err) {
          console.error('❌ Error sending approval:', err);
          setErrorMessage('Failed to send approval transaction');
          setTipStatus('error');
          setTimeout(() => {
            setTipStatus('idle');
            setErrorMessage('');
          }, 5000);
        }
        
        // Attendre que l'approve soit confirmé avant de continuer
        // L'utilisateur devra cliquer à nouveau sur le bouton tip après l'approve
        return;
      }

      // 3. Envoyer le tip
      setTipStatus('pending');
      setPendingTipAmount(amountInWei); // Sauvegarder le montant pour l'update optimiste
      console.log('Sending tip:', { channel, amount: formatUnits(amountInWei, 6) });
      
      writeContract({
        address: WAVETIP_CONTRACT,
        abi: WAVETIP_ABI,
        functionName: 'tip',
        args: [channel, 'donation', amountInWei],
      });
      
    } catch (error: unknown) {
      console.error('Error in handleTip:', error);
      
      let message = 'Failed to send tip';
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          message = 'Transaction rejected';
        } else if (error.message.includes('insufficient funds')) {
          message = 'Insufficient funds for gas';
        } else {
          message = error.message;
        }
      }
      
      setErrorMessage(message);
      setTipStatus('error');
      setTimeout(() => {
        setTipStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  const handleCustomTip = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    handleTip(customAmount);
  };

  const getTwitchEmbedUrl = () => {
    const parent = typeof window !== 'undefined' 
      ? window.location.hostname 
      : 'localhost';
    
    return `https://player.twitch.tv/?channel=${channel}&parent=${parent}&muted=false`;
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className={styles.streamPage}>
      <div className={styles.streamHeader}>
        <button onClick={handleBack} className={styles.backButton}>
          ← Back
        </button>
        <h2 className={styles.streamTitle}>
          🔴 {channel}
        </h2>
        <div className={styles.spacer} />
      </div>
      
      <div className={styles.streamPlayer}>
        <iframe
          src={getTwitchEmbedUrl()}
          height="100%"
          width="100%"
          allowFullScreen
          className={styles.twitchIframe}
        />
      </div>

      {/* Tip Section */}
      <div className={styles.tipSection}>
        <div className={styles.tipHeader}>
          <h3 className={styles.tipTitle}>💰 Tip {channel} with USDC</h3>
          {isConnected && usdcBalance !== undefined && (
            <p className={styles.balanceInfo}>
              Balance: {parseFloat(formatUnits(optimisticBalance ?? usdcBalance, 6)).toFixed(2)} USDC
            </p>
          )}
          {!isConnected && (
            <p className={styles.tipSubtitle}>Connect wallet in Profile to tip</p>
          )}
        </div>

        {isConnected ? (
          <div className={styles.tipContent}>
            {/* Network Status */}
            <div className={isCorrectNetwork ? styles.networkInfo : styles.networkWarning}>
              {isCorrectNetwork ? (
                <>✅ Connected to <strong>{getNetworkName(chainId)}</strong></>
                ) : (
                  <div className={styles.networkWarningContent}>
                    <p className={styles.networkWarningText}>
                      ⚠️ Wrong network
                    </p>
                    <button 
                      onClick={handleSwitchNetwork}
                      className={styles.switchNetworkButton}
                    >
                      🔄 Switch to Base Sepolia
                    </button>
                  </div>
                )}
            </div>

            <div className={styles.tipButtons}>
              <button
                onClick={() => handleTip('1')}
                className={styles.tipButton}
                disabled={!isCorrectNetwork || isPending || isConfirming || tipStatus === 'pending'}
              >
                $1
              </button>
              <button
                onClick={() => handleTip('2')}
                className={styles.tipButton}
                disabled={!isCorrectNetwork || isPending || isConfirming || tipStatus === 'pending'}
              >
                $2
              </button>
              <button
                onClick={() => handleTip('5')}
                className={styles.tipButton}
                disabled={!isCorrectNetwork || isPending || isConfirming || tipStatus === 'pending'}
              >
                $5
              </button>
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className={`${styles.tipButton} ${styles.tipButtonCustom}`}
                disabled={!isCorrectNetwork || isPending || isConfirming || tipStatus === 'pending'}
              >
                Custom
              </button>
            </div>

            {showCustomInput && (
              <div className={styles.customInputContainer}>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className={styles.customInput}
                />
                <button
                  onClick={handleCustomTip}
                  className={styles.sendCustomButton}
                  disabled={!isCorrectNetwork || isPending || isConfirming || tipStatus === 'pending'}
                >
                  Send
                </button>
              </div>
            )}

            {tipStatus === 'approving' && (
              <div className={styles.tipStatusContainer}>
                <p className={styles.tipStatusPending}>
                  {isPending && '👛 Confirm approval in your wallet...'}
                  {isConfirming && `⏳ Approving USDC on blockchain... (${elapsedTime}s)`}
                  {!isPending && !isConfirming && '⏳ Preparing approval...'}
                </p>
                {hash && (
                  <a 
                    href={`https://sepolia.basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.txLink}
                  >
                    🔍 View transaction on explorer
                  </a>
                )}
                {isConfirming && elapsedTime > 10 && (
                  <p className={styles.tipStatusInfo}>
                    ℹ️ Base Sepolia testnet can be slow. Please wait...
                  </p>
                )}
                {(isConfirming && elapsedTime > 30) && (
                  <button 
                    onClick={() => {
                      setTipStatus('idle');
                      setErrorMessage('');
                      setTxStartTime(null);
                      setElapsedTime(0);
                    }}
                    className={styles.cancelButton}
                  >
                    Reset & Try Again
                  </button>
                )}
              </div>
            )}
            {(isPending || isConfirming || tipStatus === 'pending') && tipStatus !== 'approving' && (
              <div className={styles.tipStatusContainer}>
                <p className={styles.tipStatusPending}>
                  {isPending && '👛 Confirm tip in your wallet...'}
                  {isConfirming && `⏳ Sending tip on blockchain... (${elapsedTime}s)`}
                  {!isPending && !isConfirming && '⏳ Preparing transaction...'}
                </p>
                {hash && (
                  <a 
                    href={`https://sepolia.basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.txLink}
                  >
                    🔍 View transaction on explorer
                  </a>
                )}
                {isConfirming && elapsedTime > 10 && (
                  <p className={styles.tipStatusInfo}>
                    ℹ️ Base Sepolia testnet can be slow. Please wait...
                  </p>
                )}
              </div>
            )}
            {tipStatus === 'success' && (
              <p className={styles.tipStatusSuccess}>✅ Tip sent successfully!</p>
            )}
            {tipStatus === 'error' && (
              <p className={styles.tipStatusError}>❌ {errorMessage || 'Error sending tip'}</p>
            )}
            {errorMessage && tipStatus === 'idle' && (
              <p className={styles.tipStatusInfo}>{errorMessage}</p>
            )}
          </div>
        ) : (
          <div className={styles.tipDisconnected}>
            <button
              onClick={() => router.push('/?tab=profile')}
              className={styles.connectWalletPrompt}
            >
              Connect Wallet to Tip
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <button
          className={styles.navItem}
          onClick={() => router.push('/?tab=home')}
        >
          <div className={styles.navIconWrapper}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <span className={styles.navLabel}>Home</span>
        </button>

        <button
          className={styles.navItem}
          onClick={() => router.push('/?tab=activity')}
        >
          <div className={styles.navIconWrapper}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
          <span className={styles.navLabel}>Activity</span>
        </button>

        <button
          className={styles.navItem}
          onClick={() => router.push('/?tab=profile')}
        >
          <div className={styles.navIconWrapper}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span className={styles.navLabel}>Profile</span>
        </button>

        <button
          className={styles.navItem}
          onClick={() => router.push('/?tab=about')}
        >
          <div className={styles.navIconWrapper}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <span className={styles.navLabel}>About</span>
        </button>
      </nav>
    </div>
  );
}

