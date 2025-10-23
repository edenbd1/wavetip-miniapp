"use client";

import { useComposeCast } from '@coinbase/onchainkit/minikit';
import { useRouter } from 'next/navigation';
import { minikitConfig } from "../../minikit.config";
import styles from "./page.module.css";

export default function Success() {
  const router = useRouter();
  const { composeCastAsync } = useComposeCast();
  
  const handleShare = async () => {
    try {
      const text = `I'm watching Twitch streams on ${minikitConfig.miniapp.name}! 📺\n\nJoin me on Base App to watch your favorite streamers! 🎮`;

      const result = await composeCastAsync({
        text: text,
        embeds: [process.env.NEXT_PUBLIC_URL || ""]
      });

      // result.cast can be null if user cancels
      if (result?.cast) {
        console.log("Cast created successfully:", result.cast.hash);
      } else {
        console.log("User cancelled the cast");
      }
    } catch (error) {
      console.error("Error sharing cast:", error);
    }
  };

  const handleBackToApp = () => {
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <button className={styles.closeButton} type="button">
        ✕
      </button>
      
      <div className={styles.content}>
            <div className={styles.successMessage}>
              <div className={styles.checkmark}>
                <div className={styles.checkmarkCircle}>
                  <div className={styles.checkmarkStem}></div>
                  <div className={styles.checkmarkKick}></div>
                </div>
              </div>

              <h1 className={styles.title}>
                📺 Enjoy the stream!
              </h1>

              <p className={styles.subtitle}>
                You&apos;re now watching Twitch streams on Base App.<br />
                Share this experience with your friends!
              </p>

              <div className={styles.buttonGroup}>
                <button onClick={handleShare} className={styles.shareButton}>
                  SHARE ON FARCASTER
                </button>

                <button onClick={handleBackToApp} className={styles.backButton}>
                  BACK TO APP
                </button>
              </div>
            </div>
      </div>
    </div>
  );
}
