import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FavoritesAPI from "../services/api/favorites.api";

export type FavoritesContextType = {
  favorites: FavoritesAPI.Favorite[];
  isFavorite: (productId: string) => boolean;
  add: (productId: string) => Promise<void>;
  removeByProductId: (productId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  reload: () => Promise<void>;
  loading: boolean;
};

const Ctx = React.createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  add: async () => {},
  removeByProductId: async () => {},
  clearAll: async () => {},
  reload: async () => {},
  loading: true
});

const CACHE_KEY = "favorites-cache";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = React.useState<FavoritesAPI.Favorite[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as FavoritesAPI.Favorite[];
          setFavorites(parsed);
        }
      } catch {}
      try {
        const list = await FavoritesAPI.getFavorites();
        setFavorites(list);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(list));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isFavorite = React.useCallback(
    (productId: string) => favorites.some((f) => f.productId === productId),
    [favorites]
  );

  const reload = React.useCallback(async () => {
    const list = await FavoritesAPI.getFavorites();
    setFavorites(list);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(list));
  }, []);

  const add = React.useCallback(async (productId: string) => {
    if (favorites.some((f) => f.productId === productId)) return;
    const optimistic: FavoritesAPI.Favorite = {
      id: `temp-${productId}`,
      productId,
      product: favorites.find((f) => f.productId === productId)?.product || ({} as any),
      createdAt: new Date().toISOString()
    };
    setFavorites((prev) => [optimistic, ...prev]);
    try {
      const created = await FavoritesAPI.addFavorite(productId);
      setFavorites((prev) => [created, ...prev.filter((f) => f.id !== optimistic.id)]);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify([created, ...favorites.filter((f) => f.id !== optimistic.id)]));
    } catch {
      setFavorites((prev) => prev.filter((f) => f.id !== optimistic.id));
    }
  }, [favorites]);

  const removeByProductId = React.useCallback(async (productId: string) => {
    const target = favorites.find((f) => f.productId === productId);
    if (!target) return;
    setFavorites((prev) => prev.filter((f) => f.productId !== productId));
    try {
      await FavoritesAPI.removeFavorite(target.id);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(favorites.filter((f) => f.productId !== productId)));
    } catch {
      // rollback
      setFavorites((prev) => [target, ...prev]);
    }
  }, [favorites]);

  const clearAll = React.useCallback(async () => {
    const prev = favorites;
    setFavorites([]);
    try {
      await Promise.all(prev.map((f) => FavoritesAPI.removeFavorite(f.id)));
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify([]));
    } catch {
      setFavorites(prev);
    }
  }, [favorites]);

  const value: FavoritesContextType = {
    favorites,
    isFavorite,
    add,
    removeByProductId,
    clearAll,
    reload,
    loading
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFavorites() {
  return React.useContext(Ctx);
}
