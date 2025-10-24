"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useRouter } from "next/navigation";
import { 
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import { Address, Avatar, Name, Identity } from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';
import styles from "./page.module.css";

interface TwitchChannel {
  id: string;
  login: string;
  displayName: string;
  isLive: boolean;
  thumbnailUrl: string;
  gameName: string;
}

type Tab = "home" | "activity" | "profile" | "about";

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("home");
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
      setError("Enter a channel name");
      return;
    }

    const channel = channelName.trim().toLowerCase();
    setShowSuggestions(false);
    router.push(`/${channel}`);
  };

  // Rendu du contenu selon l'onglet actif
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className={styles.browseContent}>
            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper} ref={searchRef}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                  <input
                    type="text"
                    placeholder="Search Twitch channels..."
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
              <h2 className={styles.emptyTitle}>Activity</h2>
              <p className={styles.emptyText}>
                Your recent streams and history will appear here
              </p>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className={styles.tabContent}>
            <div className={styles.profileContent}>
              <div className={styles.profileHeader}>
                {context?.user?.pfpUrl ? (
                  <img 
                    src={context.user.pfpUrl} 
                    alt={context.user.displayName || "Profile"} 
                    className={styles.profileAvatarImage}
                  />
                ) : (
                  <div className={styles.profileAvatar}>
                    {context?.user?.displayName?.charAt(0) || "?"}
                  </div>
                )}
                <h2 className={styles.profileName}>
                  {context?.user?.displayName || "User"}
                </h2>
                <p className={styles.profileFid}>
                  FID: {context?.user?.fid || "---"}
                </p>
              </div>

              {/* Wallet Connection */}
              <div className={styles.walletSection}>
                <h3 className={styles.sectionTitle}>Wallet</h3>
                {isConnected && address ? (
                  <div className={styles.walletConnected}>
                    <Identity
                      address={address}
                      schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
                    >
                      <Avatar className={styles.walletAvatar} />
                      <Name className={styles.walletName} />
                      <Address className={styles.walletAddress} />
                    </Identity>
                    <Wallet>
                      <WalletDropdown>
                        <WalletDropdownDisconnect />
                      </WalletDropdown>
                    </Wallet>
                  </div>
                ) : (
                  <div className={styles.walletDisconnected}>
                    <p className={styles.walletDescription}>
                      Connect your wallet to tip streamers with USDC on Base
                    </p>
                    <Wallet>
                      <ConnectWallet className={styles.connectButton}>
                        <Avatar className={styles.avatarConnectButton} />
                        <Name />
                      </ConnectWallet>
                      <WalletDropdown>
                        <WalletDropdownDisconnect />
                      </WalletDropdown>
                    </Wallet>
                  </div>
                )}
              </div>
              
              <div className={styles.profileStats}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>0</div>
                  <div className={styles.statLabel}>Streams Watched</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>0</div>
                  <div className={styles.statLabel}>Favorites</div>
                </div>
              </div>
            </div>
          </div>
        );

      case "about":
        return (
          <div className={styles.tabContent}>
            <div className={styles.aboutContent}>
              <div className={styles.aboutHeader}>
                <div className={styles.aboutIcon}>📺</div>
                <h2 className={styles.aboutTitle}>WaveTip</h2>
                <p className={styles.aboutVersion}>Version 1.0.0</p>
              </div>
              
              <div className={styles.aboutSection}>
                <h3 className={styles.aboutSectionTitle}>About</h3>
                <p className={styles.aboutText}>
                  Watch your favorite Twitch streamers directly in Base App. 
                  Search any channel and enjoy live streams.
                </p>
              </div>

              <div className={styles.aboutSection}>
                <h3 className={styles.aboutSectionTitle}>Features</h3>
                <ul className={styles.aboutList}>
                  <li>🔍 Real-time search</li>
                  <li>🔴 Live streams</li>
                  <li>📺 Integrated player</li>
                  <li>📱 Mobile interface</li>
                </ul>
              </div>

              <div className={styles.aboutFooter}>
                <p className={styles.aboutCredit}>Built on Base</p>
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
          className={`${styles.navItem} ${activeTab === "home" ? styles.active : ""}`}
          onClick={() => setActiveTab("home")}
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
          className={`${styles.navItem} ${activeTab === "activity" ? styles.active : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          <div className={styles.navIconWrapper}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
          <span className={styles.navLabel}>Activity</span>
        </button>

        <button
          className={`${styles.navItem} ${activeTab === "profile" ? styles.active : ""}`}
          onClick={() => setActiveTab("profile")}
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
          className={`${styles.navItem} ${activeTab === "about" ? styles.active : ""}`}
          onClick={() => setActiveTab("about")}
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
