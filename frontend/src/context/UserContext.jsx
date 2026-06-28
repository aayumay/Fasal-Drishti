import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('fasal_user_name');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  const saveUserName = (name) => {
    setUserName(name);
    localStorage.setItem('fasal_user_name', name);
  };

  return (
    <UserContext.Provider value={{ userName, saveUserName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
