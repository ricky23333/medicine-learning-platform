import React, { useState, useMemo } from 'react';
import { Plus, Image, Clock, Check, X, Upload } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { ImageViewer } from '../shared/ImageViewer';

export default function MyUploads() {
  const { currentUser, specimens, museums, addSpecimen, addSpecimenImage } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSpecimenId, setSelectedSpecimenId] = useState('');
  const [form, setForm] = useState({ museumId: '', categoryId: '', isNew: false, newName: '', newNotes: '' });

  const myImages = useMemo(() => {
    return specimens.flatMap(s =>
      s.images
        .filter(img => img.uploadedBy === currentUser?.id)
        .map(img => ({ ...img, specimenName: s.name, specimenId: s.id }))
    );
  }, [specimens, currentUser]);

  const pending = myImages.filter(i => i.status === 'pending');
  const approved = myImages.filter(i => i.status === 'approved');
  const rejected = myImages.filter(i => i.status === 'rejected');

  const formCategories = useMemo(() =>
    museums.find(m => m.id === form.museumId)?.categories || [],
    [museums, form.museumId]
  );

  const existingSpecimens = useMemo(() =>
    form.categoryId ? specimens.filter(s => s.categoryId === form.categoryId) : [],
    [specimens, form.categoryId]
  );

  const sampleUrls = [
    'https://images.unsplash.com/photo-1681390367146-91e574fc6b7d?w=600&q=80',
    'https://images.unsplash.com/photo-1695798790639-c3c4294373ab?w=600&q=80',
    'https://images.unsplash.com/photo-1739792168508-56764cefd461?w=600&q=80',
  ];

  const handleUpload = () => {
    const url = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
    if (form.isNew) {
      if (!form.museumId || !form.categoryId || !form.newName) return;
      addSpecimen({
        museumId: form.museumId, categoryId: form.categoryId, name: form.newName,
        notes: form.newNotes, images: [], createdBy: currentUser?.id || '',
      });
    } else {
      if (!selectedSpecimenId) return;
      addSpecimenImage(selectedSpecimenId, {
        specimenId: selectedSpecimenId, url,
        uploadedBy: currentUser?.id || '', uploadedByName: currentUser?.name || '',
        uploadedAt: new Date().toISOString().split('T')[0], status: 'pending',
      });
    }
    setShowAddForm(false);
    setForm({ museumId: '', categoryId: '', isNew: false, newName: '', newNotes: '' });
    setSelectedSpecimenId('');
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'pending') return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: '#fff8e1', color: '#f57f17', fontSize: '11px' }}><Clock className="w-3 h-3" />待审核</span>;
    if (status === 'approved') return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: '#e8f5e9', color: '#2d6a4f', fontSize: '11px' }}><Check className="w-3 h-3" />已通过</span>;
    return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: '#ffebee', color: '#ef4444', fontSize: '11px' }}><X className="w-3 h-3" />已拒绝</span>;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800">我的上传</h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: '14px' }}>共上传 {myImages.length} 张图片</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white"
          style={{ background: '#2d6a4f', fontSize: '14px' }}>
          <Upload className="w-4 h-4" />上传标本图片
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '待审核', count: pending.length, color: '#f59e0b', bg: '#fff8e1' },
          { label: '已通过', count: approved.length, color: '#2d6a4f', bg: '#e8f5e9' },
          { label: '已拒绝', count: rejected.length, color: '#ef4444', bg: '#ffebee' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.count}</div>
            <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Info notice */}
      <div className="p-4 rounded-xl" style={{ background: '#e8f5e9', border: '1px solid #c8e6c9' }}>
        <p style={{ fontSize: '13px', color: '#2d6a4f' }}>
          📌 上传的图片需经管理员审核通过后方可展示。审核通过后，图片将显示在相应标本的图片库中。
        </p>
      </div>

      {/* Images grid */}
      {myImages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
          <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p style={{ fontSize: '14px', color: '#aaa' }}>还没有上传图片</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {myImages.map(img => (
            <div key={img.id} className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <ImageViewer src={img.url} className="w-full h-full" />
              </div>
              <div className="p-3">
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a', marginBottom: '4px' }}>{img.specimenName}</div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={img.status} />
                  <span style={{ fontSize: '11px', color: '#aaa' }}>{img.uploadedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>上传标本图片</h3>
              <button onClick={() => setShowAddForm(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Mode toggle */}
              <div className="flex gap-2 p-1 rounded-xl" style={{ background: '#f5f5f5' }}>
                <button onClick={() => setForm(f => ({ ...f, isNew: false }))}
                  className="flex-1 py-2 rounded-lg transition-all" style={{ background: !form.isNew ? '#fff' : 'transparent', color: !form.isNew ? '#2d6a4f' : '#888', fontSize: '13px', boxShadow: !form.isNew ? '0 1px 3px rgba(0,0,0,0.12)' : 'none' }}>
                  已有标本追加图片
                </button>
                <button onClick={() => setForm(f => ({ ...f, isNew: true }))}
                  className="flex-1 py-2 rounded-lg transition-all" style={{ background: form.isNew ? '#fff' : 'transparent', color: form.isNew ? '#2d6a4f' : '#888', fontSize: '13px', boxShadow: form.isNew ? '0 1px 3px rgba(0,0,0,0.12)' : 'none' }}>
                  添加新标本
                </button>
              </div>

              <div>
                <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>所属标本馆</label>
                <select value={form.museumId} onChange={e => setForm(f => ({ ...f, museumId: e.target.value, categoryId: '' }))}
                  className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }}>
                  <option value="">选择标本馆</option>
                  {museums.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>分类</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }}>
                  <option value="">选择分类</option>
                  {formCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {!form.isNew ? (
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>选择标本</label>
                  <select value={selectedSpecimenId} onChange={e => setSelectedSpecimenId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }}>
                    <option value="">选择标本</option>
                    {existingSpecimens.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>标本名称 *</label>
                    <input value={form.newName} onChange={e => setForm(f => ({ ...f, newName: e.target.value }))}
                      placeholder="标本名称" className="w-full px-3 py-2.5 rounded-xl outline-none"
                      style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>备注信息</label>
                    <textarea value={form.newNotes} onChange={e => setForm(f => ({ ...f, newNotes: e.target.value }))}
                      rows={3} className="w-full px-3 py-2.5 rounded-xl outline-none resize-none"
                      style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
                  </div>
                </>
              )}

              {/* Simulated file upload area */}
              <div className="p-6 rounded-xl text-center" style={{ border: '2px dashed #c8e6c9', background: '#f8fdf8', cursor: 'pointer' }}>
                <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#52b788' }} />
                <p style={{ fontSize: '13px', color: '#888' }}>点击或拖拽上传图片（演示：自动使用示例图片）</p>
              </div>

              <div className="p-3 rounded-xl" style={{ background: '#fff8e1' }}>
                <p style={{ fontSize: '12px', color: '#f57f17' }}>上传的图片将经管理员审核后方可公开展示。</p>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowAddForm(false)} className="flex-1 py-2.5 rounded-xl border hover:bg-gray-50" style={{ fontSize: '14px', borderColor: '#ddd' }}>取消</button>
              <button onClick={handleUpload} className="flex-1 py-2.5 rounded-xl text-white" style={{ background: '#2d6a4f', fontSize: '14px' }}>提交上传</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
