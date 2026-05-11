import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router';
import {
  LayoutDashboard, Building2, FlaskConical, Users, CheckSquare,
  BarChart3, LogOut, ChevronRight, Menu, X, Bell, Crown, Upload, Smartphone
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

const ADMIN_NAV = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: '系统概况' },
  { path: '/admin/museums', icon: Building2, label: '标本馆管理' },
  { path: '/admin/specimens', icon: FlaskConical, label: '标本信息' },
  { path: '/admin/accounts', icon: Users, label: '账号管理' },
  { path: '/admin/reviews', icon: CheckSquare, label: '审核中心', badge: true },
  { path: '/admin/statistics', icon: BarChart3, label: '系统统计' },
];

const VIP_NAV = [
  { path: '/admin/my-uploads', icon: Upload, label: '我的上传' },
  { path: '/admin/specimens', icon: FlaskConical, label: '标本浏览' },
];

export default function AdminLayout() {
  const { currentUser, logout, vipApplications, registrationApplications } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auth guard
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role !== 'admin' && currentUser.role !== 'vip_teacher') {
    return <Navigate to="/mobile" replace />;
  }

  const isAdmin = currentUser?.role === 'admin';
  const isVip = currentUser?.role === 'vip_teacher';
  const navItems = isAdmin ? ADMIN_NAV : VIP_NAV;

  const pendingCount =
    vipApplications.filter(a => a.status === 'pending').length +
    registrationApplications.filter(a => a.status === 'pending').length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLabel = isAdmin ? '超级管理员' : 'VIP教师';
  const roleColor = isAdmin ? '#d4a843' : '#52b788';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0f4f0' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col transition-all duration-300 flex-shrink-0"
        style={{
          width: sidebarOpen ? '220px' : '64px',
          background: 'linear-gradient(180deg, #0d2818 0%, #1b3a2d 100%)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xl" style={{ background: 'rgba(82, 183, 136, 0.2)' }}>
            🌿
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-white whitespace-nowrap" style={{ fontSize: '13px', fontWeight: 600 }}>中药数字标本馆</div>
              <div className="whitespace-nowrap" style={{ fontSize: '11px', color: '#52b788' }}>管理平台</div>
            </div>
          )}
        </div>

        {/* User info */}
        <div className="px-3 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(82,183,136,0.25)', fontSize: '14px' }}>
              {currentUser?.name?.[0] || '?'}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <div className="text-white truncate" style={{ fontSize: '13px', fontWeight: 500 }}>{currentUser?.name}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  {isAdmin && <Crown className="w-3 h-3" style={{ color: '#d4a843' }} />}
                  <span style={{ fontSize: '11px', color: roleColor }}>{roleLabel}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative"
                style={{
                  background: isActive ? 'rgba(82,183,136,0.2)' : 'transparent',
                  color: isActive ? '#95d5b2' : 'rgba(255,255,255,0.6)',
                  borderLeft: isActive ? '3px solid #52b788' : '3px solid transparent',
                }}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span style={{ fontSize: '13px', fontWeight: isActive ? 500 : 400 }}>{item.label}</span>}
                {item.badge && pendingCount > 0 && (
                  <span className="ml-auto flex-shrink-0 rounded-full text-white flex items-center justify-center"
                    style={{ fontSize: '10px', background: '#ef4444', minWidth: '16px', height: '16px', padding: '0 4px' }}>
                    {pendingCount}
                  </span>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-2 pb-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all"
            style={{ color: 'rgba(255,100,100,0.7)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span style={{ fontSize: '13px' }}>退出登录</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 bg-white flex-shrink-0" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', zIndex: 10 }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-4 h-4 text-gray-600" /> : <Menu className="w-4 h-4 text-gray-600" />}
          </button>

          <div className="flex items-center gap-3">
            {isAdmin && pendingCount > 0 && (
              <button
                onClick={() => navigate('/admin/reviews')}
                className="relative p-2 rounded-lg transition-colors hover:bg-gray-100"
              >
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                  style={{ background: '#ef4444', fontSize: '9px' }}>
                  {pendingCount}
                </span>
              </button>
            )}
            <button
              onClick={() => navigate('/mobile')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-100"
              title="移动端预览"
            >
              <Smartphone className="w-4 h-4 text-gray-500" />
              <span style={{ fontSize: '12px', color: '#888' }}>移动端</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: '#f4f4f5' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ background: '#2d6a4f', color: '#fff', fontSize: '11px' }}>
                {currentUser?.name?.[0]}
              </div>
              <span style={{ fontSize: '13px', color: '#333' }}>{currentUser?.name}</span>
              <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: isAdmin ? '#fef3c7' : '#d1fae5', color: isAdmin ? '#92400e' : '#065f46', fontSize: '11px' }}>
                {roleLabel}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}