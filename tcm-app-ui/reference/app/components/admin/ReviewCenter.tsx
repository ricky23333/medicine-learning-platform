import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, User, Crown, Image, FileText, Eye } from 'lucide-react';
import { useApp } from '../../store/AppContext';

type TabType = 'registration' | 'vip' | 'images';

export default function ReviewCenter() {
  const {
    registrationApplications, vipApplications, specimens,
    approveRegistration, rejectRegistration, approveVIP, rejectVIP,
    approveImage, rejectImage,
  } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('registration');
  const [viewApp, setViewApp] = useState<any | null>(null);

  const pendingRegs = registrationApplications.filter(a => a.status === 'pending');
  const pendingVips = vipApplications.filter(a => a.status === 'pending');
  const pendingImages = specimens.flatMap(s =>
    s.images.filter(img => img.status === 'pending').map(img => ({
      ...img, specimenId: s.id, specimenName: s.name, museumId: s.museumId,
    }))
  );

  const tabs = [
    { id: 'registration' as TabType, label: '注册申请', count: pendingRegs.length, icon: User },
    { id: 'vip' as TabType, label: 'VIP申请', count: pendingVips.length, icon: Crown },
    { id: 'images' as TabType, label: '图片审核', count: pendingImages.length, icon: Image },
  ];

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; bg: string; text: string }> = {
      pending: { label: '待审核', bg: '#fff8e1', text: '#f57f17' },
      approved: { label: '已通过', bg: '#e8f5e9', text: '#2d6a4f' },
      rejected: { label: '已拒绝', bg: '#ffebee', text: '#c62828' },
    };
    const s = map[status] || map.pending;
    return (
      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.text, fontSize: '12px' }}>
        {status === 'pending' && <Clock className="w-3 h-3" />}
        {status === 'approved' && <CheckCircle className="w-3 h-3" />}
        {status === 'rejected' && <XCircle className="w-3 h-3" />}
        {s.label}
      </span>
    );
  };

  const ActionButtons = ({ onApprove, onReject, status }: { onApprove: () => void; onReject: () => void; status: string }) => {
    if (status !== 'pending') return null;
    return (
      <div className="flex gap-2">
        <button onClick={onApprove} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white transition-colors hover:opacity-90"
          style={{ background: '#2d6a4f', fontSize: '13px' }}>
          <CheckCircle className="w-3.5 h-3.5" />通过
        </button>
        <button onClick={onReject} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors hover:bg-red-50"
          style={{ background: '#ffebee', color: '#ef4444', fontSize: '13px' }}>
          <XCircle className="w-3.5 h-3.5" />拒绝
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-gray-800">审核中心</h1>
        <p className="text-gray-500 mt-0.5" style={{ fontSize: '14px' }}>
          {pendingRegs.length + pendingVips.length + pendingImages.length} 项待处理
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl p-1.5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', width: 'fit-content' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            style={{
              background: activeTab === tab.id ? '#2d6a4f' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#888',
              fontSize: '13px',
            }}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full" style={{
                background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#ef4444',
                color: activeTab === tab.id ? '#fff' : '#fff',
                fontSize: '11px', minWidth: '18px', textAlign: 'center',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Registration Applications */}
      {activeTab === 'registration' && (
        <div className="space-y-3">
          {registrationApplications.length === 0 && <EmptyState text="暂无注册申请" />}
          {registrationApplications.map(app => (
            <div key={app.id} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                    style={{ background: app.role === 'teacher' ? '#2d6a4f' : '#52b788', fontSize: '14px' }}>
                    {app.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>{app.name}</span>
                      <span className="px-2 py-0.5 rounded-full" style={{ background: app.role === 'teacher' ? '#e3f2fd' : '#e8f5e9', color: app.role === 'teacher' ? '#1565c0' : '#2d6a4f', fontSize: '12px' }}>
                        {app.role === 'teacher' ? '教师' : '学生'}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1">
                      <div style={{ fontSize: '13px', color: '#666' }}>📱 {app.phone}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>🏫 {app.unit}</div>
                      {app.studentId && <div style={{ fontSize: '13px', color: '#666' }}>🎓 {app.studentId}</div>}
                      {app.major && <div style={{ fontSize: '13px', color: '#666' }}>📚 {app.major}</div>}
                      {app.contact && <div style={{ fontSize: '13px', color: '#666' }}>📬 {app.contact}</div>}
                      <div style={{ fontSize: '12px', color: '#aaa' }}>申请时间：{new Date(app.appliedAt).toLocaleDateString('zh-CN')}</div>
                    </div>
                  </div>
                </div>
                <ActionButtons
                  status={app.status}
                  onApprove={() => approveRegistration(app.id)}
                  onReject={() => rejectRegistration(app.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIP Applications */}
      {activeTab === 'vip' && (
        <div className="space-y-3">
          {vipApplications.length === 0 && <EmptyState text="暂无VIP申请" />}
          {vipApplications.map(app => (
            <div key={app.id} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fef3c7' }}>
                    <Crown className="w-5 h-5" style={{ color: '#d4a843' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>{app.userName}</span>
                      <span style={{ fontSize: '13px', color: '#666' }}>{app.phone}</span>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="mt-1 mb-2" style={{ fontSize: '13px', color: '#888' }}>
                      🏫 {app.unit} · 申请时间：{new Date(app.appliedAt).toLocaleDateString('zh-CN')}
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: '#f8f9fa' }}>
                      <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>申请理由：</div>
                      <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.6' }}>{app.reason}</p>
                    </div>
                  </div>
                </div>
                <ActionButtons
                  status={app.status}
                  onApprove={() => approveVIP(app.id)}
                  onReject={() => rejectVIP(app.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Reviews */}
      {activeTab === 'images' && (
        <div className="space-y-3">
          {pendingImages.length === 0 ? (
            <EmptyState text="暂无待审核图片" />
          ) : (
            pendingImages.map(img => {
              const specimen = specimens.find(s => s.id === img.specimenId);
              return (
                <div key={img.id} className="bg-white rounded-2xl p-5 flex items-start gap-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
                  {/* Thumbnail */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>{img.specimenName}</span>
                      <StatusBadge status="pending" />
                    </div>
                    <div className="mt-2 space-y-1">
                      <div style={{ fontSize: '13px', color: '#666' }}>👤 上传者：{img.uploadedByName}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>📅 上传时间：{img.uploadedAt}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => approveImage(img.specimenId, img.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white"
                      style={{ background: '#2d6a4f', fontSize: '13px' }}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />通过
                    </button>
                    <button
                      onClick={() => rejectImage(img.specimenId, img.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                      style={{ background: '#ffebee', color: '#ef4444', fontSize: '13px' }}
                    >
                      <XCircle className="w-3.5 h-3.5" />拒绝
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* All reviewed images */}
          {activeTab === 'images' && (
            <div className="mt-6">
              <h3 className="text-gray-700 mb-3" style={{ fontSize: '14px' }}>
                已审核图片（{specimens.flatMap(s => s.images.filter(i => i.status !== 'pending')).length}）
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
                {specimens.flatMap(s => s.images.filter(i => i.status !== 'pending').map(img => ({
                  ...img, specimenName: s.name,
                }))).slice(0, 12).map(img => (
                  <div key={img.id} className="relative rounded-xl overflow-hidden aspect-square bg-gray-100"
                    style={{ border: img.status === 'approved' ? '2px solid #52b788' : '2px solid #fca5a5' }}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                      <div style={{ fontSize: '11px', color: '#fff' }} className="truncate">{img.specimenName}</div>
                    </div>
                    <div className="absolute top-1.5 right-1.5">
                      {img.status === 'approved'
                        ? <CheckCircle className="w-4 h-4" style={{ color: '#52b788' }} />
                        : <XCircle className="w-4 h-4" style={{ color: '#f87171' }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-200" />
      <p style={{ fontSize: '14px', color: '#aaa' }}>{text}</p>
    </div>
  );
}
