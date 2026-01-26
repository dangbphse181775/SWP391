import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import HomePage from '@/pages/common/HomePage';
import UserHomePage from '@/pages/User/UserHomePage';
import ProfilePage from '@/pages/common/ProfilePage';
import LoginPage from '@/pages/Auth/LoginPage';
import RegisterPage from '@/pages/Auth/RegisterPage';
import Sell from '@/pages/User/Sell';
function App() {
  return (
    <Router>
      <Routes>
        {/* Routes with Header and Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/user" element={<UserHomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route element={<MainLayout />}>
           <Route path="/sell" element={<Sell />} />
        </Route>


        {/* Auth Routes without Header and Footer */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;