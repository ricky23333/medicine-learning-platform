import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area,
} from 'recharts';
import { TrendingUp, Users, Eye, ClipboardList, FlaskConical } from 'lucide-react';
import { VISIT_DATA, SYSTEM_STATS, SPECIMEN_CATEGORY_STATS } from '../../data/mockData';
import { useApp } from '../../store/AppContext';

export default function Statistics() {
  const { users, specimens, examRecords } = useApp();
  const [period, setPeriod] = useState<7 | 14 | 30>(30);

  const visitData = VISIT_DATA.slice(-period);

  const examScoreData = [
    { score: '0-5', count: 8 },
    { score: '6-10', count: 24 },
    { score: '11-15', count: 67 },
    { score: '16-18', count: 89 },
    { score: '19-20', count: 43 },
  ];

  const museumAccessData = [
    { name: '中药材（饮片）馆', views: 8234, exams: 1456 },
    { name: '药用植物馆', views: 3122, exams: 436 },
  ];

  const userGrowthData = VISIT_DATA.slice(-period).map((d, i) => ({
    date: d.date,
    newUsers: Math.floor(Math.random() * 8) + 1,
    totalUsers: 280 + i * 2,
  }));

  const metrics = [
    { label: '今日访问量', value: SYSTEM_STATS.todayVisits, sub: '较昨日 +12.4%', icon: Eye, color: '#1b3a2d' },
    { label: '总访问量', value: SYSTEM_STATS.totalVisits.toLocaleString(), sub: '累计', icon: TrendingUp, color: '#2d6a4f' },
    { label: '活跃用户', value: users.filter(u => u.status === 'active').length, sub: '注册用户', icon: Users, color: '#40916c' },
    { label: '考试总次数', value: SYSTEM_STATS.totalExams.toLocaleString(), sub: '累计', icon: ClipboardList, color: '#52b788' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800">系统统计</h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: '14px' }}>系统运行数据分析</p>
        </div>
        <div className="flex gap-2">
          {([7, 14, 30] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: period === p ? '#2d6a4f' : '#f5f5f5', color: period === p ? '#fff' : '#666', fontSize: '13px' }}>
              近{p}天
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${m.color}18` }}>
                <m.icon className="w-5 h-5" style={{ color: m.color }} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>{m.value}</div>
            <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{m.label}</div>
            <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '2px' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Visit trend */}
      <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
        <h3 className="text-gray-700 mb-4">访问量趋势（近{period}天）</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={visitData}>
            <defs>
              <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#52b788" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#52b788" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} tickLine={false}
              interval={Math.floor(period / 7) - 1} />
            <YAxis tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #eee', fontSize: '12px' }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey="visits" stroke="#2d6a4f" strokeWidth={2} fill="url(#visitGrad)" name="访问次数" />
            <Area type="monotone" dataKey="users" stroke="#52b788" strokeWidth={2} fill="url(#userGrad)" name="访问用户数" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Exam score distribution */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
          <h3 className="text-gray-700 mb-4">考试成绩分布</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={examScoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="score" tick={{ fontSize: 12, fill: '#888' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#888' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="count" name="考试人次" fill="#52b788" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category distribution */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
          <h3 className="text-gray-700 mb-4">标本分类统计</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SPECIMEN_CATEGORY_STATS} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#555' }} width={80} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="count" name="标本数量" fill="#2d6a4f" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Museum access stats */}
      <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
        <h3 className="text-gray-700 mb-4">各标本馆访问统计</h3>
        <div className="space-y-4">
          {museumAccessData.map(m => (
            <div key={m.name} className="p-4 rounded-xl" style={{ background: '#f8faf8' }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>{m.name}</span>
                <div className="flex gap-4">
                  <span style={{ fontSize: '13px', color: '#888' }}>👁 {m.views.toLocaleString()} 次访问</span>
                  <span style={{ fontSize: '13px', color: '#888' }}>📝 {m.exams.toLocaleString()} 次考试</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between mb-1" style={{ fontSize: '12px', color: '#888' }}>
                    <span>浏览量</span><span>{m.views.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: '#e8f5e9' }}>
                    <div className="h-full rounded-full" style={{ width: `${(m.views / 12000 * 100)}%`, background: '#2d6a4f' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1" style={{ fontSize: '12px', color: '#888' }}>
                    <span>考试次数</span><span>{m.exams.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: '#e8f5e9' }}>
                    <div className="h-full rounded-full" style={{ width: `${(m.exams / 2000 * 100)}%`, background: '#52b788' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}