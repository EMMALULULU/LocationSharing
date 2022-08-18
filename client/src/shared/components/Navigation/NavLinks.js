import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import Button from '../FormElements/Button';
import { AuthContext } from '../../context/auth-context';
import './NavLinks.css';
export default function NavLinks() {
  const auth = useContext(AuthContext);
  const logoutHandler = () => {
    auth.logout();
  };
  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/"> ALL USERS</NavLink>
      </li>
      {auth.isLoggedIn && (
        <li>
          <NavLink to={`/${auth.userId}/places`}>MY PLACES</NavLink>
        </li>
      )}

      {auth.isLoggedIn && (
        <li>
          <NavLink to="/places/new ">ADD PLACE </NavLink>
        </li>
      )}
      {!auth.isLoggedIn && (
        <li>
          <NavLink to="/login">LOG IN </NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <Button onClick={logoutHandler}>LOG OUT</Button>
        </li>
      )}
    </ul>
  );
}
