import { GoogleGenAI, Type } from "@google/genai";
import { ThermographyImage, AnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeThermographyImages(images: ThermographyImage[]): Promise<AnalysisResponse> {
  const model = "gemini-3-flash-preview";
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not defined in the environment.");
  }

  const imageParts = await Promise.all(
    images.map(async (img) => {
      const base64 = await fileToBase64(img.file);
      return {
        inlineData: {
          data: base64.split(",")[1],
          mimeType: img.file.type,
        },
      };
    })
  );

  const prompt = `
    Você é um especialista sênior em termografia industrial certificado Nível 3. 
    Sua tarefa é analisar as imagens termográficas fornecidas e gerar um relatório técnico preciso.

    CRITÉRIOS TÉCNICOS (NBR 16818 / NBR 15572):
    Utilize os seguintes limites de Máxima Temperatura Admissível (MTA) para classificar a severidade:
    - Fios encapados / Cabos isolados: 70°C
    - Régua de borne / Conexões: 70°C
    - Conexões e barramentos de baixa tensão: 90°C
    - Fusíveis (corpo): 100°C
    - Seccionadoras: 90°C
    - Transformadores a óleo (óleo): 65°C
    - Transformadores a óleo (núcleo): 80°C

    CLASSIFICAÇÃO DE STATUS:
    - OK: Temperatura abaixo da MTA.
    - ALERTA: Temperatura próxima da MTA (margem de segurança de 10°C).
    - CRÍTICO: Temperatura igual ou superior à MTA.

    INSTRUÇÕES DE RESPOSTA:
    1. Identifique a temperatura máxima em cada imagem.
    2. Compare com a MTA do componente identificado.
    3. Forneça uma descrição técnica do que foi observado.
    4. Forneça uma recomendação clara de manutenção.
    5. Retorne estritamente em formato JSON.
    6. Use o ID fornecido para cada imagem.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            ...images.flatMap((img, index) => [
              { text: `Analisar Imagem ID: ${img.id}` },
              imageParts[index]
            ])
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            images: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  analysis: {
                    type: Type.OBJECT,
                    properties: {
                      temperatureFound: { type: Type.STRING },
                      status: { type: Type.STRING, enum: ["OK", "ALERTA", "CRÍTICO"] },
                      normCompliance: { type: Type.STRING },
                      description: { type: Type.STRING },
                      recommendation: { type: Type.STRING },
                    },
                    required: ["temperatureFound", "status", "normCompliance", "description", "recommendation"],
                  },
                },
                required: ["id", "analysis"],
              },
            },
          },
          required: ["images"],
        },
      },
    });

    if (!response.text) {
      throw new Error("O modelo não retornou nenhum texto.");
    }

    return JSON.parse(response.text.trim()) as AnalysisResponse;
  } catch (error: any) {
    console.error("Erro detalhado na chamada do Gemini:", error);
    throw new Error(`Falha na análise: ${error.message || "Erro desconhecido"}`);
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
