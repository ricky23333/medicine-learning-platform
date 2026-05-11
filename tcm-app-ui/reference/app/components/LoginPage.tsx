import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Lock, Phone, Leaf, AlertCircle } from 'lucide-react';
import { useApp } from '../store/AppContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'demo'>('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone) { setError('请输入手机号'); return; }
    if (!password) { setError('请输入密码'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = login(phone, password);
    setLoading(false);
    if (result.success) {
      // Redirect based on role - check current user from state
      const user = result.user;
      if (user?.role === 'student' || user?.role === 'teacher') {
        navigate('/mobile');
      } else {
        navigate('/admin');
      }
    } else {
      setError(result.message);
    }
  };

  const quickLogin = async (p: string, pw: string) => {
    setPhone(p);
    setPassword(pw);
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = login(p, pw);
    setLoading(false);
    if (result.success) {
      if (result.user?.role === 'student' || result.user?.role === 'teacher') {
        navigate('/mobile');
      } else {
        navigate('/admin');
      }
    } else {
      setError(result.message);
    }
  };

  const demoAccounts = [
    { label: '超级管理员', phone: '13800000001', password: 'admin2024', color: '#1b3a2d', badge: '管理员' },
    { label: 'VIP教师（张教授）', phone: '13800000003', password: 'teacher123', color: '#2d6a4f', badge: 'VIP教师' },
    { label: '普通教师（王老师）', phone: '13800000004', password: '888888', color: '#40916c', badge: '教师' },
    { label: '学生（陈小红）', phone: '13800000005', password: '888888', color: '#52b788', badge: '学生' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0d2818 0%, #1b3a2d 40%, #2d6a4f 100%)' }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #95d5b2, transparent)' }} />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #52b788, transparent)' }} />

        <div className="relative z-10 text-center max-w-md">
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-5xl" style={{ background: 'rgba(82, 183, 136, 0.2)', border: '2px solid rgba(82, 183, 136, 0.4)' }}>
              🌿
            </div>
          </div>
          <h1 className="text-white mb-4" style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '4px' }}>
            TCM数字标本学习助手
          </h1>
          <p className="text-green-300 mb-8" style={{ fontSize: '15px', lineHeight: '1.8' }}>
            数字化中药标本资源管理平台<br />
            服务高校中医药学科教学与科研
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { num: '2个', label: '标本馆' },
              { num: '18+', label: '标本种类' },
              { num: '342', label: '注册用户' },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-green-300 mb-1" style={{ fontSize: '20px', fontWeight: 600 }}>{item.num}</div>
                <div className="text-green-400" style={{ fontSize: '12px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="w-full lg:w-[480px] flex items-center justify-center p-8" style={{ background: 'rgba(255,255,255,0.97)' }}>
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl" style={{ background: '#e8f5e9' }}>
              🌿
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1b3a2d' }}>中药数字标本馆</h1>
              <p style={{ fontSize: '12px', color: '#52b788' }}>管理端登录</p>
            </div>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#1b3a2d', marginBottom: '6px' }}>欢迎登录</h2>
            <p style={{ fontSize: '14px', color: '#717182' }}>管理端 · 超级管理员 & VIP教师</p>
          </div>

          {/* Tab */}
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: '#f4f4f5' }}>
            {(['login', 'demo'] as const).map(t => (
              <button
                key={t}
                onClick={() => setMode(t)}
                className="flex-1 py-2 rounded-lg transition-all"
                style={{
                  fontSize: '14px',
                  fontWeight: mode === t ? 600 : 400,
                  background: mode === t ? '#fff' : 'transparent',
                  color: mode === t ? '#1b3a2d' : '#717182',
                  boxShadow: mode === t ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                {t === 'login' ? '账号登录' : '演示账号'}
              </button>
            ))}
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label style={{ fontSize: '13px', color: '#555', marginBottom: '6px', display: 'block' }}>手机号</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#888' }} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="请输入手机号"
                    className="w-full rounded-xl pl-10 pr-4 py-3 outline-none transition-all"
                    style={{
                      background: '#f8f9fa',
                      border: '1.5px solid #e0e0e0',
                      fontSize: '14px',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#2d6a4f'}
                    onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#555', marginBottom: '6px', display: 'block' }}>密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#888' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full rounded-xl pl-10 pr-10 py-3 outline-none"
                    style={{
                      background: '#f8f9fa',
                      border: '1.5px solid #e0e0e0',
                      fontSize: '14px',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#2d6a4f'}
                    onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#888' }}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl p-3" style={{ background: '#fff0f0', border: '1px solid #ffc0c0' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#d4183d' }} />
                  <span style={{ fontSize: '13px', color: '#d4183d' }}>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white transition-all"
                style={{
                  background: loading ? '#888' : 'linear-gradient(135deg, #1b3a2d, #2d6a4f)',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? '登录中...' : '登 录'}
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>点击快速体验不同角色功能：</p>
              {demoAccounts.map(acc => (
                <button
                  key={acc.phone}
                  onClick={() => quickLogin(acc.phone, acc.password)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:opacity-90"
                  style={{ background: `${acc.color}14`, border: `1px solid ${acc.color}30` }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ background: acc.color, fontSize: '11px', fontWeight: 600 }}>
                    {acc.badge}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#222' }}>{acc.label}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>手机号：{acc.phone}</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded" style={{ background: acc.color, color: '#fff', fontSize: '11px' }}>
                    登录
                  </div>
                </button>
              ))}
              {error && (
                <div className="flex items-center gap-2 rounded-xl p-3" style={{ background: '#fff0f0' }}>
                  <AlertCircle className="w-4 h-4" style={{ color: '#d4183d' }} />
                  <span style={{ fontSize: '13px', color: '#d4183d' }}>{error}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-6" style={{ borderTop: '1px solid #eee' }}>
            <p style={{ fontSize: '12px', color: '#aaa', textAlign: 'center', lineHeight: '1.6' }}>
              移动端（微信小程序）供学生和教师使用<br />
              如需注册账号，请联系所在院校管理员
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}