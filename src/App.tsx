import React, { useState, useCallback } from 'react';
import { ThermographyImage } from './types';
import { FileUpload } from './components/FileUpload';
import { ImageGrid } from './components/ImageGrid';
import { AnalysisTable } from './components/AnalysisTable';
import { NormsTable } from './components/NormsTable';
import { analyzeThermographyImages } from './services/geminiService';
import { 
  Thermometer, 
  ShieldCheck, 
  Download, 
  Play, 
  Loader2, 
  CheckCircle2,
  Trash2,
  FileText,
  Settings,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function App() {
  const [images, setImages] = useState<ThermographyImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [machineName, setMachineName] = useState("");

  const handleFilesSelected = useCallback((files: File[]) => {
    const newImages: ThermographyImage[] = files.map((file, index) => {
      const photoNumber = images.length + index + 1;
      const name = machineName.trim() ? `${machineName.trim()}_${photoNumber}` : `Foto ${photoNumber}`;
      return {
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl: URL.createObjectURL(file),
        name
      };
    });
    setImages(prev => [...prev, ...newImages]);
    setHasAnalyzed(false);
  }, [images.length, machineName]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      return filtered.map((img, idx) => {
        const photoNumber = idx + 1;
        const name = machineName.trim() ? `${machineName.trim()}_${photoNumber}` : `Foto ${photoNumber}`;
        return { ...img, name };
      });
    });
    setHasAnalyzed(false);
  }, [machineName]);

  const clearAll = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setMachineName("");
    setHasAnalyzed(false);
  }, [images]);

  const runAnalysis = async () => {
    if (images.length === 0) return;
    if (!machineName.trim()) {
      alert("Por favor, identifique a máquina antes de iniciar a análise.");
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const response = await analyzeThermographyImages(images);
      
      setImages(prev => prev.map(img => {
        const analysisData = response.images.find(a => a.id === img.id);
        return analysisData ? { ...img, analysis: analysisData.analysis } : img;
      }));
      
      setHasAnalyzed(true);
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro durante a análise. Por favor, tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const folderName = machineName.trim() || "termografias";
    const folder = zip.folder(folderName);
    
    images.forEach((img) => {
      folder?.file(`${img.name}.jpg`, img.file);
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${folderName.toLowerCase().replace(/\s+/g, '_')}_analise.zip`);
  };

  const generatePDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    setIsAnalyzing(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // REMOVE ALL EXISTING STYLES to kill oklab/oklch references
          const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          styles.forEach(s => s.remove());

          // Inject a clean, HEX-only stylesheet for the report
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            
            * { 
              box-sizing: border-box;
              font-family: 'Inter', sans-serif;
              -webkit-print-color-adjust: exact;
            }
            
            body { background: #f8fafc; margin: 0; padding: 0; }
            
            .report-wrapper { 
              background: #f8fafc; 
              min-height: 100%;
              padding: 40px;
            }
            
            .report-container { 
              max-width: 1000px;
              margin: 0 auto;
              padding: 60px; 
              background: white; 
              box-shadow: 0 10px 25px rgba(0,0,0,0.05);
              border-radius: 8px;
            }
            
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .gap-2 { gap: 8px; }
            .gap-3 { gap: 12px; }
            .gap-4 { gap: 16px; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .mb-8 { margin-bottom: 32px; }
            .mb-12 { margin-bottom: 48px; }
            .mt-8 { margin-top: 32px; }
            .mt-12 { margin-top: 48px; }
            .pt-4 { padding-top: 16px; }
            .pt-8 { padding-top: 32px; }
            .pb-4 { padding-bottom: 16px; }
            .pb-8 { padding-bottom: 32px; }
            .border-t { border-top: 1px solid #e2e8f0; }
            .border-b { border-bottom: 1px solid #e2e8f0; }
            
            .pdf-header { 
              display: flex; 
              align-items: center; 
              justify-content: space-between; 
              margin-bottom: 60px; 
              padding-bottom: 30px; 
              border-bottom: 3px solid #059669;
            }
            
            .logo-text { font-size: 32px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }
            .logo-sub { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 4px; }
            
            .report-title-section { margin-bottom: 40px; }
            h2 { font-size: 32px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; }
            h3 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; }
            h4 { font-size: 18px; font-weight: 700; color: #065f46; margin: 0 0 8px 0; }
            
            .meta-info { font-size: 16px; color: #475569; line-height: 1.6; }
            .meta-info span { font-weight: 700; color: #0f172a; }
            
            .section-divider { height: 1px; background: #e2e8f0; margin: 40px 0; }
            
            .w-full { width: 100%; }
            .rounded-2xl { border-radius: 12px; }
            .rounded-3xl { border-radius: 16px; }
            .border { border: 1px solid #e2e8f0; }
            .bg-white { background-color: #ffffff; }
            .bg-zinc-50 { background-color: #f8fafc; }
            .bg-emerald-50 { background-color: #f0fdf4; }
            .border-emerald-100 { border-color: #dcfce7; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #e2e8f0; }
            th { padding: 16px 20px; background: #f8fafc; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 2px solid #e2e8f0; text-align: left; }
            td { padding: 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; line-height: 1.5; vertical-align: top; }
            tr:nth-child(even) { background-color: #fcfcfc; }
            
            .badge { display: inline-flex; align-items: center; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; border: 1px solid; text-transform: uppercase; white-space: nowrap; }
            .badge-ok { background: #f0fdf4; color: #166534; border-color: #dcfce7; }
            .badge-alerta { background: #fffbeb; color: #92400e; border-color: #fef3c7; }
            .badge-critico { background: #fef2f2; color: #991b1b; border-color: #fee2e2; }
            
            .report-image { width: 220px !important; height: 160px !important; border-radius: 10px; object-fit: cover; border: 1px solid #e2e8f0; }
            
            .font-mono { font-family: 'Courier New', Courier, monospace; font-weight: 700; }
            .text-sm { font-size: 15px; }
            .text-xs { font-size: 13px; }
            
            .overflow-x-auto { overflow: visible !important; }
            .no-pdf { display: none !important; }
          `;
          clonedDoc.head.appendChild(style);
          
          // Wrap the content in a professional container
          const reportContent = clonedDoc.getElementById('report-content');
          if (reportContent) {
            reportContent.className = 'report-container';
            
            const wrapper = clonedDoc.createElement('div');
            wrapper.className = 'report-wrapper';
            reportContent.parentNode?.insertBefore(wrapper, reportContent);
            wrapper.appendChild(reportContent);

            const header = clonedDoc.createElement('div');
            header.className = 'pdf-header';
            header.innerHTML = `
              <div>
                <div class="logo-text">SchottTermoScan</div>
                <div class="logo-sub">Intelligent Thermal Analysis System</div>
              </div>
              <div style="text-align: right">
                <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">RELATÓRIO TÉCNICO</p>
                <p style="font-size: 12px; color: #64748b">NBR 16818 / NBR 15572</p>
              </div>
            `;
            reportContent.insertBefore(header, reportContent.firstChild);
            
            // Add a divider after the title section
            const titleSection = reportContent.querySelector('.flex-col');
            if (titleSection) {
              const divider = clonedDoc.createElement('div');
              divider.className = 'section-divider';
              titleSection.parentNode?.insertBefore(divider, titleSection.nextSibling);
            }
          }

          // Apply manual classes to elements that need them in the clone
          const table = clonedDoc.querySelector('table');
          if (table) {
            table.querySelectorAll('tr').forEach(tr => {
              const statusCell = tr.cells[2];
              if (statusCell) {
                const badge = statusCell.querySelector('div');
                if (badge) {
                  const text = badge.textContent?.trim();
                  if (text === 'Conforme') badge.className = 'badge badge-ok';
                  if (text === 'Alerta') badge.className = 'badge badge-alerta';
                  if (text === 'Crítico') badge.className = 'badge badge-critico';
                }
              }
            });
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const fileName = machineName.trim() || "relatorio_termografia";
      pdf.save(`${fileName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-zinc-900">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2070")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%)'
        }}
      />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Thermometer className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 leading-tight">SchottTermoScan</h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Análise Industrial</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {images.length > 0 && (
              <button 
                onClick={clearAll}
                className="text-sm font-medium text-zinc-500 hover:text-rose-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Limpar Tudo</span>
              </button>
            )}
            <div className="h-6 w-px bg-zinc-200 hidden sm:block" />
            <div className="flex items-center gap-2 text-zinc-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-medium hidden sm:inline">Conformidade NBR 15572</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upload & Preview */}
          <div className="lg:col-span-12 space-y-8">
            
            <section className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-900">Nova Inspeção</h2>
                <p className="text-zinc-500">Faça o upload das imagens termográficas para iniciar a análise automática.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-zinc-900">Identificação do Ativo</h3>
                </div>
                <div>
                  <label htmlFor="machine-name" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Nome da Máquina / Equipamento
                  </label>
                  <input
                    id="machine-name"
                    type="text"
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                    placeholder="Ex: Motor Principal - Linha 01"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>
              
              <FileUpload onFilesSelected={handleFilesSelected} />
            </section>

            <AnimatePresence>
              {images.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                      Imagens Selecionadas
                      <span className="px-2 py-0.5 bg-zinc-200 rounded-full text-xs text-zinc-600">{images.length}</span>
                    </h3>
                    
                    {!hasAnalyzed && (
                      <button
                        onClick={runAnalysis}
                        disabled={isAnalyzing}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analisando...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 fill-current" />
                            Iniciar Análise AI
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <ImageGrid images={images} onRemove={removeImage} />
                </motion.section>
              )}
            </AnimatePresence>

            {/* Analysis Results */}
            <AnimatePresence>
              {hasAnalyzed && (
                <motion.section
                  id="report-content"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 pt-8 border-t border-zinc-200 bg-white p-8 rounded-3xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <h2 className="text-2xl font-bold text-zinc-900">Relatório de Inspeção</h2>
                      </div>
                      <p className="text-zinc-500">Equipamento: <span className="font-bold text-zinc-900">{machineName}</span></p>
                      <p className="text-zinc-500">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                    </div>

                    <div className="flex items-center gap-3 no-pdf">
                      <button
                        onClick={downloadAll}
                        className="flex-1 sm:flex-none bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <Download className="w-5 h-5" />
                        Baixar Todas
                      </button>
                      <button
                        onClick={generatePDF}
                        disabled={isAnalyzing}
                        className="flex-1 sm:flex-none bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                        Exportar PDF
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 mb-8">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-zinc-900">Referência Técnica</h3>
                      <p className="text-sm text-zinc-500">Critérios utilizados para a classificação automática de severidade conforme normas vigentes.</p>
                    </div>
                    <NormsTable />
                  </div>

                  <div className="pt-4 mb-8">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-zinc-900">Resultados da Análise</h3>
                      <p className="text-sm text-zinc-500">Detalhamento térmico por ponto de inspeção.</p>
                    </div>
                    <AnalysisTable images={images} />
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Thermometer className="w-5 h-5 text-zinc-400" />
            <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">SchottTermoScan v1.0</span>
          </div>
          <p className="text-sm text-zinc-500">
            Desenvolvido para excelência em manutenção preditiva e segurança industrial.
          </p>
        </div>
      </footer>
    </div>
  );
}
