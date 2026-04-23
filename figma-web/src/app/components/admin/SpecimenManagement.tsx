import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, X, Filter, ChevronDown, Image, Check, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { ImageViewer } from '../shared/ImageViewer';
import type { Specimen } from '../../data/types';

export default function SpecimenManagement() {
  const { museums, specimens, users, currentUser, addSpecimen, updateSpecimen, deleteSpecimen, addSpecimenImage, approveImage, rejectImage, deleteImage } = useApp();
  const [search, setSearch] = useState('');
  const [filterMuseum, setFilterMuseum] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedSpecimen, setSelectedSpecimen] = useState<Specimen | null>(null);
  const [showAddSpecimen, setShowAddSpecimen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({ museumId: '', categoryId: '', name: '', latinName: '', notes: '', properties: '' });

  const isAdmin = currentUser?.role === 'admin';
  const isVip = currentUser?.role === 'vip_teacher';

  const allCategories = useMemo(() => {
    if (!filterMuseum) return museums.flatMap(m => m.categories);
    return museums.find(m => m.id === filterMuseum)?.categories || [];
  }, [museums, filterMuseum]);

  const filtered = useMemo(() => specimens.filter(s => {
    const matchSearch = !search || s.name.includes(search) || s.latinName?.includes(search) || s.notes.includes(search);
    const matchMuseum = !filterMuseum || s.museumId === filterMuseum;
    const matchCat = !filterCategory || s.categoryId === filterCategory;
    return matchSearch && matchMuseum && matchCat;
  }), [specimens, search, filterMuseum, filterCategory]);

  const getMuseumName = (id: string) => museums.find(m => m.id === id)?.name || '-';
  const getCategoryName = (museumId: string, catId: string) =>
    museums.find(m => m.id === museumId)?.categories.find(c => c.id === catId)?.name || '-';
  const getApprovedImages = (s: Specimen) => s.images.filter(img => img.status === 'approved');
  const getPendingImages = (s: Specimen) => s.images.filter(img => img.status === 'pending');

  const handleAddSpecimen = () => {
    if (!form.museumId || !form.categoryId || !form.name) return;
    addSpecimen({
      museumId: form.museumId, categoryId: form.categoryId, name: form.name,
      latinName: form.latinName, notes: form.notes, properties: form.properties,
      images: [], createdBy: currentUser?.id || '',
    });
    setForm({ museumId: '', categoryId: '', name: '', latinName: '', notes: '', properties: '' });
    setShowAddSpecimen(false);
  };

  const handleSimulateUpload = (specimenId: string) => {
    const sampleUrls = [
      'https://images.unsplash.com/photo-1681390367146-91e574fc6b7d?w=600&q=80',
      'https://images.unsplash.com/photo-1727830644210-8e03ac4ea6cd?w=600&q=80',
    ];
    addSpecimenImage(specimenId, {
      specimenId,
      url: sampleUrls[Math.floor(Math.random() * sampleUrls.length)],
      uploadedBy: currentUser?.id || '',
      uploadedByName: currentUser?.name || '',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: isAdmin ? 'approved' : 'pending',
    });
  };

  const formCategories = useMemo(() => {
    if (!form.museumId) return [];
    return museums.find(m => m.id === form.museumId)?.categories || [];
  }, [museums, form.museumId]);

  const Modal = ({ title, onClose, children, onConfirm, wide = false }: {
    title: string; onClose: () => void; children: React.ReactNode; onConfirm?: () => void; wide?: boolean;
  }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full my-4" style={{ maxWidth: wide ? '800px' : '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-6 overflow-y-auto" style={{ maxHeight: '75vh' }}>{children}</div>
        {onConfirm && (
          <div className="flex gap-3 px-6 pb-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border hover:bg-gray-50" style={{ fontSize: '14px', borderColor: '#ddd' }}>取消</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-white" style={{ background: '#2d6a4f', fontSize: '14px' }}>保存</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-gray-800">标本信息管理</h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: '14px' }}>共 {filtered.length} 个标本</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddSpecimen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white"
            style={{ background: '#2d6a4f', fontSize: '14px' }}>
            <Plus className="w-4 h-4" />新增标本
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索标本名称、拉丁名..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none bg-white"
            style={{ border: '1px solid #e0e0e0', fontSize: '14px' }} />
        </div>
        <select value={filterMuseum} onChange={e => { setFilterMuseum(e.target.value); setFilterCategory(''); }}
          className="px-3 py-2.5 rounded-xl bg-white outline-none" style={{ border: '1px solid #e0e0e0', fontSize: '14px' }}>
          <option value="">全部标本馆</option>
          {museums.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white outline-none" style={{ border: '1px solid #e0e0e0', fontSize: '14px' }}>
          <option value="">全部分类</option>
          {allCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Specimen grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <FlaskIcon />
          <p style={{ color: '#aaa', fontSize: '14px' }}>暂无匹配标本</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(specimen => {
            const approvedImgs = getApprovedImages(specimen);
            const pendingImgs = getPendingImages(specimen);
            const thumbImg = approvedImgs[0]?.url || specimen.images[0]?.url;
            return (
              <div key={specimen.id} className="bg-white rounded-xl overflow-hidden cursor-pointer group transition-all hover:shadow-lg"
                style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}
                onClick={() => setSelectedSpecimen(specimen)}>
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  {thumbImg ? (
                    <img src={thumbImg} alt={specimen.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  {pendingImgs.length > 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-white" style={{ fontSize: '11px' }}>
                      <Clock className="w-3 h-3" />{pendingImgs.length}待审
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/40 text-white px-2 py-0.5 rounded-full" style={{ fontSize: '11px' }}>
                    {approvedImgs.length}张图
                  </div>
                </div>
                <div className="p-3">
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '2px' }}>{specimen.name}</div>
                  <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', marginBottom: '4px' }} className="truncate">{specimen.latinName || '-'}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full" style={{ background: '#e8f5e9', color: '#2d6a4f', fontSize: '11px' }}>
                      {getCategoryName(specimen.museumId, specimen.categoryId)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Specimen detail modal */}
      {selectedSpecimen && (
        <Modal title={selectedSpecimen.name} onClose={() => setSelectedSpecimen(null)} wide>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Images */}
            <div>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px', fontWeight: 500 }}>图片管理</div>
              {selectedSpecimen.images.length === 0 ? (
                <div className="aspect-[4/3] rounded-xl flex flex-col items-center justify-center" style={{ background: '#f8f9fa' }}>
                  <Image className="w-10 h-10 text-gray-300 mb-2" />
                  <p style={{ fontSize: '13px', color: '#aaa' }}>暂无图片</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedSpecimen.images.map(img => (
                    <div key={img.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f8f9fa' }}>
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageViewer src={img.url} className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: '12px', color: '#555' }}>上传者：{img.uploadedByName}</div>
                        <div style={{ fontSize: '11px', color: '#888' }}>{img.uploadedAt}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {img.status === 'approved' && <span className="flex items-center gap-1 text-green-600" style={{ fontSize: '11px' }}><Check className="w-3 h-3" />已审核</span>}
                          {img.status === 'pending' && <span className="flex items-center gap-1 text-amber-600" style={{ fontSize: '11px' }}><Clock className="w-3 h-3" />待审核</span>}
                          {img.status === 'rejected' && <span className="flex items-center gap-1 text-red-500" style={{ fontSize: '11px' }}><X className="w-3 h-3" />已拒绝</span>}
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex flex-col gap-1">
                          {img.status === 'pending' && (
                            <>
                              <button onClick={() => approveImage(selectedSpecimen.id, img.id)} className="px-2 py-1 rounded text-white text-xs" style={{ background: '#2d6a4f', fontSize: '11px' }}>通过</button>
                              <button onClick={() => rejectImage(selectedSpecimen.id, img.id)} className="px-2 py-1 rounded text-xs" style={{ background: '#fee2e2', color: '#ef4444', fontSize: '11px' }}>拒绝</button>
                            </>
                          )}
                          <button onClick={() => deleteImage(selectedSpecimen.id, img.id)} className="p-1.5 rounded hover:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => handleSimulateUpload(selectedSpecimen.id)}
                className="w-full mt-3 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                style={{ background: '#e8f5e9', color: '#2d6a4f', fontSize: '13px', border: '1.5px dashed #52b788' }}>
                <Plus className="w-4 h-4" />模拟上传图片
              </button>
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>所属标本馆</div>
                <div style={{ fontSize: '14px', color: '#333' }}>{getMuseumName(selectedSpecimen.museumId)}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>分类</div>
                <div style={{ fontSize: '14px', color: '#333' }}>{getCategoryName(selectedSpecimen.museumId, selectedSpecimen.categoryId)}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>拉丁学名</div>
                <div style={{ fontSize: '14px', color: '#333', fontStyle: 'italic' }}>{selectedSpecimen.latinName || '—'}</div>
              </div>
              {selectedSpecimen.properties && (
                <div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>性味</div>
                  <div style={{ fontSize: '14px', color: '#333' }}>{selectedSpecimen.properties}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>备注信息</div>
                <div style={{ fontSize: '13px', color: '#444', lineHeight: '1.7', padding: '10px', borderRadius: '8px', background: '#f8faf8' }}>
                  {selectedSpecimen.notes || '暂无备注'}
                </div>
              </div>
              {isAdmin && (
                <button onClick={() => { if (window.confirm('确认删除此标本？')) { deleteSpecimen(selectedSpecimen.id); setSelectedSpecimen(null); } }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 transition-colors hover:bg-red-50" style={{ fontSize: '13px' }}>
                  <Trash2 className="w-4 h-4" />删除此标本
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Specimen Modal */}
      {showAddSpecimen && (
        <Modal title="新增标本" onClose={() => setShowAddSpecimen(false)} onConfirm={handleAddSpecimen}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>所属标本馆 *</label>
                <select value={form.museumId} onChange={e => setForm(f => ({ ...f, museumId: e.target.value, categoryId: '' }))}
                  className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }}>
                  <option value="">选择标本馆</option>
                  {museums.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>分类 *</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }}>
                  <option value="">选择分类</option>
                  {formCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>标本名称 *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="如：人参" className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>拉丁学名</label>
              <input value={form.latinName} onChange={e => setForm(f => ({ ...f, latinName: e.target.value }))}
                placeholder="如：Panax ginseng C. A. Mey." className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ border: '1.5px solid #e0e0e0', fontSize: '14px', fontStyle: 'italic' }} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>性味</label>
              <input value={form.properties} onChange={e => setForm(f => ({ ...f, properties: e.target.value }))}
                placeholder="如：性微温，味甘微苦" className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>备注信息</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="标本详细描述、功效等信息..." rows={4}
                className="w-full px-3 py-2.5 rounded-xl outline-none resize-none"
                style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function FlaskIcon() {
  return (
    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#f0f4f0' }}>
      <span style={{ fontSize: '32px' }}>🔬</span>
    </div>
  );
}
