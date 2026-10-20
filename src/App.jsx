import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import BandeauDemo from './components/common/BandeauDemo';
import AppRoutes from './routes/AppRoutes';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BandeauDemo />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
