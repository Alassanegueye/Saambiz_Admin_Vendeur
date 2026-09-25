import { useContext } from 'react';
import { AuthContext } from '../contexts/authContexte';

export const useAuth = () => useContext(AuthContext);
