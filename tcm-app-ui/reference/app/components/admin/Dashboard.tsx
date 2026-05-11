import React from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, FlaskConical, ClipboardList, Eye, TrendingUp, BookOpen,
  CheckCircle, Clock, Crown
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { VISIT_DATA, SYSTEM_STATS, SPECIMEN_CATEGORY_STATS } from '../../data/mockData';

export default function Dashboard() {
  const { museums, specimens, users, examRecords, vipApplications, registrationApplications } = useApp();

  const pendingVip = vipApplications.filter(a => a.status === 'pending').length;
  const pendingReg = registrationApplications.filter(a => a.status === 'pending').length;
  const pendingImages = specimens.flatMap(s => s.images).filter(img => img.status === 'pending').length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const vipUsers = users.filter(u => u.role === 'vip_teacher').length;

  const statCards = [
    { label: '系统总访问量', value: SYSTEM_STATS.totalVisits.toLocaleString(), icon: Eye, color: '#1b3a2d', bg: '#e8f5e9', trend: '+12.4%' },
    { label: '注册用户数', value: activeUsers.toString(), icon: Users, color: '#2d6a4f', bg: '#d4edda', trend: '+5.2%' },
    { label: '馆藏标本数', value: specimens.length.toString(), icon: FlaskConical, color: '#40916c', bg: '#c3e6cb', trend: '+3.1%' },
    { label: '考试总次数', value: SYSTEM_STATS.totalExams.toLocaleString(), icon: ClipboardList, color: '#52b788', bg: '#b7e4c7', trend: '+18.7%' },
  ];

  const recentVisitData = VISIT_DATA.slice(-14);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-800">系统概况</h1>
        <p className="text-gray-500 mt-1" style={{ fontSize: '14px' }}>欢迎回来，查看系统实时数据</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <span className="text-xs flex items-center gap-1" style={{ color: '#22c55e' }}>
                <TrendingUp className="w-3 h-3" />{card.trend}
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Visit trend chart */}
        <div className="xl:col-span-2 bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
          <h3 className="text-gray-700 mb-4">近14天访问趋势</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={recentVisitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #eee', fontSize: '12px' }}
                labelStyle={{ color: '#333', fontWeight: 500 }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="visits" stroke="#2d6a4f" strokeWidth={2.5} dot={false} name="访问次数" />
              <Line type="monotone" dataKey="users" stroke="#52b788" strokeWidth={2} strokeDasharray="4 4" dot={false} name="访问用户" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category distribution */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
          <h3 className="text-gray-700 mb-4">标本分类分布</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={SPECIMEN_CATEGORY_STATS.slice(0, 6)}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="count"
                nameKey="name"
              >
                {SPECIMEN_CATEGORY_STATS.slice(0, 6).map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {SPECIMEN_CATEGORY_STATS.slice(0, 4).map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.fill }} />
                  <span style={{ fontSize: '12px', color: '#555' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#333' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending tasks */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
          <h3 className="text-gray-700 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: '#f59e0b' }} />
            待处理事项
          </h3>
          <div className="space-y-3">
            {[
              { label: '注册申请审核', count: pendingReg, path: '/admin/reviews', color: '#3b82f6' },
              { label: 'VIP申请审核', count: pendingVip, path: '/admin/reviews', color: '#8b5cf6' },
              { label: '图片上传审核', count: pendingImages, path: '/admin/reviews', color: '#f59e0b' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#f8f9fa' }}>
                <span style={{ fontSize: '13px', color: '#555' }}>{item.label}</span>
                <span className="px-2.5 py-0.5 rounded-full text-white" style={{ background: item.count > 0 ? item.color : '#ccc', fontSize: '12px', fontWeight: 500 }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Museum overview */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
          <h3 className="text-gray-700 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: '#2d6a4f' }} />
            标本馆概览
          </h3>
          <div className="space-y-3">
            {museums.map(m => {
              const count = specimens.filter(s => s.museumId === m.id).length;
              const total = specimens.length;
              const pct = total > 0 ? Math.round(count / total * 100) : 0;
              return (
                <div key={m.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span style={{ fontSize: '13px', color: '#555' }}>{m.icon} {m.name}</span>
                    <span style={{ fontSize: '12px', color: '#888' }}>{count}种</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#e8f5e9' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#2d6a4f' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User composition */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
          <h3 className="text-gray-700 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: '#2d6a4f' }} />
            用户构成
          </h3>
          <div className="space-y-3">
            {[
              { label: '学生', count: users.filter(u => u.role === 'student').length, color: '#52b788' },
              { label: '教师', count: users.filter(u => u.role === 'teacher').length, color: '#40916c' },
              { label: 'VIP教师', count: vipUsers, color: '#2d6a4f', icon: <Crown className="w-3 h-3" /> },
              { label: '管理员', count: users.filter(u => u.role === 'admin').length, color: '#1b3a2d' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span style={{ fontSize: '13px', color: '#555', flex: 1 }} className="flex items-center gap-1">
                  {item.icon}{item.label}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>{item.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #f0f0f0' }}>
            <div className="flex justify-between">
              <span style={{ fontSize: '13px', color: '#888' }}>待审核用户</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: users.filter(u => u.status === 'pending').length > 0 ? '#f59e0b' : '#888' }}>
                {users.filter(u => u.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
