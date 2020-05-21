import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@Cart');

      if (cart) {
        setProducts(JSON.parse(cart));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const newProduct = products.findIndex(item => item.id === product.id);

      if (newProduct !== -1) {
        products[newProduct].quantity += 1;
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem('@Cart', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const incrementProduct = products.find(product => product.id === id);
      const othersProduct = products.filter(product => product.id !== id);

      if (incrementProduct) {
        setProducts([
          ...othersProduct,
          { ...incrementProduct, quantity: incrementProduct.quantity + 1 },
        ]);
      } else {
        setProducts(othersProduct);
      }

      await AsyncStorage.setItem('@Cart', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const incrementProduct = products.find(product => product.id === id);
      const othersProduct = products.filter(product => product.id !== id);

      if (incrementProduct && incrementProduct.quantity - 1 > 0) {
        setProducts([
          ...othersProduct,
          { ...incrementProduct, quantity: incrementProduct.quantity - 1 },
        ]);
      } else {
        setProducts(othersProduct);
      }

      await AsyncStorage.setItem('@Cart', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
