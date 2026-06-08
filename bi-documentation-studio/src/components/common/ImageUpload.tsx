import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@utils/cn';

interface ImageUploadProps {
  label?:     string;
  previewSrc?: string | null;
  onChange?:  (file: File) => void;
  onRemove?:  () => void;
  className?: string;
}

export function ImageUpload({ label, previewSrc, onChange, onRemove, className }: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (file.type.startsWith('image/')) onChange?.(file);
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}

      {previewSrc ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <img src={previewSrc} alt="Captura" className="w-full h-48 object-cover" />
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow text-slate-600 hover:text-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <label
          className={cn(
            'flex flex-col items-center justify-center h-36 rounded-lg border-2 border-dashed cursor-pointer transition-colors',
            dragging ? 'border-brand-400 bg-brand-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50',
          )}
          onDragOver={(e) => { e.preventDefault(); setDragging(true);  }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e)  => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
        >
          <input type="file" accept="image/png,image/jpeg,image/jpg" className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <Upload size={20} className="text-slate-400 mb-2" />
          <p className="text-sm text-slate-500">Arraste ou clique para enviar</p>
          <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, JPEG</p>
        </label>
      )}
    </div>
  );
}