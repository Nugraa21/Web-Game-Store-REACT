import React, { createContext, useState } from 'react';
import { db } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

  const login = async (email, password) => {
    try {
      console.log('Attempting login for email:', email);
      const userDoc = await getDoc(doc(db, 'users', email));
      if (!userDoc.exists()) {
        setError('User not found');
        console.log('Login failed: User not found');
        return false;
      }
      const userData = userDoc.data();
      if (userData.password !== password) {
        setError('Invalid password');
        console.log('Login failed: Invalid password');
        return false;
      }
      setCurrentUser(userData);
      setError('');
      console.log('Login successful:', userData);
      return true;
    } catch (err) {
      setError('Failed to login: ' + err.message);
      console.error('Login error:', err);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      console.log('Attempting registration for email:', userData.email);
      const userDoc = doc(db, 'users', userData.email);
      const existingUser = await getDoc(userDoc);
      if (existingUser.exists()) {
        setError('Email already registered');
        console.log('Registration failed: Email already registered');
        return false;
      }
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      const newUser = { ...userData, pin, chats: [], email: userData.email };
      console.log('Writing new user to Firestore:', newUser);
      await setDoc(userDoc, newUser);
      setCurrentUser(newUser);
      setError('');
      console.log('Registration successful:', newUser);
      return true;
    } catch (err) {
      setError('Failed to register: ' + err.message);
      console.error('Registration error:', err);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setError('');
    console.log('User logged out');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};