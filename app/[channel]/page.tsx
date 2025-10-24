"use client";
import { useParams, useRouter } from "next/navigation";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import styles from "./page.module.css";

// Base Sepolia Configuration
// Chain ID: 84532
// USDC Address: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
// WaveTip Contract on Base Sepolia
const WAVETIP_CONTRACT = '0xD0c8Ca68cc81fF4486d5D725fCE612ddFeb0672D' as const;

// WaveTip Contract ABI
const WAVETIP_ABI = [
  {
    inputs: [
      { name: 'usdcAmount', type: 'uint256' },
      { name: 'streamerName', type: 'string' }
    ],
    name: 'tip',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default function StreamerPage() {
  const params = useParams();
  const router = useRouter();
  const { isFrameReady, setFrameReady } = useMiniKit();
  const { address, isConnected } = useAccount();
  const channel = (params.channel as string).toLowerCase();
  
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [tipStatus, setTipStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    if (isConfirmed) {
      setTipStatus('success');
      setTimeout(() => {
        setTipStatus('idle');
        setShowCustomInput(false);
        setCustomAmount('');
      }, 3000);
    }
  }, [isConfirmed]);

  const handleTip = async (amount: string) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setTipStatus('pending');
      
      // Convert amount to USDC (6 decimals)
      const amountInWei = parseUnits(amount, 6);

      // Send tip to WaveTip contract with streamer name as tag
      writeContract({
        address: WAVETIP_CONTRACT,
        abi: WAVETIP_ABI,
        functionName: 'tip',
        args: [amountInWei, channel],
        chainId: 84532, // Force Base Sepolia
      });
    } catch (error) {
      console.error('Error sending tip:', error);
      setTipStatus('error');
      setTimeout(() => setTipStatus('idle'), 3000);
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
          {!isConnected && (
            <p className={styles.tipSubtitle}>Connect wallet in Profile to tip</p>
          )}
        </div>

        {isConnected ? (
          <div className={styles.tipContent}>
            <div className={styles.tipButtons}>
              <button
                onClick={() => handleTip('1')}
                className={styles.tipButton}
                disabled={isPending || isConfirming || tipStatus === 'pending'}
              >
                $1
              </button>
              <button
                onClick={() => handleTip('2')}
                className={styles.tipButton}
                disabled={isPending || isConfirming || tipStatus === 'pending'}
              >
                $2
              </button>
              <button
                onClick={() => handleTip('5')}
                className={styles.tipButton}
                disabled={isPending || isConfirming || tipStatus === 'pending'}
              >
                $5
              </button>
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className={`${styles.tipButton} ${styles.tipButtonCustom}`}
                disabled={isPending || isConfirming || tipStatus === 'pending'}
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
                  disabled={isPending || isConfirming || tipStatus === 'pending'}
                >
                  Send
                </button>
              </div>
            )}

            {(isPending || isConfirming || tipStatus === 'pending') && (
              <p className={styles.tipStatusPending}>⏳ Sending tip...</p>
            )}
            {tipStatus === 'success' && (
              <p className={styles.tipStatusSuccess}>✅ Tip sent successfully!</p>
            )}
            {tipStatus === 'error' && (
              <p className={styles.tipStatusError}>❌ Error sending tip</p>
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
          onClick={() => router.push('/')}
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
          onClick={() => router.push('/')}
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
          onClick={() => router.push('/')}
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
          onClick={() => router.push('/')}
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

