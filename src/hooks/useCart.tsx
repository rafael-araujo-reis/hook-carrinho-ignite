import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {

  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = api('stock')

    console.log(storagedCart)

    // if (storagedCart) {
    //   return JSON.parse(storagedCart);
    // }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const response = api(`products/${productId}`);
      const product: Product = (await response).data

      !product.amount ? product.amount = 2 : product.amount = product.amount;

      const haveInCart = cart.find(product => product.id == productId);
      haveInCart ? updateProductAmount({ amount: 2, productId }) :
        updateProductAmount({ amount: 2, productId })
          .then(() => setCart([...cart, product]));
    } catch {
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      cart.forEach((product, index) => {
        if (product.id == productId) {
          cart.splice(index, 1);
          setCart([...cart]);
        }
      })
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      cart.forEach((product) => {
        if (product.id == productId) {
          !product.amount ? product.amount = amount : product.amount += amount;
        }
      })
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
