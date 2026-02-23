export interface ThermographyImage {
  id: string;
  file: File;
  previewUrl: string;
  name: string; // e.g., "Foto 1"
  analysis?: ThermographyAnalysis;
}

export interface ThermographyAnalysis {
  temperatureFound: string;
  status: 'OK' | 'ALERTA' | 'CRÍTICO';
  normCompliance: string;
  description: string;
  recommendation: string;
}

export interface AnalysisResponse {
  images: {
    id: string;
    analysis: ThermographyAnalysis;
  }[];
}
