import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt?: string;
  className?: string;
  watermarkText?: string;
  showThumbnail?: boolean;
}

export function ImageViewer({ src, alt = '', className = '', watermarkText = '中药数字标本馆', showThumbnail = true }: ImageViewerProps) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback(() => setScale(s => Math.min(s + 0.25, 4)), []);
  const handleZoomOut = useCallback(() => {
    setScale(s => {
      const newScale = Math.max(s - 0.25, 0.5);
      if (newScale <= 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  }, []);
  const handleReset = useCallback(() => { setScale(1); setPosition({ x: 0, y: 0 }); }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale(s => Math.min(s + 0.1, 4));
    } else {
      setScale(s => {
        const newScale = Math.max(s - 0.1, 0.5);
        if (newScale <= 1) setPosition({ x: 0, y: 0 });
        return newScale;
      });
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') handleClose();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleClose, handleZoomIn, handleZoomOut]);

  // Prevent right-click
  const preventContextMenu = useCallback((e: React.MouseEvent) => e.preventDefault(), []);

  const Watermark = () => (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 10 }}
    >
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <div
            key={`${row}-${col}`}
            className="absolute text-white/20 text-sm font-medium whitespace-nowrap"
            style={{
              top: `${row * 14}%`,
              left: `${col * 22 - 5}%`,
              transform: 'rotate(-30deg)',
              fontSize: '12px',
              userSelect: 'none',
            }}
          >
            {watermarkText}
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      {showThumbnail && (
        <div
          className={`relative cursor-zoom-in overflow-hidden ${className}`}
          onClick={handleOpen}
          onContextMenu={preventContextMenu}
        >
          <img src={src} alt={alt} className="w-full h-full object-cover" draggable={false} />
          <div className="absolute inset-0 pointer-events-none select-none">
            {Array.from({ length: 4 }).map((_, row) =>
              Array.from({ length: 3 }).map((_, col) => (
                <div
                  key={`${row}-${col}`}
                  className="absolute text-white/25 whitespace-nowrap"
                  style={{
                    top: `${row * 30 + 5}%`,
                    left: `${col * 36 - 5}%`,
                    transform: 'rotate(-30deg)',
                    fontSize: '11px',
                    userSelect: 'none',
                  }}
                >
                  {watermarkText}
                </div>
              ))
            )}
          </div>
          <div className="absolute bottom-2 right-2 bg-black/40 rounded-full p-1">
            <ZoomIn className="w-3 h-3 text-white" />
          </div>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={handleClose}
        >
          {/* Controls */}
          <div
            className="absolute top-4 right-4 flex gap-2 z-20"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={handleZoomOut}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
              title="缩小 (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomIn}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
              title="放大 (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
              title="重置"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
              title="关闭 (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scale indicator */}
          <div className="absolute top-4 left-4 bg-black/40 text-white text-sm px-3 py-1 rounded-full z-20">
            {Math.round(scale * 100)}%
          </div>

          {/* Image container */}
          <div
            ref={containerRef}
            className="relative max-w-[90vw] max-h-[90vh] overflow-hidden"
            style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            onClick={e => e.stopPropagation()}
            onContextMenu={preventContextMenu}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease',
                transformOrigin: 'center center',
              }}
            >
              <img
                src={src}
                alt={alt}
                className="max-w-[90vw] max-h-[85vh] object-contain"
                draggable={false}
                style={{ userSelect: 'none' }}
              />
              <Watermark />
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
            滚轮缩放 · 拖拽移动 · ESC关闭
          </div>
        </div>
      )}
    </>
  );
}

interface ImageGalleryProps {
  images: { id: string; url: string; status: string }[];
  watermarkText?: string;
  showPending?: boolean;
}

export function ImageGallery({ images, watermarkText, showPending = false }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const displayImages = showPending ? images : images.filter(img => img.status === 'approved');

  if (displayImages.length === 0) {
    return (
      <div className="w-full aspect-video bg-gray-100 flex items-center justify-center rounded-lg">
        <span className="text-gray-400 text-sm">暂无图片</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ImageViewer
        src={displayImages[activeIndex]?.url}
        watermarkText={watermarkText}
        className="w-full aspect-[4/3] rounded-lg"
      />
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-colors ${i === activeIndex ? 'border-green-600' : 'border-transparent'}`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
