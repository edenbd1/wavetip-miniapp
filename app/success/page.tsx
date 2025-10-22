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
      const text = `Je regarde des streams Twitch sur ${minikitConfig.miniapp.name}! 📺\n\nRejoignez-moi sur Base App pour regarder vos streamers préférés! 🎮`;
      
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
            📺 Profitez du stream!
          </h1>
          
          <p className={styles.subtitle}>
            Vous regardez maintenant des streams Twitch sur Base App.<br />
            Partagez cette expérience avec vos amis!
          </p>

          <div className={styles.buttonGroup}>
            <button onClick={handleShare} className={styles.shareButton}>
              PARTAGER SUR FARCASTER
            </button>
            
            <button onClick={handleBackToApp} className={styles.backButton}>
              RETOUR À L&apos;APP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
