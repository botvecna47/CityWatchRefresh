import { useEffect, useState, useRef, useCallback, forwardRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export const ImageLightbox = forwardRef<HTMLDivElement, ImageLightboxProps>(({ images, initialIndex, onClose }, ref) => {
  const [index, setIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0); // -1 = prev, 1 = next
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const canGoPrev = index > 0;
  const canGoNext = index < images.length - 1;

  const goPrev = useCallback(() => {
    if (!canGoPrev || zoomed) return;
    setDirection(-1);
    setIndex(i => i - 1);
  }, [canGoPrev, zoomed]);

  const goNext = useCallback(() => {
    if (!canGoNext || zoomed) return;
    setDirection(1);
    setIndex(i => i + 1);
  }, [canGoNext, zoomed]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, onClose]);

  // Reset zoom on image change
  useEffect(() => {
    setZoomed(false);
  }, [index]);

  // Touch / pointer swipe
  const onPointerDown = (e: React.PointerEvent) => {
    if (zoomed) return;
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointerStart.current || zoomed) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = Math.abs(e.clientY - pointerStart.current.y);
    if (Math.abs(dx) > 50 && dy < 80) {
      dx < 0 ? goNext() : goPrev();
    }
    pointerStart.current = null;
  };

  // Double-click to zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    if (zoomed) {
      setZoomed(false);
      return;
    }
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
    setZoomed(true);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "60%" : "-60%", opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-60%" : "60%", opacity: 0, scale: 0.95 }),
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/92 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <button
            onClick={zoomed ? () => setZoomed(false) : undefined}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={zoomed ? "Zoom out (or double-click image)" : "Double-click image to zoom"}
          >
            {zoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>
          {zoomed && (
            <span className="text-white/60 text-xs">Double-click to zoom out</span>
          )}
        </div>

        {images.length > 1 && (
          <span className="text-white/80 text-sm font-medium tabular-nums bg-black/40 px-3 py-1 rounded-full">
            {index + 1} / {images.length}
          </span>
        )}

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Image ───────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center w-full h-full overflow-hidden px-16">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={index}
            ref={imgRef}
            src={images[index]}
            alt={`Image ${index + 1}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className="select-none rounded-sm shadow-2xl"
            style={{
              maxHeight: "85vh",
              maxWidth: "100%",
              objectFit: "contain",
              cursor: zoomed ? "zoom-out" : "zoom-in",
              transform: zoomed
                ? `scale(2.5) translate(${(50 - zoomOrigin.x) * 0.5}%, ${(50 - zoomOrigin.y) * 0.5}%)`
                : "scale(1)",
              transition: zoomed ? "transform 0.3s ease" : "transform 0.3s ease",
              transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
            }}
            draggable={false}
            onDoubleClick={handleDoubleClick}
          />
        </AnimatePresence>
      </div>

      {/* ── Prev / Next arrows ──────────────────────────────────── */}
      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            disabled={!canGoPrev || zoomed}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            title="Previous (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goNext}
            disabled={!canGoNext || zoomed}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            title="Next (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* ── Dot indicators ──────────────────────────────────────── */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (zoomed) return;
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`rounded-full transition-all duration-200 ${
                i === index
                  ? "w-3 h-3 bg-white"
                  : "w-2 h-2 bg-white/40 hover:bg-white/70"
              }`}
              title={`Image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
});
ImageLightbox.displayName = "ImageLightbox";
