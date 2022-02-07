import React from 'react';
import { Link } from 'react-router-dom';
import { MdNotListedLocation, MdShoppingBasket } from 'react-icons/md';

import logo from '../../assets/images/logo.svg';
import { Container, Cart } from './styles';
import { useCart } from '../../hooks/useCart';
import { access } from 'fs';
import { isDotDotDotToken } from 'typescript';


const Header = (): JSX.Element => {
  const { cart } = useCart();
  const list = [
    {
      id: 0
    }
  ];  
  const cartSize = cart.reduce((acc, product) => {
    const exist = list && list.find(item => item.id === product.id);
    if(!exist) {
      list.push(...list, {
        id: product.id
      })
      acc++
    }
    return acc;
  },0);

  return (
    <Container>
      <Link to="/">
        <img src={logo} alt="Rocketshoes" />
      </Link>

      <Cart to="/cart">
        <div>
          <strong>Meu carrinho</strong>
          <span data-testid="cart-size">
            {cartSize === 1 ? `${cartSize} item` : `${cartSize} itens`}
          </span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  );
};

export default Header;
