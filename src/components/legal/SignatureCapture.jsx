import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eraser, Check, Type, PenTool } from 'lucide-react';

export default function SignatureCapture({
  onSignatureChange,
  width = 400,
  height = 150,
  className = ''
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [mode, setMode] = useState('draw'); // 'draw' or 'type'
  const [typedSignature, setTypedSignature] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#1B365D';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw signature line
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.setLineDash([5, 3]);
    ctx.moveTo(20, height - 30);
    ctx.lineTo(width - 20, height - 30);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#1B365D';
  }, [width, height]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    if (mode !== 'draw') return;

    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing || mode !== 'draw') return;

    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing && mode === 'draw') {
      setIsDrawing(false);
      updateSignatureData();
    }
  };

  const updateSignatureData = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange?.({
      type: 'drawn',
      data: dataUrl,
      typed: null,
    });
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    // Redraw signature line
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.setLineDash([5, 3]);
    ctx.moveTo(20, height - 30);
    ctx.lineTo(width - 20, height - 30);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#1B365D';

    setHasSignature(false);
    setTypedSignature('');
    onSignatureChange?.(null);
  };

  const handleTypedSignatureChange = (value) => {
    setTypedSignature(value);

    if (value.trim()) {
      // Draw typed signature on canvas
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Clear and redraw
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);

      // Redraw signature line
      ctx.beginPath();
      ctx.strokeStyle = '#e5e7eb';
      ctx.setLineDash([5, 3]);
      ctx.moveTo(20, height - 30);
      ctx.lineTo(width - 20, height - 30);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw typed signature
      ctx.font = 'italic 32px "Brush Script MT", cursive, sans-serif';
      ctx.fillStyle = '#1B365D';
      ctx.textAlign = 'center';
      ctx.fillText(value, width / 2, height - 45);

      setHasSignature(true);

      onSignatureChange?.({
        type: 'typed',
        data: canvas.toDataURL('image/png'),
        typed: value,
      });
    } else {
      clearSignature();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'draw' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setMode('draw');
            clearSignature();
          }}
        >
          <PenTool className="w-4 h-4 mr-1" />
          Draw
        </Button>
        <Button
          type="button"
          variant={mode === 'type' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setMode('type');
            clearSignature();
          }}
        >
          <Type className="w-4 h-4 mr-1" />
          Type
        </Button>
      </div>

      {/* Typed Signature Input */}
      {mode === 'type' && (
        <Input
          type="text"
          value={typedSignature}
          onChange={(e) => handleTypedSignatureChange(e.target.value)}
          placeholder="Type your full name"
          className="text-lg"
          style={{ fontStyle: 'italic' }}
        />
      )}

      {/* Canvas */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={`w-full touch-none ${mode === 'draw' ? 'cursor-crosshair' : 'cursor-not-allowed'}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {mode === 'draw' ? 'Draw your signature above' : 'Type your legal name'}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearSignature}
          disabled={!hasSignature && !typedSignature}
        >
          <Eraser className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>

      {hasSignature && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <Check className="w-4 h-4" />
          <span>Signature captured</span>
        </div>
      )}
    </div>
  );
}
