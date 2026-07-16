import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
} from '../api/cart';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);

  useEffect(() => {
    if (user) {
      getCart()
        .then(setCart)
        .catch(() => setCart(null));
    } else {
      setCart(null);
    }
  }, [user]);

  const addToCart = async (productId, size, quantity = 1) => {
    const updatedCart = await addToCartApi(productId, size, quantity);
    setCart(updatedCart);
    return updatedCart;
  };

  const updateCartItem = async (itemId, quantity) => {
    const updatedCart = await updateCartItemApi(itemId, quantity);
    setCart(updatedCart);
    return updatedCart;
  };

  const removeCartItem = async (itemId) => {
    const updatedCart = await removeCartItemApi(itemId);
    setCart(updatedCart);
    return updatedCart;
  };

  const refreshCart = async () => {
    try {
      const updatedCart = await getCart();
      setCart(updatedCart);
    } catch (err) {
      setCart(null);
    }
  };

  const value = {
    cart,
    addToCart,
    updateCartItem,
    removeCartItem,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};