import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, X, Check, FolderOpen, Tag } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import type { Museum, Category } from '../../data/types';

export default function MuseumManagement() {
  const { museums, specimens, addMuseum, updateMuseum, deleteMuseum, addCategory, updateCategory, deleteCategory } = useApp();
  const [expandedMuseum, setExpandedMuseum] = useState<string | null>(museums[0]?.id || null);
  const [showAddMuseum, setShowAddMuseum] = useState(false);
  const [editMuseum, setEditMuseum] = useState<Museum | null>(null);
  const [editCategory, setEditCategory] = useState<{ museumId: string; cat: Category } | null>(null);
  const [showAddCategory, setShowAddCategory] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'museum' | 'category'; id: string; museumId?: string; name: string } | null>(null);

  const [museumForm, setMuseumForm] = useState({ name: '', description: '', icon: '🌿' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  const icons = ['🌿', '🌱', '🍀', '🪴', '🌾', '🌸', '🍃', '🌲', '🌳', '🔬', '💊', '🧪'];

  const handleAddMuseum = () => {
    if (!museumForm.name) return;
    addMuseum({ name: museumForm.name, description: museumForm.description, icon: museumForm.icon });
    setMuseumForm({ name: '', description: '', icon: '🌿' });
    setShowAddMuseum(false);
  };

  const handleUpdateMuseum = () => {
    if (!editMuseum) return;
    updateMuseum(editMuseum.id, { name: editMuseum.name, description: editMuseum.description, icon: editMuseum.icon });
    setEditMuseum(null);
  };

  const handleAddCategory = (museumId: string) => {
    if (!categoryForm.name) return;
    addCategory(museumId, { name: categoryForm.name, description: categoryForm.description });
    setCategoryForm({ name: '', description: '' });
    setShowAddCategory(null);
  };

  const handleUpdateCategory = () => {
    if (!editCategory) return;
    updateCategory(editCategory.museumId, editCategory.cat.id, {
      name: editCategory.cat.name, description: editCategory.cat.description,
    });
    setEditCategory(null);
  };

  const handleDeleteMuseum = (id: string, name: string) => {
    setConfirmDelete({ type: 'museum', id, name });
  };

  const handleDeleteCategory = (museumId: string, catId: string, name: string) => {
    setConfirmDelete({ type: 'category', id: catId, museumId, name });
  };

  const confirmDeleteAction = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'museum') {
      deleteMuseum(confirmDelete.id);
    } else {
      deleteCategory(confirmDelete.museumId!, confirmDelete.id);
    }
    setConfirmDelete(null);
  };

  const Modal = ({ title, onClose, children, onConfirm, confirmText = '确认' }: {
    title: string; onClose: () => void; children: React.ReactNode;
    onConfirm?: () => void; confirmText?: string;
  }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {onConfirm && (
          <div className="flex gap-3 px-6 pb-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border hover:bg-gray-50 transition-colors" style={{ fontSize: '14px', borderColor: '#ddd' }}>
              取消
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-white transition-colors" style={{ background: '#2d6a4f', fontSize: '14px' }}>
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800">标本馆管理</h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: '14px' }}>管理标本馆及其二级分类</p>
        </div>
        <button
          onClick={() => setShowAddMuseum(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white transition-colors"
          style={{ background: '#2d6a4f', fontSize: '14px' }}
        >
          <Plus className="w-4 h-4" />
          新增标本馆
        </button>
      </div>

      {/* Museums list */}
      <div className="space-y-4">
        {museums.map(museum => {
          const specimenCount = specimens.filter(s => s.museumId === museum.id).length;
          const isExpanded = expandedMuseum === museum.id;
          return (
            <div key={museum.id} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
              {/* Museum header */}
              <div
                className="flex items-center gap-4 p-5 cursor-pointer"
                style={{ borderBottom: isExpanded ? '1px solid #f0f0f0' : 'none' }}
                onClick={() => setExpandedMuseum(isExpanded ? null : museum.id)}
              >
                <div className="text-2xl">{museum.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 style={{ color: '#1a1a1a', fontSize: '16px' }}>{museum.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full" style={{ background: '#e8f5e9', color: '#2d6a4f', fontSize: '12px' }}>
                      {museum.categories.length}个分类
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full" style={{ background: '#f0f4f0', color: '#555', fontSize: '12px' }}>
                      {specimenCount}个标本
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#888', marginTop: '2px' }} className="truncate">{museum.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); setEditMuseum({ ...museum }); }}
                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteMuseum(museum.id, museum.name); }}
                    className="p-2 rounded-lg transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {/* Categories */}
              {isExpanded && (
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: '13px', color: '#888', fontWeight: 500 }}>二级分类</span>
                    <button
                      onClick={() => { setShowAddCategory(museum.id); setCategoryForm({ name: '', description: '' }); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: '#e8f5e9', color: '#2d6a4f', fontSize: '13px' }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      添加分类
                    </button>
                  </div>

                  {museum.categories.length === 0 ? (
                    <div className="text-center py-8 rounded-xl" style={{ background: '#f8faf8' }}>
                      <Tag className="w-8 h-8 mx-auto mb-2" style={{ color: '#ccc' }} />
                      <p style={{ fontSize: '13px', color: '#aaa' }}>暂无分类，请添加</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {museum.categories.map(cat => {
                        const catSpecimenCount = specimens.filter(s => s.categoryId === cat.id).length;
                        return (
                          <div key={cat.id} className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: '#f8faf8', border: '1px solid #eef0ee' }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#e8f5e9' }}>
                              <FolderOpen className="w-4 h-4" style={{ color: '#2d6a4f' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div style={{ fontSize: '14px', fontWeight: 500, color: '#222' }}>{cat.name}</div>
                              <div style={{ fontSize: '12px', color: '#888' }}>{catSpecimenCount}个标本 · {cat.description || '无描述'}</div>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setEditCategory({ museumId: museum.id, cat: { ...cat } })}
                                className="p-1.5 rounded-lg hover:bg-white transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(museum.id, cat.id, cat.name)}
                                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Museum Modal */}
      {showAddMuseum && (
        <Modal title="新增标本馆" onClose={() => setShowAddMuseum(false)} onConfirm={handleAddMuseum} confirmText="创建">
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>图标</label>
              <div className="flex flex-wrap gap-2">
                {icons.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setMuseumForm(f => ({ ...f, icon }))}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all"
                    style={{
                      background: museumForm.icon === icon ? '#e8f5e9' : '#f5f5f5',
                      border: museumForm.icon === icon ? '2px solid #2d6a4f' : '2px solid transparent',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>馆名称 *</label>
              <input
                value={museumForm.name}
                onChange={e => setMuseumForm(f => ({ ...f, name: e.target.value }))}
                placeholder="如：中药材（饮片）馆"
                className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }}
                onFocus={e => e.currentTarget.style.borderColor = '#2d6a4f'}
                onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
              />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>描述</label>
              <textarea
                value={museumForm.description}
                onChange={e => setMuseumForm(f => ({ ...f, description: e.target.value }))}
                placeholder="标本馆简介..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl outline-none resize-none"
                style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }}
                onFocus={e => e.currentTarget.style.borderColor = '#2d6a4f'}
                onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Museum Modal */}
      {editMuseum && (
        <Modal title="编辑标本馆" onClose={() => setEditMuseum(null)} onConfirm={handleUpdateMuseum} confirmText="保存">
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>图标</label>
              <div className="flex flex-wrap gap-2">
                {icons.map(icon => (
                  <button key={icon} onClick={() => setEditMuseum(m => m ? { ...m, icon } : m)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ background: editMuseum.icon === icon ? '#e8f5e9' : '#f5f5f5', border: editMuseum.icon === icon ? '2px solid #2d6a4f' : '2px solid transparent' }}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>馆名称</label>
              <input value={editMuseum.name} onChange={e => setEditMuseum(m => m ? { ...m, name: e.target.value } : m)}
                className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>描述</label>
              <textarea value={editMuseum.description} onChange={e => setEditMuseum(m => m ? { ...m, description: e.target.value } : m)}
                rows={3} className="w-full px-3 py-2.5 rounded-xl outline-none resize-none"
                style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
            </div>
          </div>
        </Modal>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <Modal title="添加分类" onClose={() => setShowAddCategory(null)} onConfirm={() => handleAddCategory(showAddCategory)} confirmText="添加">
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>分类名称 *</label>
              <input value={categoryForm.name} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))}
                placeholder="如：根及根茎类" className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>描述</label>
              <input value={categoryForm.description} onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))}
                placeholder="分类描述..." className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Category Modal */}
      {editCategory && (
        <Modal title="编辑分类" onClose={() => setEditCategory(null)} onConfirm={handleUpdateCategory} confirmText="保存">
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>分类名称</label>
              <input value={editCategory.cat.name} onChange={e => setEditCategory(ec => ec ? { ...ec, cat: { ...ec.cat, name: e.target.value } } : ec)}
                className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: '13px', color: '#555' }}>描述</label>
              <input value={editCategory.cat.description || ''} onChange={e => setEditCategory(ec => ec ? { ...ec, cat: { ...ec.cat, description: e.target.value } } : ec)}
                className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ border: '1.5px solid #e0e0e0', fontSize: '14px' }} />
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#fee2e2' }}>
                <Trash2 className="w-5 h-5" style={{ color: '#ef4444' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>确认删除</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                确定要删除{confirmDelete.type === 'museum' ? '标本馆' : '分类'}「{confirmDelete.name}」吗？
                <br /><span style={{ color: '#ef4444', fontSize: '12px' }}>此操作将同时删除所有关联标本，不可恢复！</span>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border hover:bg-gray-50" style={{ fontSize: '14px' }}>
                  取消
                </button>
                <button onClick={confirmDeleteAction} className="flex-1 py-2.5 rounded-xl text-white" style={{ background: '#ef4444', fontSize: '14px' }}>
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
