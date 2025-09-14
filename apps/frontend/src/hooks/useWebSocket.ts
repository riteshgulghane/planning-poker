import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './';
import { websocketActionCreators } from '../store/middleware/websocketMiddleware';

export const useWebSocket = () => {
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector((state) => state.user.isConnected);
  
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    dispatch(websocketActionCreators.connect(backendUrl));
    
    return () => {
      dispatch(websocketActionCreators.disconnect());
    };
  }, [dispatch]);
  
  return { isConnected };
};
