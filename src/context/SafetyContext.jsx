import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const SafetyContext = createContext();

export const SafetyProvider = ({ children }) => {
  const [isSosActive, setIsSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(null);
  const [isDiscreetMode, setIsDiscreetMode] = useState(false);
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('shesafe_contacts');
    return saved ? JSON.parse(saved) : [
      { name: 'Emergency Contact 1', phone: '+1234567890' }
    ];
  });
  const [location, setLocation] = useState({ lat: 51.505, lng: -0.09 });
  const [sosHistory, setSosHistory] = useState(() => {
    const saved = localStorage.getItem('shesafe_sos_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentTrip, setCurrentTrip] = useState(null);
  const [rideLog, setRideLog] = useState(() => {
    const saved = localStorage.getItem('shesafe_ride_log');
    return saved ? JSON.parse(saved) : [];
  });

  const sosIntervalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('shesafe_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('shesafe_sos_history', JSON.stringify(sosHistory));
  }, [sosHistory]);

  useEffect(() => {
    localStorage.setItem('shesafe_ride_log', JSON.stringify(rideLog));
  }, [rideLog]);

  // Track Location
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const triggerSos = async () => {
    setIsSosActive(true);
    setSosCountdown(5);
  };

  const cancelSos = () => {
    setIsSosActive(false);
    setSosCountdown(null);
    if (sosIntervalRef.current) {
      clearInterval(sosIntervalRef.current);
      sosIntervalRef.current = null;
    }
  };

  const finalizeSos = async () => {
    setSosCountdown(null);
    const logEntry = {
      timestamp: new Date().toISOString(),
      location: { ...location },
      status: 'triggered'
    };
    setSosHistory(prev => [logEntry, ...prev]);

    // Send SMS via Backend
    try {
      await axios.post('http://localhost:5000/api/sos', {
        contacts,
        location,
        message: "SOS! I am in danger. Please help me. My live location is shared below."
      });
    } catch (err) {
      console.error('Failed to send SOS SMS:', err);
    }

    // Every 60s update
    sosIntervalRef.current = setInterval(async () => {
      console.log('Update: SOS ping every 60s', location);
      try {
        await axios.post('http://localhost:5000/api/sos', {
          contacts,
          location,
          message: "SOS UPDATE: Still in danger. Updated location."
        });
      } catch (err) {
        console.error('Update ping failed', err);
      }
    }, 60000);
  };

  useEffect(() => {
    let timer;
    if (sosCountdown !== null && sosCountdown > 0) {
      timer = setTimeout(() => setSosCountdown(sosCountdown - 1), 1000);
    } else if (sosCountdown === 0) {
      finalizeSos();
    }
    return () => clearTimeout(timer);
  }, [sosCountdown]);

  const markSafe = () => {
    cancelSos();
    alert('Safety Check: SOS deactivated and contacts notified that you are safe.');
  };

  return (
    <SafetyContext.Provider value={{
      isSosActive, triggerSos, cancelSos, sosCountdown,
      isDiscreetMode, setIsDiscreetMode,
      contacts, setContacts,
      location, setLocation,
      sosHistory,
      currentTrip, setCurrentTrip,
      rideLog, setRideLog,
      markSafe
    }}>
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => useContext(SafetyContext);
