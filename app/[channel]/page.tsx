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
    const parent = typeof window !== 'undefined' 
      ? window.location.hostname 
      : 'localhost';
    
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
          <span className={styles.navIcon}>🔍</span>
          <span className={styles.navLabel}>Browse</span>
        </button>

        <button
          className={styles.navItem}
          onClick={() => router.push('/')}
        >
          <span className={styles.navIcon}>📊</span>
          <span className={styles.navLabel}>Activity</span>
        </button>

        <button
          className={styles.navItem}
          onClick={() => router.push('/')}
        >
          <span className={styles.navIcon}>👤</span>
          <span className={styles.navLabel}>Profile</span>
        </button>
      </nav>
    </div>
  );
}

