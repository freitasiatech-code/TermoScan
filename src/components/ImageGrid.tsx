import React from 'react';
import { ThermographyImage } from '../types';
import { X, Download } from 'lucide-react';

interface ImageGridProps {
  images: ThermographyImage[];
  onRemove: (id: string) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, onRemove }) => {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((img) => (
        <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
          <img 
            src={img.previewUrl} 
            alt={img.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
            <button
              onClick={() => onRemove(img.id)}
              className="p-2 bg-white/20 hover:bg-rose-500 rounded-full text-white transition-colors backdrop-blur-sm"
              title="Remover"
            >
              <X className="w-4 h-4" />
            </button>
            <a
              href={img.previewUrl}
              download={img.file.name}
              className="p-2 bg-white/20 hover:bg-emerald-500 rounded-full text-white transition-colors backdrop-blur-sm"
              title="Baixar"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{img.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
