// hooks/useOfflineStorage.ts

"use client";

import { useCallback, useEffect, useState } from "react";
import { openDB, type IDBPDatabase } from "idb";
import type { Destination, SavedItinerary } from "@/types";

const DB_NAME = "hidden-nepal-offline";
const DB_VERSION = 1;

type StoreNames = "destinations" | "itineraries" | "safety";

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("destinations")) {
        db.createObjectStore("destinations", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("itineraries")) {
        db.createObjectStore("itineraries", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("safety")) {
        db.createObjectStore("safety", { keyPath: "id" });
      }
    },
  });
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const saveDestination = useCallback(async (destination: Destination) => {
    try {
      const db = await getDB();
      await db.put("destinations", {
        ...destination,
        savedAt: Date.now(),
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  const getSavedDestinations = useCallback(async (): Promise<Destination[]> => {
    try {
      const db = await getDB();
      return await db.getAll("destinations");
    } catch {
      return [];
    }
  }, []);

  const removeDestination = useCallback(async (id: string) => {
    try {
      const db = await getDB();
      await db.delete("destinations", id);
      return true;
    } catch {
      return false;
    }
  }, []);

  const saveItinerary = useCallback(async (itinerary: SavedItinerary) => {
    try {
      const db = await getDB();
      await db.put("itineraries", { ...itinerary, savedAt: Date.now() });
      return true;
    } catch {
      return false;
    }
  }, []);

  const getSavedItineraries = useCallback(async (): Promise<SavedItinerary[]> => {
    try {
      const db = await getDB();
      return await db.getAll("itineraries");
    } catch {
      return [];
    }
  }, []);

  const isDestinationSaved = useCallback(async (id: string): Promise<boolean> => {
    try {
      const db = await getDB();
      const item = await db.get("destinations", id);
      return !!item;
    } catch {
      return false;
    }
  }, []);

  return {
    isOnline,
    saveDestination,
    getSavedDestinations,
    removeDestination,
    saveItinerary,
    getSavedItineraries,
    isDestinationSaved,
  };
}
