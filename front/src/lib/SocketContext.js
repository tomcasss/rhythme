import { createContext, useContext } from 'react';

export const SocketCtx = createContext(null);
export const useSocket = () => useContext(SocketCtx);

export default SocketCtx;
