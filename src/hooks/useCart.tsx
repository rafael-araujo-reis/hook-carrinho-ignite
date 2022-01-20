import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
import { QNTD_CALCULO } from '../constantes';
import { api } from '../services/api';
import { Product, /*Stock*/ } from '../types';

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
    const storagedCart = localStorage.getItem('@RocketShoes: cart');

    if (storagedCart) {
      console.log(JSON.parse(storagedCart))
      return JSON.parse(storagedCart);
    }

    return [];
  });

  useEffect(() => {
    localStorage.setItem('@RocketShoes: cart', JSON.stringify(cart));
    console.log('item inserido no storage')
  }, [cart])

  const addProduct = async (productId: number) => {
    try {
      const response = api(`products/${productId}`);
      const product: Product = (await response).data

      !product.amount ? product.amount = QNTD_CALCULO : product.amount += product.amount;

      const haveInCart = cart.find(product => product.id === productId);
      haveInCart ? updateProductAmount({ amount: QNTD_CALCULO, productId }) :
        updateProductAmount({ amount: 2, productId })
          .then(() => setCart([...cart, product]));
    } catch {
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      cart.forEach((product, index) => {
        if (product.id === productId) {
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
        if (product.id === productId) {
          console.log('amount', amount)
          console.log(product)
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
