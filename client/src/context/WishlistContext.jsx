import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getWishlist, toggleWishlistItem as toggleWishlistItemApi } from '../api/wishlist';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(null);

  useEffect(() => {
    if (user) {
      getWishlist()
        .then(setWishlist)
        .catch(() => setWishlist(null));
    } else {
      setWishlist(null);
    }
  }, [user]);

  const toggleWishlistItem = async (productId) => {
    const updatedWishlist = await toggleWishlistItemApi(productId);
    setWishlist(updatedWishlist);
    return updatedWishlist;
  };

  const isInWishlist = (productId) => {
    if (!wishlist?.products) return false;
    return wishlist.products.some((p) =>
      typeof p === 'string' ? p === productId : p?._id === productId
    );
  };

  const value = {
    wishlist,
    toggleWishlistItem,
    isInWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};