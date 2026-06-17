import React, { createContext, useState, useContext, useEffect } from 'react';

const FarmContext = createContext();

export const FarmProvider = ({ children }) => {
  const [myFarms, setMyFarms] = useState(() => {
    try {
      const stored = localStorage.getItem('fasal_farms');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeFarmId, setActiveFarmId] = useState(() => {
    return localStorage.getItem('fasal_active_farm_id') || null;
  });

  useEffect(() => {
    localStorage.setItem('fasal_farms', JSON.stringify(myFarms));
  }, [myFarms]);

  useEffect(() => {
    if (activeFarmId) {
      localStorage.setItem('fasal_active_farm_id', activeFarmId);
    } else {
      localStorage.removeItem('fasal_active_farm_id');
    }
  }, [activeFarmId]);

  const addFarm = (farm) => {
    setMyFarms(prev => {
      const updated = [...prev, farm];
      if (updated.length === 1) setActiveFarmId(farm.id);
      return updated;
    });
  };

  const removeFarm = (farmId) => {
    setMyFarms(prev => {
      const updated = prev.filter(f => f.id !== farmId);
      if (activeFarmId === farmId) {
        setActiveFarmId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  const activeFarm = myFarms.find(f => f.id === activeFarmId) || myFarms[0] || null;

  return (
    <FarmContext.Provider value={{ myFarms, setMyFarms, activeFarmId, setActiveFarmId, activeFarm, addFarm, removeFarm }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarmContext = () => useContext(FarmContext);
