"use client";
import { useParams, useRouter } from "next/navigation";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect } from "react";
import styles from "./page.module.css";

export default function StreamerPage() {
  const params = useParams();
  const router = useRouter();
  const { isFrameReady, setFrameReady } = useMiniKit();
  const channel = params.channel as string;

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const getTwitchEmbedUrl = () => {
    // Utiliser le hostname actuel (localhost en dev, vercel.app en prod)
    const parent = typeof window !== 'undefined' 
      ? window.location.hostname 
      : 'new-mini-app-quickstart-one-green.vercel.app';
    
    return `https://player.twitch.tv/?channel=${channel}&parent=${parent}&muted=false&autoplay=true`;
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

