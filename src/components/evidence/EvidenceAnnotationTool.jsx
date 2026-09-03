import React, { useState, useRef, useEffect } from 'react';
import { 
  Square, 
  Circle as CircleIcon, 
  ArrowUpRight, 
  Type, 
  Trash2, 
  Save, 
  X, 
  RotateCcw, 
  Check, 
  Edit3 
} from 'lucide-react';
import { getEvidenceAnnotations, saveEvidenceAnnotations } from '../../utils/storage';

export default function EvidenceAnnotationTool({ returnId, image, imageIndex, onClose }) {
  const [tool, setTool] = useState('rectangle'); // 'rectangle' | 'circle' | 'arrow' | 'text'
  const [color, setColor] = useState('#ef4444'); // Red default
  const [annotations, setAnnotations] = useState([]);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [showTextModal, setShowTextModal] = useState(false);
  const [pendingTextPos, setPendingTextPos] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const imageKey = image?.id || `img_${imageIndex}`;

  // Load existing annotations from localStorage
  useEffect(() => {
    if (returnId && imageKey) {
      const stored = getEvidenceAnnotations(returnId, imageKey);
      setAnnotations(stored);
    }
  }, [returnId, imageKey]);

  // Redraw canvas whenever annotations or current drawing changes
  useEffect(() => {
    drawCanvas();
  }, [annotations, currentAnnotation]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved annotations
    annotations.forEach((ann) => {
      drawSingleAnnotation(ctx, ann);
    });

    // Draw active in-progress annotation
    if (currentAnnotation) {
      drawSingleAnnotation(ctx, currentAnnotation);
    }
  };

  const drawSingleAnnotation = (ctx, ann) => {
    ctx.strokeStyle = ann.color || '#ef4444';
    ctx.fillStyle = ann.color || '#ef4444';
    ctx.lineWidth = 3;

    if (ann.tool === 'rectangle') {
      ctx.beginPath();
      ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
      if (ann.label) {
        drawLabelBadge(ctx, ann.label, ann.x, ann.y - 8, ann.color);
      }
    } else if (ann.tool === 'circle') {
      ctx.beginPath();
      const radiusX = Math.abs(ann.width) / 2;
      const radiusY = Math.abs(ann.height) / 2;
      const centerX = ann.x + ann.width / 2;
      const centerY = ann.y + ann.height / 2;
      ctx.ellipse(centerX, centerY, Math.max(radiusX, 5), Math.max(radiusY, 5), 0, 0, 2 * Math.PI);
      ctx.stroke();
      if (ann.label) {
        drawLabelBadge(ctx, ann.label, ann.x, ann.y - 8, ann.color);
      }
    } else if (ann.tool === 'arrow') {
      drawArrow(ctx, ann.x, ann.y, ann.x + ann.width, ann.y + ann.height, ann.color);
      if (ann.label) {
        drawLabelBadge(ctx, ann.label, ann.x, ann.y - 8, ann.color);
      }
    } else if (ann.tool === 'text') {
      drawLabelBadge(ctx, ann.text, ann.x, ann.y, ann.color);
    }
  };

  const drawLabelBadge = (ctx, text, x, y, bgColor = '#ef4444') => {
    ctx.font = 'bold 13px sans-serif';
    const padding = 5;
    const textWidth = ctx.measureText(text).width;
    
    // Background chip
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = bgColor;
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y - 16, textWidth + padding * 2, 20);
    ctx.strokeRect(x, y - 16, textWidth + padding * 2, 20);

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x + padding, y - 2);
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY, arrowColor) => {
    const headlen = 12;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = arrowColor;
    ctx.fill();
  };

  // Mouse handlers for canvas drawing
  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e) => {
    const pos = getCanvasPos(e);
    startPos.current = pos;

    if (tool === 'text') {
      setPendingTextPos(pos);
      setShowTextModal(true);
      return;
    }

    isDrawing.current = true;
    setCurrentAnnotation({
      id: `ann_${Date.now()}`,
      tool,
      color,
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      label: ''
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const pos = getCanvasPos(e);

    setCurrentAnnotation((prev) => ({
      ...prev,
      width: pos.x - startPos.current.x,
      height: pos.y - startPos.current.y
    }));
  };

  const handleMouseUp = () => {
    if (!isDrawing.current || !currentAnnotation) return;
    isDrawing.current = false;

    // Only save if has non-zero dimension
    if (Math.abs(currentAnnotation.width) > 5 || Math.abs(currentAnnotation.height) > 5) {
      setAnnotations((prev) => [...prev, currentAnnotation]);
    }
    setCurrentAnnotation(null);
  };

  const handleAddText = () => {
    if (textInput.trim() && pendingTextPos) {
      const newAnn = {
        id: `ann_${Date.now()}`,
        tool: 'text',
        color,
        x: pendingTextPos.x,
        y: pendingTextPos.y,
        text: textInput.trim()
      };
      setAnnotations((prev) => [...prev, newAnn]);
      setTextInput('');
      setShowTextModal(false);
      setPendingTextPos(null);
    }
  };

  const handleSaveToStorage = () => {
    saveEvidenceAnnotations(returnId, imageKey, annotations);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all drawn annotations for this photo?')) {
      setAnnotations([]);
      saveEvidenceAnnotations(returnId, imageKey, []);
    }
  };

  const handleDeleteAnnotation = (id) => {
    const updated = annotations.filter(a => a.id !== id);
    setAnnotations(updated);
  };

  return (
    <div className="modal-backdrop annotation-tool-backdrop" onClick={onClose}>
      <div 
        className="modal-content annotation-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <div className="card-header-icon bg-primary-light">
              <Edit3 size={18} className="icon-blue" />
            </div>
            <div>
              <h3 className="modal-title-text">Manual Evidence Annotation Tool</h3>
              <p className="modal-subtitle-text">
                Highlight damage areas and attach review callouts without modifying original media
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="annotation-toolbar">
          <div className="toolbar-group">
            <span className="tool-group-label">Draw Tool:</span>
            <button
              type="button"
              className={`tool-select-btn ${tool === 'rectangle' ? 'active' : ''}`}
              onClick={() => setTool('rectangle')}
              title="Rectangle Box"
            >
              <Square size={15} /> Rectangle
            </button>
            <button
              type="button"
              className={`tool-select-btn ${tool === 'circle' ? 'active' : ''}`}
              onClick={() => setTool('circle')}
              title="Circle / Ellipse"
            >
              <CircleIcon size={15} /> Circle
            </button>
            <button
              type="button"
              className={`tool-select-btn ${tool === 'arrow' ? 'active' : ''}`}
              onClick={() => setTool('arrow')}
              title="Arrow Pointer"
            >
              <ArrowUpRight size={15} /> Arrow
            </button>
            <button
              type="button"
              className={`tool-select-btn ${tool === 'text' ? 'active' : ''}`}
              onClick={() => setTool('text')}
              title="Text Callout"
            >
              <Type size={15} /> Text Note
            </button>
          </div>

          <div className="toolbar-group">
            <span className="tool-group-label">Color:</span>
            {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'].map((c) => (
              <button
                key={c}
                type="button"
                className={`color-swatch-btn ${color === c ? 'active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>

          <div className="toolbar-actions-right">
            <button
              type="button"
              onClick={handleClearAll}
              className="btn-ghost btn-sm"
              title="Clear all annotations"
            >
              <Trash2 size={14} /> Clear All
            </button>
            <button
              type="button"
              onClick={handleSaveToStorage}
              className="btn-primary btn-sm"
            >
              {savedSuccess ? (
                <>
                  <Check size={14} /> Saved!
                </>
              ) : (
                <>
                  <Save size={14} /> Save Annotations
                </>
              )}
            </button>
          </div>
        </div>

        {/* Canvas Workspace */}
        <div className="annotation-canvas-container">
          <div className="canvas-wrapper">
            <img 
              src={image.dataUrl} 
              alt="Base evidence" 
              className="annotation-base-image"
              onLoad={(e) => {
                const canvas = canvasRef.current;
                if (canvas && e.target) {
                  canvas.width = e.target.naturalWidth || 800;
                  canvas.height = e.target.naturalHeight || 600;
                  drawCanvas();
                }
              }}
            />
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="annotation-drawing-layer"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />
          </div>

          {/* Annotations List Sidebar */}
          <div className="annotations-sidebar">
            <h4 className="sidebar-heading">Attached Notes ({annotations.length})</h4>
            <div className="annotations-list">
              {annotations.length > 0 ? (
                annotations.map((ann, idx) => (
                  <div key={ann.id || idx} className="ann-list-item">
                    <span 
                      className="ann-color-dot" 
                      style={{ backgroundColor: ann.color }} 
                    />
                    <span className="ann-desc">
                      {ann.tool.toUpperCase()}: {ann.text || ann.label || `Damage region ${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnotation(ann.id)}
                      className="btn-delete-ann"
                      title="Delete annotation"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-dim text-xs p-2">
                  Click and drag on the photo to draw damage markers or place text callouts.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Text Note Modal Input */}
        {showTextModal && (
          <div className="text-input-dialog" onClick={(e) => e.stopPropagation()}>
            <h5 className="font-semibold text-sm mb-2 text-white">Enter Callout Label</h5>
            <input
              type="text"
              className="form-input mb-3"
              placeholder="e.g. Broken armrest frame..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
            />
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => { setShowTextModal(false); setPendingTextPos(null); }} 
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleAddText} 
                className="btn-primary btn-sm"
              >
                Place Label
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
