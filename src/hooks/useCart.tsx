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
     const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: stock } = await api.get(`/stock/${productId}`);
      const stockAmout = stock.amount;
      if( stockAmout < 1) {
        toast.error('Quantidade solicitada fora de estoque');
      } else {
        const product = cart.find((product) => product.id === productId);
        if(!product) {
          const { data } = await api.get(`/products/${productId}`);
          const newCart = cart.map(product => {
            return product;
          });
          newCart.push({
            ...data,
            amount: 1,
          })     
          setCart(newCart);  
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));        
        } else {
          if( stockAmout < (product.amount + 1)) {
            toast.error('Quantidade solicitada fora de estoque');
          } else {
            const newCart = cart.map(product => {
              if(product.id === productId) {
                return {
                  ...product, amount: product.amount + 1
                };
              }
              return product;
            });
            setCart(newCart);
            localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
          }
        } 
      }    

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = async(productId: number) => {
    try {
      const productExist = cart.find(product => product.id === productId);
      if( productExist ) {
        const newCart = cart.filter(product => product.id !== productId)
        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      } else {
        toast.error('Erro na remoção do produto');  
      } 
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if(amount > 0) {
        const { data } = await api.get(`stock/${productId}`);
        const stockAmout = data.amount;
        if( amount > stockAmout) {
          toast.error('Quantidade solicitada fora de estoque');
        } else {
          const newCart = cart.map(product => {
            if(product.id === productId) {
              return {
                ...product, amount
              };
            }
            return product;
          });
          setCart(newCart);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
        }
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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
