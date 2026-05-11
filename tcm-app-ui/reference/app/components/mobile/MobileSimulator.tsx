import React, { useState, useMemo, useRef } from 'react';
import {
  Home, Search, ClipboardList, History, User, ChevronRight, ChevronLeft,
  X, Check, AlertCircle, Eye, EyeOff, Lock, Phone, Crown, LogOut,
  BookOpen, FlaskConical, ArrowLeft, ZoomIn, ZoomOut, RotateCcw,
  Clock, CheckCircle, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../store/AppContext';
import type { Museum, Specimen, ExamRecord } from '../../data/types';

type MobilePage = 'login' | 'register' | 'change-password' | 'home' | 'browse-museums' | 'browse-categories' | 'browse-specimens' | 'specimen-detail' | 'exam-select' | 'exam-doing' | 'exam-result' | 'history' | 'history-detail' | 'profile' | 'vip-apply';

interface MobileAppState {
  page: MobilePage;
  selectedMuseum?: Museum;
  selectedCategoryId?: string;
  currentSpecimen?: Specimen;
  examRecord?: ExamRecord;
  historyDetail?: ExamRecord;
}

// --- Sub-components ---

function WatermarkImg({ src, alt = '' }: { src: string; alt?: string }) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  return (
    <>
      <div className="relative w-full h-full overflow-hidden cursor-zoom-in" onClick={() => setOpen(true)}>
        <img src={src} alt={alt} className="w-full h-full object-cover" draggable={false} onContextMenu={e => e.preventDefault()} />
        <div className="absolute inset-0 pointer-events-none">
          {[0, 1, 2, 3].map(r => [0, 1, 2].map(c => (
            <div key={`${r}-${c}`} className="absolute text-white/20 whitespace-nowrap" style={{ top: `${r * 28 + 5}%`, left: `${c * 38 - 5}%`, transform: 'rotate(-25deg)', fontSize: '10px' }}>
              中药数字标本馆
            </div>
          )))}
        </div>
        <div className="absolute bottom-1.5 right-1.5 bg-black/40 rounded-full p-1">
          <ZoomIn className="w-3 h-3 text-white" />
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[200]" onClick={() => setOpen(false)}>
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={e => { e.stopPropagation(); setScale(s => Math.min(s + 0.3, 3)); }} className="bg-white/20 text-white rounded-full p-2"><ZoomIn className="w-4 h-4" /></button>
            <button onClick={e => { e.stopPropagation(); setScale(s => Math.max(s - 0.3, 0.5)); }} className="bg-white/20 text-white rounded-full p-2"><ZoomOut className="w-4 h-4" /></button>
            <button onClick={e => { e.stopPropagation(); setScale(1); }} className="bg-white/20 text-white rounded-full p-2"><RotateCcw className="w-4 h-4" /></button>
            <button className="bg-white/20 text-white rounded-full p-2"><X className="w-4 h-4" /></button>
          </div>
          <div style={{ transform: `scale(${scale})`, transition: 'transform 0.2s', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <img src={src} alt={alt} className="max-w-[90vw] max-h-[85vh] object-contain" draggable={false} onContextMenu={e => e.preventDefault()} />
            <div className="absolute inset-0 pointer-events-none">
              {[0, 1, 2, 3, 4].map(r => [0, 1, 2, 3].map(c => (
                <div key={`${r}-${c}`} className="absolute text-white/15 whitespace-nowrap" style={{ top: `${r * 22 + 3}%`, left: `${c * 28 - 5}%`, transform: 'rotate(-25deg)', fontSize: '12px' }}>
                  中药数字标本馆
                </div>
              )))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function MobileSimulator() {
  const app = useApp();
  const navigate = useNavigate();
  // Auto-init mobile user from global context if student/teacher
  const initialUser = app.currentUser && (app.currentUser.role === 'student' || app.currentUser.role === 'teacher')
    ? app.currentUser : null;
  const [mobileUser, setMobileUser] = useState<typeof app.users[0] | null>(initialUser);
  const [state, setState] = useState<MobileAppState>({ page: initialUser ? (initialUser.firstLogin ? 'change-password' : 'home') : 'login' });
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [examAnswers, setExamAnswers] = useState<string[]>([]);
  const [examQuestionIdx, setExamQuestionIdx] = useState(0);
  const [examSpecimens, setExamSpecimens] = useState<Specimen[]>([]);
  const [examMuseumId, setExamMuseumId] = useState('');
  const [examCategoryIds, setExamCategoryIds] = useState<string[]>([]);
  const [vipReason, setVipReason] = useState('');
  const [regForm, setRegForm] = useState({ name: '', phone: '', role: 'student' as 'student' | 'teacher', unit: '', studentId: '', major: '' });

  const go = (page: MobilePage, extra?: Partial<MobileAppState>) => {
    setState(s => ({ ...s, page, ...extra }));
  };

  const handleMobileLogin = () => {
    setLoginError('');
    const user = app.users.find(u => u.phone === loginPhone);
    if (!user) { setLoginError('账号不存在'); return; }
    if (user.status === 'pending') { setLoginError('账号待审核'); return; }
    if (user.status === 'suspended') { setLoginError('账号已停用'); return; }
    if (user.password !== loginPass) { setLoginError('密码错误'); return; }
    setMobileUser(user);
    if (user.firstLogin) {
      go('change-password');
    } else {
      go('home');
    }
  };

  const handleChangePassword = () => {
    if (!newPass || newPass.length < 6) { alert('密码至少6位'); return; }
    if (newPass !== newPass2) { alert('两次密码不一致'); return; }
    app.changePassword(mobileUser!.id, newPass);
    setMobileUser(u => u ? { ...u, password: newPass, firstLogin: false } : u);
    go('home');
  };

  const handleRegister = () => {
    if (!regForm.name || !regForm.phone) { alert('请填写必填项'); return; }
    app.submitRegistration({
      name: regForm.name, phone: regForm.phone, role: regForm.role,
      unit: regForm.unit, studentId: regForm.studentId, major: regForm.major,
    });
    alert('注册申请已提交，请等待管理员审核！');
    go('login');
  };

  const startExam = () => {
    const cats = examCategoryIds.length > 0 ? examCategoryIds
      : (app.museums.find(m => m.id === examMuseumId)?.categories.map(c => c.id) || []);
    const pool = app.specimens.filter(s =>
      s.museumId === examMuseumId && cats.includes(s.categoryId) &&
      s.images.some(img => img.status === 'approved')
    );
    if (pool.length < 3) { alert('该题库标本数量不足，至少需要3个'); return; }
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(20, pool.length));
    setExamSpecimens(shuffled);
    setExamAnswers(new Array(shuffled.length).fill(''));
    setExamQuestionIdx(0);
    go('exam-doing');
  };

  const submitExam = () => {
    const museum = app.museums.find(m => m.id === examMuseumId);
    const questions = examSpecimens.map((sp, i) => {
      const img = sp.images.find(img => img.status === 'approved');
      const ans = examAnswers[i].trim();
      return {
        id: `q-${i}`, specimenId: sp.id, specimenName: sp.name,
        imageUrl: img?.url || '', correctAnswer: sp.name,
        userAnswer: ans, isCorrect: ans === sp.name,
      };
    });
    const score = questions.filter(q => q.isCorrect).length;
    const record: Omit<ExamRecord, 'id'> = {
      userId: mobileUser!.id, userName: mobileUser!.name,
      museumId: examMuseumId, museumName: museum?.name || '',
      categoryIds: examCategoryIds, questions, score,
      totalQuestions: examSpecimens.length, submittedAt: new Date().toISOString(),
    };
    app.submitExam(record);
    const newRecord = { ...record, id: `exam-${Date.now()}` } as ExamRecord;
    go('exam-result', { examRecord: newRecord });
  };

  const myExamRecords = useMemo(() =>
    app.examRecords.filter(r => r.userId === mobileUser?.id).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()),
    [app.examRecords, mobileUser]
  );

  const filteredSpecimens = useMemo(() => {
    if (!state.selectedCategoryId) return [];
    const pool = app.specimens.filter(s => s.categoryId === state.selectedCategoryId);
    if (!searchQuery) return pool;
    return pool.filter(s => s.name.includes(searchQuery) || s.latinName?.includes(searchQuery));
  }, [app.specimens, state.selectedCategoryId, searchQuery]);

  // ---- PAGES ----

  const LoginPage = () => (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #0d2818 0%, #1b3a2d 60%, #f8faf8 60%)' }}>
      <div className="flex flex-col items-center pt-10 pb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3" style={{ background: 'rgba(82,183,136,0.2)', border: '1.5px solid rgba(82,183,136,0.4)' }}>🌿</div>
        <h2 className="text-white" style={{ fontSize: '18px', fontWeight: 600 }}>中药数字标本馆</h2>
        <p style={{ fontSize: '12px', color: '#95d5b2', marginTop: '4px' }}>高校师生中药学习平台</p>
      </div>
      <div className="flex-1 rounded-t-3xl p-6 space-y-4" style={{ background: '#f8faf8' }}>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="tel" value={loginPhone} onChange={e => setLoginPhone(e.target.value)}
            placeholder="手机号" className="w-full pl-10 pr-4 py-3 rounded-xl outline-none"
            style={{ border: '1.5px solid #e0e0e0', fontSize: '14px', background: '#fff' }} />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type={showPass ? 'text' : 'password'} value={loginPass} onChange={e => setLoginPass(e.target.value)}
            placeholder="密码" className="w-full pl-10 pr-10 py-3 rounded-xl outline-none"
            style={{ border: '1.5px solid #e0e0e0', fontSize: '14px', background: '#fff' }} />
          <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {showPass ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
        {loginError && (
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#ffebee' }}>
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span style={{ fontSize: '13px', color: '#ef4444' }}>{loginError}</span>
          </div>
        )}
        <button onClick={handleMobileLogin} className="w-full py-3 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #1b3a2d, #2d6a4f)', fontSize: '15px' }}>
          登 录
        </button>
        <div className="text-center">
          <button onClick={() => go('register')} style={{ fontSize: '13px', color: '#2d6a4f' }}>
            申请注册账号 →
          </button>
        </div>
        <div className="pt-2 space-y-1.5">
          <p style={{ fontSize: '12px', color: '#aaa', textAlign: 'center' }}>演示账号（点击快速填入）</p>
          {[
            { label: '学生', phone: '13800000005', pass: '888888' },
            { label: '教师', phone: '13800000008', pass: '888888' },
          ].map(a => (
            <button key={a.phone} onClick={() => { setLoginPhone(a.phone); setLoginPass(a.pass); }}
              className="w-full flex items-center justify-between px-4 py-2 rounded-xl"
              style={{ background: '#e8f5e9', fontSize: '13px' }}>
              <span style={{ color: '#2d6a4f', fontWeight: 500 }}>{a.label}</span>
              <span style={{ color: '#888' }}>{a.phone}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const RegisterPage = () => (
    <div className="flex flex-col h-full" style={{ background: '#f8faf8' }}>
      <div className="flex items-center gap-3 px-4 py-4" style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <button onClick={() => go('login')}><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>注册申请</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="p-4 rounded-xl" style={{ background: '#e8f5e9', border: '1px solid #c8e6c9' }}>
          <p style={{ fontSize: '13px', color: '#2d6a4f', lineHeight: '1.6' }}>
            提交注册申请后，管理员审核通过后会为您开通账号。初始密码为 888888，首次登录请修改密码。
          </p>
        </div>
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: '#eee' }}>
          {(['student', 'teacher'] as const).map(t => (
            <button key={t} onClick={() => setRegForm(f => ({ ...f, role: t }))}
              className="flex-1 py-2 rounded-lg transition-all"
              style={{ background: regForm.role === t ? '#fff' : 'transparent', color: regForm.role === t ? '#2d6a4f' : '#888', fontSize: '13px', boxShadow: regForm.role === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              {t === 'student' ? '学生' : '教师'}
            </button>
          ))}
        </div>
        {[
          { key: 'name', label: '姓名 *', placeholder: '请输入真实姓名' },
          { key: 'phone', label: '手机号 *', placeholder: '用于登录账号' },
          { key: 'unit', label: '所在院校', placeholder: '所在高校名称' },
          ...(regForm.role === 'student' ? [
            { key: 'studentId', label: '学号', placeholder: '学号' },
            { key: 'major', label: '专业年级', placeholder: '如：中医学2022级' },
          ] : []),
        ].map(f => (
          <div key={f.key}>
            <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>{f.label}</label>
            <input value={(regForm as any)[f.key] || ''} onChange={e => setRegForm(rf => ({ ...rf, [f.key]: e.target.value }))}
              placeholder={f.placeholder} className="w-full px-3 py-3 rounded-xl outline-none"
              style={{ border: '1.5px solid #e0e0e0', fontSize: '14px', background: '#fff' }} />
          </div>
        ))}
        <button onClick={handleRegister} className="w-full py-3 rounded-xl text-white" style={{ background: '#2d6a4f', fontSize: '15px' }}>
          提交注册申请
        </button>
      </div>
    </div>
  );

  const ChangePasswordPage = () => (
    <div className="flex flex-col h-full items-center justify-center p-6" style={{ background: '#f8faf8' }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4" style={{ background: '#e8f5e9' }}>🔐</div>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>修改密码</h2>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px', textAlign: 'center' }}>
        首次登录请修改密码<br />完善信息后即可使用系统
      </p>
      <div className="w-full space-y-3">
        <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
          placeholder="新密码（至少6位）" className="w-full px-4 py-3 rounded-xl outline-none"
          style={{ border: '1.5px solid #e0e0e0', fontSize: '14px', background: '#fff' }} />
        <input type="password" value={newPass2} onChange={e => setNewPass2(e.target.value)}
          placeholder="确认新密码" className="w-full px-4 py-3 rounded-xl outline-none"
          style={{ border: '1.5px solid #e0e0e0', fontSize: '14px', background: '#fff' }} />
        <button onClick={handleChangePassword} className="w-full py-3 rounded-xl text-white" style={{ background: '#2d6a4f', fontSize: '15px' }}>
          确认修改
        </button>
      </div>
    </div>
  );

  const HomePage = () => {
    const totalSpecimens = app.specimens.filter(s => s.images.some(i => i.status === 'approved')).length;
    return (
      <div className="h-full overflow-y-auto" style={{ background: '#f0f4f0' }}>
        {/* Header */}
        <div className="px-4 pt-6 pb-4" style={{ background: 'linear-gradient(135deg, #1b3a2d, #2d6a4f)' }}>
          <div className="flex justify-between items-start">
            <div>
              <p style={{ fontSize: '13px', color: '#95d5b2' }}>欢迎回来</p>
              <h2 className="text-white" style={{ fontSize: '18px', fontWeight: 600 }}>{mobileUser?.name}</h2>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: 'rgba(255,255,255,0.2)', fontSize: '14px', fontWeight: 600 }}>
              {mobileUser?.name?.[0]}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: '标本馆', value: app.museums.length, unit: '个' },
              { label: '馆藏标本', value: totalSpecimens, unit: '种' },
              { label: '我的考试', value: myExamRecords.length, unit: '次' },
            ].map(s => (
              <div key={s.label} className="text-center py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <div className="text-white" style={{ fontSize: '18px', fontWeight: 700 }}>{s.value}<span style={{ fontSize: '11px', fontWeight: 400 }}>{s.unit}</span></div>
                <div style={{ fontSize: '11px', color: '#b7e4c7' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="p-4 space-y-3">
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>快速入口</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🔬', label: '浏览标本', sub: '查看馆藏', action: () => go('browse-museums'), color: '#e8f5e9', textColor: '#2d6a4f' },
              { icon: '📝', label: '开始考试', sub: '测试识别能力', action: () => go('exam-select'), color: '#e3f2fd', textColor: '#1565c0' },
              { icon: '📊', label: '考试记录', sub: '查看历史成绩', action: () => go('history'), color: '#fce4ec', textColor: '#880e4f' },
              { icon: '👤', label: '个人中心', sub: '账号设置', action: () => go('profile'), color: '#fff3e0', textColor: '#bf360c' },
            ].map(item => (
              <button key={item.label} onClick={item.action}
                className="flex items-center gap-3 p-4 rounded-2xl text-left"
                style={{ background: item.color, border: `1px solid ${item.color}` }}>
                <div className="text-2xl">{item.icon}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: item.textColor }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent museums */}
        <div className="px-4 pb-4">
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '12px' }}>标本馆</h3>
          <div className="space-y-2">
            {app.museums.map(m => {
              const count = app.specimens.filter(s => s.museumId === m.id).length;
              return (
                <button key={m.id} onClick={() => go('browse-categories', { selectedMuseum: m })}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-white text-left"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <div className="text-2xl">{m.icon}</div>
                  <div className="flex-1">
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#222' }}>{m.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{count}种标本 · {m.categories.length}个分类</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const BrowseMuseumsPage = () => (
    <div className="h-full overflow-y-auto" style={{ background: '#f8faf8' }}>
      <div className="flex items-center gap-3 px-4 py-4 bg-white" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <button onClick={() => go('home')}><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>标本馆</h2>
      </div>
      <div className="p-4 space-y-3">
        {app.museums.map(m => {
          const count = app.specimens.filter(s => s.museumId === m.id).length;
          return (
            <button key={m.id} onClick={() => go('browse-categories', { selectedMuseum: m })}
              className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white text-left"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl" style={{ background: '#e8f5e9' }}>{m.icon}</div>
              <div className="flex-1">
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>{m.name}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{m.description.slice(0, 30)}...</div>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full" style={{ background: '#e8f5e9', color: '#2d6a4f', fontSize: '11px' }}>{m.categories.length}个分类</span>
                  <span className="px-2 py-0.5 rounded-full" style={{ background: '#f0f4f0', color: '#555', fontSize: '11px' }}>{count}种标本</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          );
        })}
      </div>
    </div>
  );

  const BrowseCategoriesPage = () => {
    const museum = state.selectedMuseum!;
    return (
      <div className="h-full overflow-y-auto" style={{ background: '#f8faf8' }}>
        <div className="flex items-center gap-3 px-4 py-4 bg-white" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <button onClick={() => go('browse-museums')}><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>{museum.name}</h2>
        </div>
        <div className="p-4 space-y-3">
          {museum.categories.map(cat => {
            const count = app.specimens.filter(s => s.categoryId === cat.id).length;
            return (
              <button key={cat.id} onClick={() => { setSearchQuery(''); go('browse-specimens', { selectedCategoryId: cat.id }); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white text-left"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e8f5e9' }}>
                  <BookOpen className="w-5 h-5" style={{ color: '#2d6a4f' }} />
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#222' }}>{cat.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{count}种标本</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const BrowseSpecimensPage = () => {
    const cat = state.selectedMuseum?.categories.find(c => c.id === state.selectedCategoryId);
    return (
      <div className="h-full flex flex-col" style={{ background: '#f8faf8' }}>
        <div className="flex items-center gap-3 px-4 py-4 bg-white" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <button onClick={() => go('browse-categories')}><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>{cat?.name}</h2>
        </div>
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索标本名称..." className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none"
              style={{ border: '1px solid #e0e0e0', fontSize: '14px', background: '#fff' }} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filteredSpecimens.length === 0 ? (
            <div className="text-center py-12"><p style={{ color: '#aaa', fontSize: '14px' }}>暂无标本</p></div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredSpecimens.map(sp => {
                const img = sp.images.find(i => i.status === 'approved');
                return (
                  <button key={sp.id} onClick={() => go('specimen-detail', { currentSpecimen: sp })}
                    className="bg-white rounded-2xl overflow-hidden text-left"
                    style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                      {img ? <WatermarkImg src={img.url} alt={sp.name} /> : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FlaskConical className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{sp.name}</div>
                      <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }} className="truncate">{sp.latinName || ''}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SpecimenDetailPage = () => {
    const sp = state.currentSpecimen!;
    const [imgIdx, setImgIdx] = useState(0);
    const approvedImgs = sp.images.filter(i => i.status === 'approved');
    const museum = app.museums.find(m => m.id === sp.museumId);
    const cat = museum?.categories.find(c => c.id === sp.categoryId);
    return (
      <div className="h-full flex flex-col" style={{ background: '#f8faf8' }}>
        <div className="flex items-center gap-3 px-4 py-4 bg-white" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <button onClick={() => go('browse-specimens')}><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>{sp.name}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="aspect-[4/3] relative overflow-hidden" style={{ background: '#eee' }}>
            {approvedImgs.length > 0 ? (
              <WatermarkImg src={approvedImgs[imgIdx]?.url} alt={sp.name} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FlaskConical className="w-12 h-12 text-gray-300" />
              </div>
            )}
          </div>
          {approvedImgs.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {approvedImgs.map((img, i) => (
                <button key={img.id} onClick={() => setImgIdx(i)}
                  className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2"
                  style={{ borderColor: i === imgIdx ? '#2d6a4f' : 'transparent' }}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="p-4 space-y-4">
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>{sp.name}</h2>
              {sp.latinName && <p style={{ fontSize: '13px', color: '#888', fontStyle: 'italic', marginTop: '2px' }}>{sp.latinName}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full" style={{ background: '#e8f5e9', color: '#2d6a4f', fontSize: '12px' }}>{museum?.name}</span>
              <span className="px-3 py-1 rounded-full" style={{ background: '#f0f4f0', color: '#555', fontSize: '12px' }}>{cat?.name}</span>
              {sp.properties && <span className="px-3 py-1 rounded-full" style={{ background: '#fff8e1', color: '#f57f17', fontSize: '12px' }}>{sp.properties}</span>}
            </div>
            <div className="p-4 rounded-2xl" style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px', fontWeight: 500 }}>备注信息</div>
              <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.8' }}>{sp.notes || '暂无备注'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ExamSelectPage = () => {
    const museum = app.museums.find(m => m.id === examMuseumId);
    return (
      <div className="h-full overflow-y-auto" style={{ background: '#f8faf8' }}>
        <div className="flex items-center gap-3 px-4 py-4 bg-white" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <button onClick={() => go('home')}><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>选择题库</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="p-4 rounded-2xl" style={{ background: '#e8f5e9', border: '1px solid #c8e6c9' }}>
            <p style={{ fontSize: '13px', color: '#2d6a4f', lineHeight: '1.6' }}>
              📝 从选定的标本中随机抽取 <strong>20</strong> 张图片，仅展示图片，请填写标本名称。不计时，可随时提交。
            </p>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#555', fontWeight: 500, display: 'block', marginBottom: '8px' }}>选择标本馆 *</label>
            <div className="space-y-2">
              {app.museums.map(m => (
                <button key={m.id} onClick={() => { setExamMuseumId(m.id); setExamCategoryIds([]); }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl text-left"
                  style={{ background: examMuseumId === m.id ? '#e8f5e9' : '#fff', border: `2px solid ${examMuseumId === m.id ? '#2d6a4f' : '#eee'}` }}>
                  <div className="text-xl">{m.icon}</div>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#222' }}>{m.name}</span>
                  {examMuseumId === m.id && <Check className="w-4 h-4 ml-auto" style={{ color: '#2d6a4f' }} />}
                </button>
              ))}
            </div>
          </div>

          {museum && (
            <div>
              <label style={{ fontSize: '13px', color: '#555', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                选择分类（不选默认全部）
              </label>
              <div className="grid grid-cols-2 gap-2">
                {museum.categories.map(cat => {
                  const checked = examCategoryIds.includes(cat.id);
                  return (
                    <button key={cat.id}
                      onClick={() => setExamCategoryIds(ids => checked ? ids.filter(id => id !== cat.id) : [...ids, cat.id])}
                      className="flex items-center gap-2 p-3 rounded-xl text-left"
                      style={{ background: checked ? '#e8f5e9' : '#fff', border: `1.5px solid ${checked ? '#2d6a4f' : '#eee'}` }}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0`}
                        style={{ background: checked ? '#2d6a4f' : '#eee' }}>
                        {checked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span style={{ fontSize: '13px', color: '#333' }}>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={startExam}
            disabled={!examMuseumId}
            className="w-full py-3.5 rounded-2xl text-white" style={{ background: examMuseumId ? '#2d6a4f' : '#ccc', fontSize: '15px' }}>
            开始考试
          </button>
        </div>
      </div>
    );
  };

  const ExamDoingPage = () => {
    const sp = examSpecimens[examQuestionIdx];
    const img = sp?.images.find(i => i.status === 'approved');
    return (
      <div className="h-full flex flex-col" style={{ background: '#fff' }}>
        {/* Progress */}
        <div className="px-4 py-3" style={{ background: '#f8faf8', borderBottom: '1px solid #eee' }}>
          <div className="flex justify-between items-center mb-2">
            <span style={{ fontSize: '13px', color: '#888' }}>第 {examQuestionIdx + 1} / {examSpecimens.length} 题</span>
            <button onClick={() => { if (window.confirm('确定放弃考试？')) go('exam-select'); }}
              style={{ fontSize: '13px', color: '#ef4444' }}>放弃</button>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: '#eee' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${(examQuestionIdx + 1) / examSpecimens.length * 100}%`, background: '#2d6a4f' }} />
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto">
          <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
            {img ? <WatermarkImg src={img.url} alt="标本图片" /> : <div className="w-full h-full flex items-center justify-center"><FlaskConical className="w-12 h-12 text-gray-300" /></div>}
          </div>
          <div className="p-4">
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '12px' }}>请填写此标本的名称：</p>
            <input
              value={examAnswers[examQuestionIdx] || ''}
              onChange={e => {
                const newAnswers = [...examAnswers];
                newAnswers[examQuestionIdx] = e.target.value;
                setExamAnswers(newAnswers);
              }}
              placeholder="填写标本名称..."
              className="w-full px-4 py-3 rounded-2xl outline-none"
              style={{ border: '2px solid #e0e0e0', fontSize: '16px' }}
              onFocus={e => e.currentTarget.style.borderColor = '#2d6a4f'}
              onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 flex gap-3" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={() => setExamQuestionIdx(i => Math.max(0, i - 1))}
            disabled={examQuestionIdx === 0}
            className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2"
            style={{ background: '#f0f0f0', color: examQuestionIdx === 0 ? '#bbb' : '#555', fontSize: '14px' }}>
            <ChevronLeft className="w-4 h-4" />上一题
          </button>
          {examQuestionIdx < examSpecimens.length - 1 ? (
            <button onClick={() => setExamQuestionIdx(i => i + 1)}
              className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 text-white"
              style={{ background: '#2d6a4f', fontSize: '14px' }}>
              下一题<ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => { if (window.confirm('确认提交答案？')) submitExam(); }}
              className="flex-1 py-3 rounded-2xl text-white"
              style={{ background: '#ef4444', fontSize: '14px', fontWeight: 500 }}>
              提交答卷
            </button>
          )}
        </div>
      </div>
    );
  };

  const ExamResultPage = () => {
    const record = state.examRecord!;
    const pct = Math.round(record.score / record.totalQuestions * 100);
    const grade = pct >= 90 ? '优秀' : pct >= 75 ? '良好' : pct >= 60 ? '及格' : '不及格';
    const gradeColor = pct >= 90 ? '#2d6a4f' : pct >= 75 ? '#1565c0' : pct >= 60 ? '#f57f17' : '#ef4444';
    return (
      <div className="h-full overflow-y-auto" style={{ background: '#f8faf8' }}>
        <div className="px-4 pt-8 pb-6 text-center" style={{ background: 'linear-gradient(135deg, #1b3a2d, #2d6a4f)' }}>
          <div className="w-20 h-20 rounded-full mx-auto flex flex-col items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)' }}>
            <div className="text-white" style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1 }}>{record.score}</div>
            <div style={{ fontSize: '11px', color: '#b7e4c7' }}>/ {record.totalQuestions}</div>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
            {grade} · {pct}分
          </div>
          <div style={{ fontSize: '13px', color: '#95d5b2' }}>{record.museumName}</div>
        </div>
        <div className="p-4 space-y-3">
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>答题详情（共{record.questions.length}题）</h3>
          {record.questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-2xl p-4 flex items-start gap-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: q.isCorrect ? '#e8f5e9' : '#ffebee', fontSize: '13px', fontWeight: 600, color: q.isCorrect ? '#2d6a4f' : '#ef4444' }}>
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {q.isCorrect ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
                  <span style={{ fontSize: '13px', color: '#888' }}>正确答案：</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#2d6a4f' }}>{q.correctAnswer}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span style={{ fontSize: '13px', color: '#888' }}>我的答案：</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: q.isCorrect ? '#2d6a4f' : '#ef4444' }}>
                    {q.userAnswer || '（未填写）'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => go('history')} className="flex-1 py-3 rounded-2xl" style={{ background: '#e8f5e9', color: '#2d6a4f', fontSize: '14px' }}>查看记录</button>
            <button onClick={() => go('exam-select')} className="flex-1 py-3 rounded-2xl text-white" style={{ background: '#2d6a4f', fontSize: '14px' }}>再次考试</button>
          </div>
        </div>
      </div>
    );
  };

  const HistoryPage = () => (
    <div className="h-full flex flex-col" style={{ background: '#f8faf8' }}>
      <div className="flex items-center gap-3 px-4 py-4 bg-white" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <button onClick={() => go('home')}><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>考试记录</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {myExamRecords.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p style={{ fontSize: '14px', color: '#aaa' }}>还没有考试记录</p>
          </div>
        ) : myExamRecords.map(record => {
          const pct = Math.round(record.score / record.totalQuestions * 100);
          const color = pct >= 90 ? '#2d6a4f' : pct >= 75 ? '#1565c0' : pct >= 60 ? '#f57f17' : '#ef4444';
          return (
            <button key={record.id} onClick={() => go('history-detail', { historyDetail: record })}
              className="w-full bg-white rounded-2xl p-4 text-left" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>{record.museumName}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                    {new Date(record.submittedAt).toLocaleDateString('zh-CN')}  {new Date(record.submittedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: '20px', fontWeight: 700, color, lineHeight: 1 }}>{record.score}<span style={{ fontSize: '12px', color: '#888' }}>/{record.totalQuestions}</span></div>
                  <div style={{ fontSize: '12px', color }}>{pct}分</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const HistoryDetailPage = () => {
    const record = state.historyDetail!;
    return (
      <div className="h-full flex flex-col" style={{ background: '#f8faf8' }}>
        <div className="flex items-center gap-3 px-4 py-4 bg-white" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <button onClick={() => go('history')}><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>考试详情</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="bg-white rounded-2xl p-4 flex justify-between items-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{record.museumName}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{new Date(record.submittedAt).toLocaleString('zh-CN')}</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#2d6a4f' }}>{record.score}/{record.totalQuestions}</div>
          </div>
          {record.questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: `3px solid ${q.isCorrect ? '#52b788' : '#ef4444'}` }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>第{i + 1}题</div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '13px', color: '#555' }}>正确答案：</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#2d6a4f' }}>{q.correctAnswer}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span style={{ fontSize: '13px', color: '#555' }}>作答：</span>
                <span style={{ fontSize: '14px', fontWeight: 500, color: q.isCorrect ? '#2d6a4f' : '#ef4444' }}>
                  {q.userAnswer || '（未作答）'}
                </span>
                {q.isCorrect ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ProfilePage = () => {
    const u = mobileUser!;
    const roleMap: Record<string, string> = { student: '学生', teacher: '教师', vip_teacher: 'VIP教师', admin: '管理员' };
    const vipStatusMap: Record<string, string> = { none: '未申请', pending: '审核中', approved: '已开通' };
    return (
      <div className="h-full overflow-y-auto" style={{ background: '#f8faf8' }}>
        {/* Header */}
        <div className="px-4 pt-6 pb-8 text-center" style={{ background: 'linear-gradient(135deg, #1b3a2d, #2d6a4f)' }}>
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white mb-3"
            style={{ background: 'rgba(255,255,255,0.25)', fontSize: '22px', fontWeight: 600 }}>
            {u.name[0]}
          </div>
          <h2 className="text-white" style={{ fontSize: '18px', fontWeight: 600 }}>{u.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="px-3 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '12px' }}>
              {roleMap[u.role]}
            </span>
            {u.role === 'vip_teacher' && (
              <span className="px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: '#fef3c7', color: '#92400e', fontSize: '12px' }}>
                <Crown className="w-3 h-3" />VIP
              </span>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3 -mt-4">
          {/* Info card */}
          <div className="bg-white rounded-2xl p-4 space-y-3" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
            {[
              { label: '手机号', value: u.phone },
              { label: '所在单位', value: u.unit || '—' },
              ...(u.role === 'student' ? [
                { label: '学号', value: u.studentId || '—' },
                { label: '专业年级', value: u.major || '—' },
              ] : []),
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ fontSize: '13px', color: '#888' }}>{item.label}</span>
                <span style={{ fontSize: '14px', color: '#333' }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* VIP section */}
          {(u.role === 'teacher') && (
            <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)', border: '1px solid #fef3c7' }}>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4" style={{ color: '#d4a843' }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>VIP教师权限</span>
                <span className="ml-auto px-2 py-0.5 rounded-full text-xs" style={{ background: u.vipStatus === 'none' ? '#f0f0f0' : u.vipStatus === 'pending' ? '#fff8e1' : '#e8f5e9', color: u.vipStatus === 'none' ? '#888' : u.vipStatus === 'pending' ? '#f57f17' : '#2d6a4f' }}>
                  {vipStatusMap[u.vipStatus]}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>申请VIP权限后，可上传标本图片，丰富馆藏资源。</p>
              {u.vipStatus === 'none' && (
                <>
                  <textarea value={vipReason} onChange={e => setVipReason(e.target.value)}
                    placeholder="请填写申请理由..." rows={3}
                    className="w-full px-3 py-2 rounded-xl outline-none resize-none mb-2"
                    style={{ border: '1.5px solid #e0e0e0', fontSize: '13px' }} />
                  <button onClick={() => { if (vipReason) { app.applyForVIP(u.id, vipReason); setMobileUser(uu => uu ? { ...uu, vipStatus: 'pending' } : uu); } else alert('请填写申请理由'); }}
                    className="w-full py-2.5 rounded-xl text-white" style={{ background: '#d4a843', fontSize: '13px' }}>
                    申请VIP权限
                  </button>
                </>
              )}
              {u.vipStatus === 'pending' && <p style={{ fontSize: '13px', color: '#f57f17' }}>申请已提交，等待管理员审核中...</p>}
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
            {[
              { icon: '📊', label: '我的考试记录', action: () => go('history') },
              { icon: '🔒', label: '修改密码', action: () => go('change-password') },
            ].map(item => (
              <button key={item.label} onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                style={{ borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ fontSize: '14px', color: '#333' }}>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
            ))}
          </div>

          <button onClick={() => { setMobileUser(null); go('login'); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl"
            style={{ background: '#ffebee', color: '#ef4444', fontSize: '14px' }}>
            <LogOut className="w-4 h-4" />退出登录
          </button>
        </div>
      </div>
    );
  };

  // Bottom navigation tabs
  const bottomTabs = [
    { id: 'home', icon: Home, label: '首页', pages: ['home'] },
    { id: 'browse', icon: Search, label: '浏览', pages: ['browse-museums', 'browse-categories', 'browse-specimens', 'specimen-detail'] },
    { id: 'exam', icon: ClipboardList, label: '考试', pages: ['exam-select', 'exam-doing', 'exam-result'] },
    { id: 'history', icon: History, label: '记录', pages: ['history', 'history-detail'] },
    { id: 'profile', icon: User, label: '我的', pages: ['profile'] },
  ];

  const showBottomNav = !['login', 'register', 'change-password', 'exam-doing'].includes(state.page);

  const renderPage = () => {
    switch (state.page) {
      case 'login': return <LoginPage />;
      case 'register': return <RegisterPage />;
      case 'change-password': return <ChangePasswordPage />;
      case 'home': return <HomePage />;
      case 'browse-museums': return <BrowseMuseumsPage />;
      case 'browse-categories': return <BrowseCategoriesPage />;
      case 'browse-specimens': return <BrowseSpecimensPage />;
      case 'specimen-detail': return <SpecimenDetailPage />;
      case 'exam-select': return <ExamSelectPage />;
      case 'exam-doing': return <ExamDoingPage />;
      case 'exam-result': return <ExamResultPage />;
      case 'history': return <HistoryPage />;
      case 'history-detail': return <HistoryDetailPage />;
      case 'profile': return <ProfilePage />;
      default: return <LoginPage />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #0d2818 0%, #1b3a2d 50%, #2d4a3e 100%)' }}>
      <div className="mb-4 text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          {app.currentUser && (
            <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 text-green-300 hover:text-white transition-colors"
              style={{ fontSize: '13px' }}>
              <ArrowLeft className="w-4 h-4" />返回管理端
            </button>
          )}
        </div>
        <h1 className="text-white" style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '3px' }}>中药数字标本馆</h1>
        <p style={{ fontSize: '13px', color: '#95d5b2', marginTop: '4px' }}>移动端 / 微信小程序模拟</p>
      </div>

      {/* Phone frame */}
      <div className="relative" style={{ width: '375px' }}>
        {/* Phone outer */}
        <div className="rounded-[44px] p-3" style={{ background: '#1a1a1a', boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 2px #333' }}>
          {/* Status bar */}
          <div className="rounded-t-[32px] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-2" style={{ background: state.page === 'login' || state.page === 'change-password' ? '#0d2818' : '#1b3a2d' }}>
              <span className="text-white" style={{ fontSize: '12px', fontWeight: 600 }}>9:41</span>
              <div className="flex gap-1.5 items-center">
                <div className="w-4 h-2 rounded-sm border border-white/60 relative">
                  <div className="absolute inset-0.5 rounded-sm" style={{ background: '#fff', right: '20%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Screen */}
          <div className="overflow-hidden" style={{ height: '667px', position: 'relative' }}>
            <div className={`h-full ${showBottomNav ? 'pb-16' : ''}`} style={{ overflow: 'hidden' }}>
              <div className="h-full overflow-hidden">
                {renderPage()}
              </div>
            </div>

            {/* Bottom navigation */}
            {showBottomNav && mobileUser && (
              <div className="absolute bottom-0 left-0 right-0 flex items-center bg-white" style={{ borderTop: '1px solid #f0f0f0', height: '56px' }}>
                {bottomTabs.map(tab => {
                  const isActive = tab.pages.some(p => state.page.startsWith(p));
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === 'home') go('home');
                        else if (tab.id === 'browse') go('browse-museums');
                        else if (tab.id === 'exam') go('exam-select');
                        else if (tab.id === 'history') go('history');
                        else if (tab.id === 'profile') go('profile');
                      }}
                      className="flex-1 flex flex-col items-center justify-center gap-0.5"
                    >
                      <tab.icon className="w-5 h-5" style={{ color: isActive ? '#2d6a4f' : '#aaa' }} />
                      <span style={{ fontSize: '10px', color: isActive ? '#2d6a4f' : '#aaa', fontWeight: isActive ? 600 : 400 }}>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Home indicator */}
          <div className="rounded-b-[32px] flex items-center justify-center py-2">
            <div className="w-24 h-1 rounded-full" style={{ background: '#555' }} />
          </div>
        </div>
      </div>

      <p className="mt-4 text-center" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
        演示环境 · 仅供预览<br />
        实际部署为微信小程序形式
      </p>
    </div>
  );
}