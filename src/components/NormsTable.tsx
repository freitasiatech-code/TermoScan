import React from 'react';
import { Info } from 'lucide-react';

export const NormsTable: React.FC = () => {
  const norms = [
    { component: "Fios encapados", mta: "70°C" },
    { component: "Régua de borne", mta: "70°C" },
    { component: "Cabos isolados até 15 KV", mta: "70°C" },
    { component: "Conexões mediante parafusos", mta: "90°C" },
    { component: "Conexões e barramentos de baixa tensão", mta: "90°C" },
    { component: "Conexões de linha de transmissão aérea", mta: "70°C" },
    { component: "Conexões recobertas de prata ou níquel", mta: "90°C" },
    { component: "Fusíveis (corpo)", mta: "100°C" },
    { component: "Seccionadoras", mta: "90°C" },
    { component: "Conexões", mta: "90°C" },
    { component: "Transformadores a óleo - ponto mais quente (núcleo)", mta: "80°C" },
    { component: "Transformadores a óleo (óleo)", mta: "65°C" },
    { component: "Transformadores a seco", mta: "115°C a 150°C*" },
  ];

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200 flex items-center gap-2">
        <Info className="w-5 h-5 text-emerald-600" />
        <h3 className="font-bold text-zinc-900">Máxima Temperatura Admissível (MTA) - NBR 16818</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 border-b border-zinc-200">
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Componente / Conexão</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-right">MTA (°C)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {norms.map((item, index) => (
              <tr key={index} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-3 text-sm text-zinc-900 font-bold">{item.component}</td>
                <td className="px-6 py-3 text-sm font-mono text-zinc-900 text-right font-bold">{item.mta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-zinc-50 px-6 py-3 border-t border-zinc-200">
        <p className="text-[10px] text-zinc-400 italic">
          * De acordo com a classe de isolação do transformador em questão. Referência: NBR 16818 e dados de fabricantes.
        </p>
      </div>
    </div>
  );
};
