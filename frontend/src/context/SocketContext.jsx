import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { token } = useAuth();
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // Initialize socket - allow connection without token for public tracking
        socketRef.current = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
            auth: token ? { token } : {},
            transports: ['websocket'],
        });

        socketRef.current.on('connect', () => {
            console.log('🔌 Socket connected locally');
            setConnected(true);
        });
        
        socketRef.current.on('disconnect', () => setConnected(false));

        return () => {
            socketRef.current?.disconnect();
        };
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);