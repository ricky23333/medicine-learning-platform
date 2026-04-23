import React, { useState, useMemo } from 'react';
import { Search, Plus, Upload, Edit2, Trash2, X, Users, Crown, GraduationCap, BookOpen, ChevronDown } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import type { User } from '../../data/types';

const ROLE_LABELS: Record<string, string> = {
  student: '学生', teacher: '教师', vip_teacher: 'VIP教师', admin: '管理员',
};
const STATUS_LABELS: Record<string, string> = {
  pending: '待审核', active: '正常', suspended: '已停用',
};
const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  student: { bg: '#e8f5e9', text: '#2d6a4f' },
  teacher: { bg: '#e3f2fd', text: '#1565c0' },
  vip_teacher: { bg: '#fef3c7', text: '#92400e' },
  admin: { bg: '#fce7f3', text: '#9d174d' },
};
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fff8e1', text: '#f57f17' },
  active: { bg: '#e8f5e9', text: '#2d6a4f' },
  suspended: { bg: '#ffebee', text: '#c62828' },
};

export default function AccountManagement() {
  const { users, addUser, updateUser, deleteUser, batchImportUsers } = useApp();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [batchType, setBatchType] = useState<'student' | 'teacher'>('student');
  const [form, setForm] = useState<Partial<User>>({ name: '', phone: '', role: 'student', status: 'active', unit: '', vipStatus: 'none', firstLogin: true });
  const [activeTab, setActiveTab] = useState<'list' | 'register'>('list');

  const filtered = useMemo(() => users.filter(u => {
    const matchSearch = !search || u.name.includes(search) || u.phone.includes(search) || u.unit.includes(search);
    const matchRole = !filterRole || u.role === filterRole;
    const matchStatus = !filterStatus || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  }), [users, search, filterRole, filterStatus]);

  const handleAddUser = () => {
    if (!form.name || !form.phone) return;
    addUser({
      name: form.name!, phone: form.phone!, password: '888888',
      role: form.role || 'student', status: form.status || 'active',
      unit: form.unit || '', studentId: form.studentId, major: form.major,
      vipStatus: 'none', firstLogin: true,
    });
    setShowAddUser(false);
    setForm({ name: '', phone: '', role: 'student', status: 'active', unit: '', vipStatus: 'none', firstLogin: true });
  };

  const handleBatchImport = () => {
    const lines = batchText.split('\n').filter(l => l.trim());
    const newUsers: Omit<User, 'id' | 'createdAt'>[] = [];
    for (const line of lines) {
      const parts = line.split(/[,，\t]+/).map(p => p.trim());
      if (parts.length < 3) continue;
      if (batchType === 'student') {
        // name, major_grade, student_id, unit, phone
        newUsers.push({
          name: parts[0], major: parts[1], studentId: parts[2], unit: parts[3] || '',
          phone: parts[4] || `${Date.now()}`, password: '888888', role: 'student',
          status: 'active', vipStatus: 'none', firstLogin: true,
        });
      } else {
        // name, contact, unit, phone
        newUsers.push({
          name: parts[0], contact: parts[1], unit: parts[2] || '', phone: parts[3] || `${Date.now()}`,
          password: '888888', role: 'teacher', status: 'active', vipStatus: 'none', firstLogin: true,
        });
      }
    }
    if (newUsers.length > 0) {
      batchImportUsers(newUsers);
      setBatchText('');
      setShowBatchImport(false);
    }
  };

  const Modal = ({ title, onClose, children, onConfirm, wide = false }: {
    title: string; onClose: () => void; children: React.ReactNode; onConfirm?: () => void; wide?: boolean;
  }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full" style={{ maxWidth: wide ? '640px' : '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>{children}</div>
        {onConfirm && (
          <div className="flex gap-3 px-6 pb-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border hover:bg-gray-50" style={{ fontSize: '14px', borderColor: '#ddd' }}>取消</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-white" style={{ background: '#2d6a4f', fontSize: '14px' }}>确认</button>
          </div>
        )}
      </div>
    </div>
  );

  const UserFormFields = ({ data, onChange }: { data: Partial<User>; onChange: (d: Partial<User>) => void }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>姓名 *</label>
          <input value={data.name || ''} onChange={e => onChange({ ...data, name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
        </div>
        <div>
          <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>手机号 *</label>
          <input value={data.phone || ''} onChange={e => onChange({ ...data, phone: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>角色</label>
          <select value={data.role || 'student'} onChange={e => onChange({ ...data, role: e.target.value as any })}
            className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }}>
            <option value="student">学生</option>
            <option value="teacher">教师</option>
            <option value="vip_teacher">VIP教师</option>
          </select>
        </div>
        <div>
          <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>状态</label>
          <select value={data.status || 'active'} onChange={e => onChange({ ...data, status: e.target.value as any })}
            className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }}>
            <option value="active">正常</option>
            <option value="pending">待审核</option>
            <option value="suspended">已停用</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>所属单位</label>
        <input value={data.unit || ''} onChange={e => onChange({ ...data, unit: e.target.value })}
          placeholder="所在院校/单位" className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
      </div>
      {(data.role === 'student') && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>学号</label>
            <input value={data.studentId || ''} onChange={e => onChange({ ...data, studentId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>专业年级</label>
            <input value={data.major || ''} onChange={e => onChange({ ...data, major: e.target.value })}
              placeholder="如：中医学2022级" className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-gray-800">账号管理</h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: '14px' }}>共 {users.length} 个账号</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBatchImport(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors"
            style={{ background: '#e8f5e9', color: '#2d6a4f', fontSize: '14px' }}>
            <Upload className="w-4 h-4" />批量导入
          </button>
          <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white"
            style={{ background: '#2d6a4f', fontSize: '14px' }}>
            <Plus className="w-4 h-4" />新增账号
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '学生', count: users.filter(u => u.role === 'student').length, icon: GraduationCap, color: '#2d6a4f' },
          { label: '教师', count: users.filter(u => u.role === 'teacher').length, icon: BookOpen, color: '#1565c0' },
          { label: 'VIP教师', count: users.filter(u => u.role === 'vip_teacher').length, icon: Crown, color: '#92400e' },
          { label: '待审核', count: users.filter(u => u.status === 'pending').length, icon: Users, color: '#c62828' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 flex items-center gap-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索姓名、手机号、单位..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none bg-white"
            style={{ border: '1px solid #e0e0e0', fontSize: '14px' }} />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white outline-none" style={{ border: '1px solid #e0e0e0', fontSize: '14px' }}>
          <option value="">全部角色</option>
          <option value="student">学生</option>
          <option value="teacher">教师</option>
          <option value="vip_teacher">VIP教师</option>
          <option value="admin">管理员</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white outline-none" style={{ border: '1px solid #e0e0e0', fontSize: '14px' }}>
          <option value="">全部状态</option>
          <option value="active">正常</option>
          <option value="pending">待审核</option>
          <option value="suspended">已停用</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f8faf8', borderBottom: '1px solid #f0f0f0' }}>
                {['姓名', '手机号', '角色', '所属单位', '学号/专业', '状态', '注册时间', '操作'].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ fontSize: '13px', color: '#888', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f5f5f5' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                        style={{ background: '#2d6a4f', fontSize: '12px' }}>
                        {user.name[0]}
                      </div>
                      <span style={{ fontSize: '14px', color: '#222' }}>{user.name}</span>
                      {user.role === 'vip_teacher' && <Crown className="w-3 h-3" style={{ color: '#d4a843' }} />}
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: '13px', color: '#555' }}>{user.phone}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full" style={{ ...ROLE_COLORS[user.role], fontSize: '12px' }}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: '13px', color: '#555' }}>{user.unit || '—'}</td>
                  <td className="px-4 py-3" style={{ fontSize: '12px', color: '#888' }}>
                    {user.studentId ? `${user.studentId} · ${user.major || ''}` : user.contact || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full" style={{ ...STATUS_COLORS[user.status], fontSize: '12px' }}>
                      {STATUS_LABELS[user.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: '12px', color: '#888' }}>{user.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditUser({ ...user })} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      {user.role !== 'admin' && (
                        <button onClick={() => { if (window.confirm(`确认删除用户「${user.name}」？`)) deleteUser(user.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p style={{ fontSize: '14px', color: '#aaa' }}>暂无匹配账号</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <Modal title="新增账号" onClose={() => setShowAddUser(false)} onConfirm={handleAddUser}>
          <UserFormFields data={form} onChange={setForm} />
          <div className="mt-3 p-3 rounded-xl" style={{ background: '#fff8e1' }}>
            <p style={{ fontSize: '12px', color: '#f57f17' }}>初始密码将设置为 888888，用户首次登录需修改密码。</p>
          </div>
        </Modal>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <Modal title="编辑账号" onClose={() => setEditUser(null)} onConfirm={() => { updateUser(editUser.id, editUser); setEditUser(null); }}>
          <UserFormFields data={editUser} onChange={d => setEditUser(d as User)} />
        </Modal>
      )}

      {/* Batch Import Modal */}
      {showBatchImport && (
        <Modal title="批量导入账号" onClose={() => setShowBatchImport(false)} onConfirm={handleBatchImport} wide>
          <div className="space-y-4">
            <div className="flex gap-2">
              {(['student', 'teacher'] as const).map(t => (
                <button key={t} onClick={() => setBatchType(t)}
                  className="px-4 py-2 rounded-xl transition-colors"
                  style={{ background: batchType === t ? '#2d6a4f' : '#f5f5f5', color: batchType === t ? '#fff' : '#555', fontSize: '13px' }}>
                  {t === 'student' ? '学生信息' : '教师信息'}
                </button>
              ))}
            </div>
            <div className="p-3 rounded-xl" style={{ background: '#e8f5e9' }}>
              <p style={{ fontSize: '12px', color: '#2d6a4f', fontWeight: 500, marginBottom: '4px' }}>
                {batchType === 'student' ? '学生数据格式：' : '教师数据格式：'}
              </p>
              <p style={{ fontSize: '12px', color: '#555', fontFamily: 'monospace' }}>
                {batchType === 'student'
                  ? '姓名, 专业年级, 学号, 所在单位, 手机号'
                  : '姓名, 联系方式, 所在单位, 手机号'}
              </p>
              <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>每行一条记录，逗号或Tab分隔</p>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>粘贴数据</label>
              <textarea value={batchText} onChange={e => setBatchText(e.target.value)}
                placeholder={batchType === 'student'
                  ? "张三, 中医学2022级, 20220001, 北京中医药大学, 13800001111\n李四, 中药学2022级, 20220002, 北京中医药大学, 13800002222"
                  : "王老师, 中药学院, 上海中医药大学, 13900001111\n赵老师, 中医临床学院, 广州中医药大学, 13900002222"}
                rows={8} className="w-full px-3 py-2.5 rounded-xl outline-none resize-none"
                style={{ border: '1.5px solid #e0e0e0', fontSize: '13px', fontFamily: 'monospace' }} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
