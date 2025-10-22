"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface TwitchChannel {
  id: string;
  login: string;
  displayName: string;
  isLive: boolean;
  thumbnailUrl: string;
  gameName: string;
}

type Tab = "browse" | "activity" | "profile";

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("browse");
  const [channelName, setChannelName] = useState("");
  const [suggestions, setSuggestions] = useState<TwitchChannel[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize the miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recherche sur l'API Twitch
  const searchTwitchChannels = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`/api/twitch/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      
      if (data.channels && data.channels.length > 0) {
        setSuggestions(data.channels);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error("Error searching channels:", err);
      setSuggestions([]);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setChannelName(value);
    setError("");
    
    // Debounce la recherche pour éviter trop de requêtes
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.trim().length >= 2) {
      debounceTimer.current = setTimeout(() => {
        searchTwitchChannels(value.trim());
      }, 300); // Attend 300ms après la dernière frappe
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectChannel = (channel: TwitchChannel) => {
    setShowSuggestions(false);
    setSuggestions([]);
    router.push(`/${channel.login}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelName.trim()) {
      setError("Entrez un nom de channel");
      return;
    }

    const channel = channelName.trim().toLowerCase();
    setShowSuggestions(false);
    router.push(`/${channel}`);
  };

  // Rendu du contenu selon l'onglet actif
  const renderContent = () => {
    switch (activeTab) {
      case "browse":
        return (
          <div className={styles.browseContent}>
            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper} ref={searchRef}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                  <input
                    type="text"
                    placeholder="Rechercher un channel Twitch..."
                    value={channelName}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => channelName && setShowSuggestions(true)}
                    className={styles.searchInput}
                    autoComplete="off"
                  />
                  <button type="submit" className={styles.searchButton}>
                    🔍
                  </button>
                </form>

                {showSuggestions && suggestions.length > 0 && (
                  <div className={styles.suggestionsDropdown}>
                    {suggestions.map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => handleSelectChannel(channel)}
                        className={styles.suggestionItem}
                        type="button"
                      >
                        <span className={styles.suggestionIcon}>
                          {channel.isLive ? "🔴" : "📺"}
                        </span>
                        <div className={styles.suggestionContent}>
                          <div className={styles.suggestionName}>
                            {channel.displayName}
                          </div>
                          {channel.gameName && (
                            <div className={styles.suggestionGame}>
                              {channel.gameName}
                            </div>
                          )}
                        </div>
                        {channel.isLive && (
                          <span className={styles.liveBadge}>LIVE</span>
                        )}
                    </button>
                  ))}
                </div>
              )}
            </div>
              
              {error && <p className={styles.error}>{error}</p>}
            </div>
          </div>
        );

      case "activity":
        return (
          <div className={styles.tabContent}>
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <h2 className={styles.emptyTitle}>Activité</h2>
              <p className={styles.emptyText}>
                Vos streams récents et votre historique apparaîtront ici
              </p>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className={styles.tabContent}>
            <div className={styles.profileContent}>
              <div className={styles.profileHeader}>
                <div className={styles.profileAvatar}>
                  {context?.user?.displayName?.charAt(0) || "?"}
                </div>
                <h2 className={styles.profileName}>
                  {context?.user?.displayName || "User"}
                </h2>
                <p className={styles.profileFid}>
                  FID: {context?.user?.fid || "---"}
                </p>
              </div>
              
              <div className={styles.profileStats}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>0</div>
                  <div className={styles.statLabel}>Streams regardés</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>0</div>
                  <div className={styles.statLabel}>Favoris</div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.mobileApp}>
      <main className={styles.mainContent}>
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <button
          className={`${styles.navItem} ${activeTab === "browse" ? styles.active : ""}`}
          onClick={() => setActiveTab("browse")}
        >
          <span className={styles.navIcon}>🔍</span>
          <span className={styles.navLabel}>Browse</span>
        </button>

        <button
          className={`${styles.navItem} ${activeTab === "activity" ? styles.active : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          <span className={styles.navIcon}>📊</span>
          <span className={styles.navLabel}>Activity</span>
        </button>

        <button
          className={`${styles.navItem} ${activeTab === "profile" ? styles.active : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <span className={styles.navIcon}>👤</span>
          <span className={styles.navLabel}>Profile</span>
        </button>
      </nav>
    </div>
  );
}
