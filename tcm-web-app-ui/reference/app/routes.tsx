import { createBrowserRouter, Navigate } from 'react-router';
import LoginPage from './components/LoginPage';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import MuseumManagement from './components/admin/MuseumManagement';
import SpecimenManagement from './components/admin/SpecimenManagement';
import AccountManagement from './components/admin/AccountManagement';
import ReviewCenter from './components/admin/ReviewCenter';
import Statistics from './components/admin/Statistics';
import MyUploads from './components/admin/MyUploads';
import MobileSimulator from './components/mobile/MobileSimulator';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'museums', element: <MuseumManagement /> },
      { path: 'specimens', element: <SpecimenManagement /> },
      { path: 'accounts', element: <AccountManagement /> },
      { path: 'reviews', element: <ReviewCenter /> },
      { path: 'statistics', element: <Statistics /> },
      { path: 'my-uploads', element: <MyUploads /> },
    ],
  },
  {
    path: '/mobile',
    element: <MobileSimulator />,
  },
]);
