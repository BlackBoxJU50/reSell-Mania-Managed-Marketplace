import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

const MainContent = ({ user }) => {
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  // Admin Portal is specifically at '/' for admins, but we want the admin layout
  // for anything they access while logged in as admin to keep it professional.
  const isAdminView = isAdmin && (location.pathname === '/' || location.pathname.startsWith('/admin'));

  return (
    <div className="min-h-screen bg-background">
      {!isAdminView && <Navbar />}
      <main className={isAdminView ? "w-full" : "container mx-auto px-4 py-8"}>
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
      {!isAdminView && <Footer />}
    </div>
  );
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
    window.addEventListener('storage', syncUser);
    window.addEventListener('user-login', syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('user-login', syncUser);
    };
  }, []);

  return (
    <Router>
      <MainContent user={user} />
    </Router>
  );
}

export default App;
