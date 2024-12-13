// // hooks/useLastSynced.ts
// import { useState, useEffect } from "react";

// export function useLastSynced() {
//   const [lastSynced, setLastSynced] = useState<Date | null>(null);

//   const updateLastSynced = () => setLastSynced(new Date());

//   const getLastSyncedText = () => {
//     if (!lastSynced) return "Never";

//     const now = new Date();
//     const diffSeconds = Math.floor(
//       (now.getTime() - lastSynced.getTime()) / 1000
//     );

//     if (diffSeconds < 5) return "Just now";
//     if (diffSeconds < 60) return "Few seconds ago";
//     if (diffSeconds < 3600) return "Few minutes ago";
//     return lastSynced.toLocaleString();
//   };

//   return { lastSynced, updateLastSynced, getLastSyncedText };
// }
// hooks/useLastSynced.ts
import { useState, useEffect } from "react";

const LAST_SYNCED_KEY = "lastSyncedTime";

export function useLastSynced() {
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  useEffect(() => {
    // Load the last synced time from local storage on component mount
    const storedTime = localStorage.getItem(LAST_SYNCED_KEY);
    if (storedTime) {
      setLastSynced(new Date(storedTime));
    }
  }, []);

  const updateLastSynced = () => {
    const newLastSynced = new Date();
    setLastSynced(newLastSynced);
    // Store the new last synced time in local storage
    localStorage.setItem(LAST_SYNCED_KEY, newLastSynced.toISOString());
  };

  const getLastSyncedText = () => {
    if (!lastSynced) return "Never";

    const now = new Date();
    const diffSeconds = Math.floor(
      (now.getTime() - lastSynced.getTime()) / 1000
    );

    if (diffSeconds < 5) return "Just now";
    if (diffSeconds < 60) return "Few seconds ago";
    if (diffSeconds < 3600) return "Few minutes ago";
    if (diffSeconds < 216000) return "Few hours ago";
    return lastSynced.toLocaleString();
  };

  return { lastSynced, updateLastSynced, getLastSyncedText };
}
