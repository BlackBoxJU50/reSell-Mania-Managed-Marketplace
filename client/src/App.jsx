import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPortal from './pages/AdminPortal';
import AssetDetails from './pages/AssetDetails';
import LiquidationForm from './pages/LiquidationForm';
import UserDashboard from './pages/UserDashboard';
import Products from './pages/Products';
import Cart from './pages/Cart';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
};

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const syncUser = () => {
      try {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        } else {
          setUser(null);
        }
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    };

    syncUser();
    // Listen for storage events (login/logout in other tabs)
    window.addEventListener('storage', syncUser);
    // Custom event for same-tab login
    window.addEventListener('user-login', syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('user-login', syncUser);
    };
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={isAdmin ? <AdminPortal /> : <Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={<ProtectedRoute><UserDashboard /></ProtectedRoute>}
            />
            <Route path="/asset/:id" element={<AssetDetails />} />
            <Route
              path="/sell"
              element={<ProtectedRoute><LiquidationForm /></ProtectedRoute>}
            />
            <Route path="/assets" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/all" element={<Products />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
