import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '../utils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, className }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer group",
        isDragging ? "border-emerald-500 bg-emerald-50/50" : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/50",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
      
      <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Upload className="w-8 h-8 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
      </div>
      
      <h3 className="text-lg font-medium text-zinc-900 mb-1">Anexar Imagens Termográficas</h3>
      <p className="text-sm text-zinc-500 text-center max-w-xs">
        Arraste e solte suas fotos aqui ou clique para selecionar do seu dispositivo.
      </p>
      
      <div className="mt-6 flex gap-2">
        <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-500">JPG</span>
        <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-500">PNG</span>
        <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-500">WEBP</span>
      </div>
    </div>
  );
};
