import React from 'react';
import { ThermographyImage } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Thermometer, Info } from 'lucide-react';
import { cn } from '../utils';

interface AnalysisTableProps {
  images: ThermographyImage[];
}

export const AnalysisTable: React.FC<AnalysisTableProps> = ({ images }) => {
  const analyzedImages = images.filter(img => img.analysis);

  if (analyzedImages.length === 0) return null;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-bottom border-zinc-200">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Identificação</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Temperatura</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Status</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Conformidade</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Recomendação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {analyzedImages.map((img) => (
              <tr key={img.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={img.previewUrl} 
                      alt={img.name} 
                      className="w-12 h-12 rounded-lg object-cover border border-zinc-100 report-image"
                    />
                    <span className="font-bold text-zinc-900">{img.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-zinc-900">
                    <Thermometer className="w-4 h-4 text-zinc-400" />
                    <span className="font-mono font-bold">{img.analysis?.temperatureFound}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={img.analysis?.status || 'OK'} />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-zinc-900 font-semibold max-w-xs">
                    {img.analysis?.normCompliance}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2 text-sm text-zinc-800 font-medium max-w-sm">
                    <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{img.analysis?.recommendation}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: 'OK' | 'ALERTA' | 'CRÍTICO' }> = ({ status }) => {
  const configs = {
    'OK': {
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
      label: "Conforme"
    },
    'ALERTA': {
      icon: AlertTriangle,
      className: "bg-amber-50 text-amber-700 border-amber-100",
      label: "Alerta"
    },
    'CRÍTICO': {
      icon: XCircle,
      className: "bg-rose-50 text-rose-700 border-rose-100",
      label: "Crítico"
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", config.className)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
};
