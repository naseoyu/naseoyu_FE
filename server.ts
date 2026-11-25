import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function mapGeminiError(err: unknown): { status: number; message: string; code: string } {
  const rawMessage = err instanceof Error ? err.message : String(err);
  const lower = rawMessage.toLowerCase();

  if (lower.includes('403') || lower.includes('permission_denied') || lower.includes('api_key_invalid') || lower.includes('400')) {
    return {
      status: 400,
      code: 'API_KEY_ERROR',
      message: 'Gemini API 키가 유효하지 않거나 권한이 없습니다. Settings > Secrets 패널에서 GEMINI_API_KEY를 확인해 주세요.',
    };
  }
  if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota')) {
    return {
      status: 429,
      code: 'QUOTA_EXCEEDED',
      message: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.',
    };
  }
  if (lower.includes('404') || lower.includes('not_found')) {
    return {
      status: 404,
      code: 'MODEL_NOT_FOUND',
      message: `요청한 AI 모델(${MODEL_NAME})을 찾을 수 없습니다. 모델 구성을 확인해 주세요.`,
    };
  }

  return {
    status: 500,
    code: 'GEMINI_ERROR',
    message: `AI 분석 요청 처리 중 오류가 발생했습니다: ${rawMessage}`,
  };
}

interface IncomingDocPayload {
  id: string;
  name: string;
  sizeBytes: number;
  pageCount: number;
  sourceType: 'local_upload' | 'preset_sample';
  documentSummary?: string;
  base64Data?: string;
}

const CORE_TAXONOMY_CONTEXT = `
[데이터센터 11대 표준 비용 분석 체계]
1. 전력료 (사용량 연동 비용): IT 로드(GPU/서버) 및 공조 냉각 전력 소비량 연동 기본 전력비
2. 인터넷 전용 회선 서비스 (고정비): 백본망 연동 대역폭(100G/400G), BGP/IX 피어링 고정 이용료
3. 발전기 연료비 (사용량 연동 비용): 비상 디젤 발전기 비축 연료 및 시운전 연료비
4. 공업용수 및 냉각 비용 (사용량 연동 비용): 냉각탑 증발수, 블로우다운 보충수 및 냉각수 순환 처리 용수비
5. GPU 시스템 감가상각비 (자산 감가상각비): AI 가속기(GPU/NPU), HGX, InfiniBand 장비 감가상각(3~5년 정액법)
6. 데이터센터 구축 감가상각비 (자산 감가상각비): 건물 토목, 기초 골조, 하중 보강 및 외벽 구조물 상각
7. Fit-out 공사 감가상각비 (자산 감가상각비): 이중마루, 케이블 트레이, 격벽 밀폐 및 내부 인테리어 상각
8. 액체냉각 구축 감가상각비 (자산 감가상각비): CDU, QD 배관, 매니폴드 및 액침 수조 감가상각
9. 시설 운영 외주용역비 (고정비): 전기·기계·방재 24/7 상주 외주 전문 인력 용역비
10. NW 운영 외주용역비 (고정비): 스위칭 패브릭, 광케이블 라우팅, NOC 관제 외주 용역비
11. 수선유지비 (사용량 연동 비용): 건물/전원/환경/네트워크/제조사(OEM)/액체냉각 유지보수비

[조건부 입력 비용 원칙]
- 상수도 식수(수도세 인상률 연동), 정규직 인건비, 소모품비(미입력 시 임의 0원 추정 금지), 보험료, 세금과공과, 인증·검사 지급수수료(산정 제외 상태 구분)
`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      hasApiKey: Boolean(process.env.GEMINI_API_KEY?.trim()),
    });
  });

  app.post('/api/analyze', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        code: 'MISSING_API_KEY',
        error: 'GEMINI_API_KEY가 설정되지 않았습니다. Settings > Secrets 패널에서 API 키를 확인해 주세요.',
      });
    }

    try {
      const {
        documents = [],
        analysisRequest = '',
        timeframe = 'all',
        focusArea = 'all',
        aidcSpecs,
      } = req.body as {
        documents: IncomingDocPayload[];
        analysisRequest?: string;
        timeframe?: string;
        focusArea?: string;
        aidcSpecs?: {
          commencementDate?: string;
          usageDuration?: string;
          gpuSystemType?: string;
          gpuConfig?: string;
          gpuCoolingType?: string;
          storageCapacity?: string;
          storagePerGpuRequirement?: string;
          diaBandwidth?: string;
        };
      };

      if (!Array.isArray(documents) || documents.length === 0) {
        return res.status(400).json({
          code: 'NO_DOCUMENTS',
          error: '분석할 문서를 최소 1개 이상 선택하거나 업로드해 주세요.',
        });
      }

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      const docDescriptions = documents.map((doc, idx) => {
        if (doc.base64Data) {
          parts.push({
            inlineData: {
              mimeType: 'application/pdf',
              data: doc.base64Data,
            },
          });
        }
        return `- 문서 ${idx + 1}: ${doc.name} (유형: ${doc.sourceType === 'preset_sample' ? '표준 샘플 규격' : '사용자 업로드 PDF'}, 약 ${doc.pageCount}페이지, 용량 ${(doc.sizeBytes / (1024 * 1024)).toFixed(2)}MB)\n  요약/메타정보: ${doc.documentSummary || '업로드된 PDF 원본 참조'}`;
      });

      const specsBlock = aidcSpecs
        ? `
[사용자 입력 AIDC 인프라 및 운영 조건]
1. AIDC 사용 시점, GPU서버 가동 시점(Commencement date): ${aidcSpecs.commencementDate || '미입력'}
2. AIDC 사용 기간: ${aidcSpecs.usageDuration || '미입력'}
3. 사용하고자 하는 GPU System 종류: ${aidcSpecs.gpuSystemType || '미입력'}${aidcSpecs.gpuConfig || aidcSpecs.gpuCoolingType ? `\n   - GPU 구성 / 권장 냉각 방식: ${[aidcSpecs.gpuConfig, aidcSpecs.gpuCoolingType].filter(Boolean).join(', ')}` : ''}
4. Storage 구축 용량: ${aidcSpecs.storageCapacity || '미입력'}${aidcSpecs.storagePerGpuRequirement ? `\n   - GPU System 1개당 Storage 필요량: ${aidcSpecs.storagePerGpuRequirement}` : ''}
5. 사용하고자 하는 인터넷전용회선(DIA) Bandwidth: ${aidcSpecs.diaBandwidth || '미입력'}
`
        : '';

      const promptText = `
다음은 사용자가 업로드한 데이터센터 비용·운영 관련 문서 목록과 맞춤 분석 요청 사항입니다.

[업로드된 문서 목록 (${documents.length}건)]
${docDescriptions.join('\n')}
${specsBlock}
[사용자 맞춤 분석 요청 사항]
- 직접 입력 요청: "${analysisRequest.trim() || '업로드된 문서를 바탕으로 11대 표준 비용 항목 전반과 최적화 방안을 분석해줘'}"
- 선택된 분석 기간 조건: ${timeframe}
- 선택된 중점 영역 조건: ${focusArea}

${CORE_TAXONOMY_CONTEXT}

[지시사항]
1. 사용자의 요청 사항("${analysisRequest.trim() || '전체 표준 분석'}")과 기간/중점 조건을 최우선으로 반영하여 분석 결과를 생성하세요.
   - 예: 사용자가 "3년치만 분석해줘"라고 했다면 3년(36개월) 기간 관점에서 비용 추이, 감가상각/OPEX 영향, 3년 누적 시사점을 중심으로 작성하세요.
   - 예: 사용자가 "전력료 중점으로 분석해줘"라고 했다면 1번 전력료 및 4번 냉각 비용 중심으로 세부 분석과 절감 방안을 집중 배치하세요.
   - 문서가 여러 개인 경우 각 문서의 역할과 교차 분석 결과를 documentInsights에 명확히 정리하세요.
2. 데이터 무결성 원칙: 문서에 명시되지 않은 조건부 비용을 임의로 0원 처리하지 말고 미입력/검토 필요 항목은 명확히 구분하세요.
3. 모든 텍스트는 전문적인 한국어 엔터프라이즈 B2B FinOps 어조로 작성하세요.
`;

      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts },
        config: {
          systemInstruction:
            '당신은 AI 데이터센터 FinOps 및 인프라 비용 감사 전문가입니다. 사용자가 업로드한 복수의 문서와 구체적인 분석 요청 사항(예: 기간 한정, 특정 비용 항목 집중 분석, 문서 비교 등)을 정확히 반영해 구조화된 JSON 분석 결과를 반환하세요.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              appliedScopeLabel: {
                type: Type.STRING,
                description: '실제 적용된 분석 범위 요약 (예: "최근 3년(36개월) · 전력료 및 냉각 비용 중점")',
              },
              executiveSummary: {
                type: Type.STRING,
                description: '사용자 요청사항과 업로드 문서 내용을 반영한 3~4문장의 핵심 분석 요약',
              },
              keyMetrics: {
                type: Type.ARRAY,
                description: '사용자 요청에 맞춰 도출된 핵심 지표 3~4개',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.STRING },
                    context: { type: Type.STRING },
                  },
                  required: ['label', 'value', 'context'],
                },
              },
              highlightedItemNumbers: {
                type: Type.ARRAY,
                description: '사용자 요청과 가장 밀접한 11대 비용 항목 번호 목록 (1~11 사이의 정수)',
                items: { type: Type.INTEGER },
              },
              itemInsights: {
                type: Type.ARRAY,
                description: '주요 비용 항목별 맞춤 분석 코멘트',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    itemNumber: { type: Type.INTEGER },
                    focusNote: { type: Type.STRING },
                    priority: { type: Type.STRING, description: 'high, medium, normal 중 하나' },
                  },
                  required: ['itemNumber', 'focusNote', 'priority'],
                },
              },
              documentInsights: {
                type: Type.ARRAY,
                description: '업로드된 각 문서별 추출 역할 및 핵심 포인트',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    documentName: { type: Type.STRING },
                    detectedFocus: { type: Type.STRING },
                    keyFindings: { type: Type.STRING },
                  },
                  required: ['documentName', 'detectedFocus', 'keyFindings'],
                },
              },
              recommendations: {
                type: Type.ARRAY,
                description: '요청 조건에 맞춘 비용 최적화 실행 권고안 3~4개',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    impactEstimate: { type: Type.STRING },
                    actionDetail: { type: Type.STRING },
                  },
                  required: ['title', 'impactEstimate', 'actionDetail'],
                },
              },
            },
            required: [
              'appliedScopeLabel',
              'executiveSummary',
              'keyMetrics',
              'highlightedItemNumbers',
              'itemInsights',
              'documentInsights',
              'recommendations',
            ],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);

      return res.json({
        ...parsed,
        generatedAt: new Date().toISOString(),
        modelUsed: MODEL_NAME,
      });
    } catch (err) {
      console.error('[/api/analyze] Gemini error:', err);
      const mapped = mapGeminiError(err);
      return res.status(mapped.status).json({
        code: mapped.code,
        error: mapped.message,
      });
    }
  });

  app.post('/api/chat', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        code: 'MISSING_API_KEY',
        error: 'GEMINI_API_KEY가 설정되지 않았습니다. Settings > Secrets 패널에서 API 키를 확인해 주세요.',
      });
    }

    try {
      const {
        message,
        history = [],
        documents = [],
        analysisRequest = '',
        analysisResult = null,
        currentPage = 'upload',
        aidcSpecs,
      } = req.body as {
        message: string;
        history?: Array<{ role: 'user' | 'assistant'; content: string }>;
        documents?: IncomingDocPayload[];
        analysisRequest?: string;
        analysisResult?: Record<string, unknown> | null;
        currentPage?: string;
        aidcSpecs?: {
          commencementDate?: string;
          usageDuration?: string;
          gpuSystemType?: string;
          gpuConfig?: string;
          gpuCoolingType?: string;
          storageCapacity?: string;
          storagePerGpuRequirement?: string;
          diaBandwidth?: string;
        };
      };

      if (!message || !message.trim()) {
        return res.status(400).json({
          code: 'EMPTY_MESSAGE',
          error: '프롬프트 내용을 입력해 주세요.',
        });
      }

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      // Attach inline PDFs (limit total inline PDF attachments in chat to avoid huge payloads)
      let attachedPdfCount = 0;
      const docSummaryLines = (documents || []).map((d, idx) => {
        if (d.base64Data && attachedPdfCount < 3) {
          attachedPdfCount += 1;
          parts.push({
            inlineData: {
              mimeType: 'application/pdf',
              data: d.base64Data,
            },
          });
        }
        return `${idx + 1}. ${d.name} (${d.pageCount}p, ${d.documentSummary || '업로드 PDF'})`;
      });

      const historyText = history
        .slice(-8)
        .map((m) => `${m.role === 'user' ? '사용자' : '어시스턴트'}: ${m.content}`)
        .join('\n');

      const chatSpecsBlock = aidcSpecs
        ? `
- 사용자 입력 AIDC 조건:
  1) AIDC 사용 시점, GPU서버 가동 시점(Commencement date): ${aidcSpecs.commencementDate || '미입력'}
  2) AIDC 사용 기간: ${aidcSpecs.usageDuration || '미입력'}
  3) GPU System 종류: ${aidcSpecs.gpuSystemType || '미입력'}${aidcSpecs.gpuConfig || aidcSpecs.gpuCoolingType ? ` (GPU 구성 / 권장 냉각: ${[aidcSpecs.gpuConfig, aidcSpecs.gpuCoolingType].filter(Boolean).join(', ')})` : ''}
  4) Storage 구축 용량: ${aidcSpecs.storageCapacity || '미입력'}${aidcSpecs.storagePerGpuRequirement ? ` (GPU System 1개당 Storage 필요량: ${aidcSpecs.storagePerGpuRequirement})` : ''}
  5) 인터넷전용회선(DIA) Bandwidth: ${aidcSpecs.diaBandwidth || '미입력'}`
        : '';

      const contextText = `
[현재 워크스페이스 상태]
- 현재 화면: ${currentPage}
- 연결된 문서 (${documents.length}건):
${docSummaryLines.length > 0 ? docSummaryLines.join('\n') : '없음 (아직 문서가 업로드되지 않았습니다)'}
- 현재 설정된 분석 요청 사항: "${analysisRequest || '미입력'}"${chatSpecsBlock}
${analysisResult ? `- 현재 대시보드 분석 결과 요약: ${JSON.stringify(analysisResult).slice(0, 3000)}` : ''}

${CORE_TAXONOMY_CONTEXT}

${historyText ? `[이전 대화 내역]\n${historyText}\n` : ''}
[사용자 질문 / 요청]
${message.trim()}

실무 FinOps 전문가로서 간결하고 명확하게 한국어로 답변하세요. 표나 항목 번호가 필요하면 읽기 쉽게 정리하세요.
`;

      parts.push({ text: contextText });

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts },
        config: {
          systemInstruction:
            '당신은 AI Data Center Cost Intelligence 플랫폼의 상시 LLM 어시스턴트입니다. 사용자가 서류 업로드, LLM 분석, 비용 분석 결과 어느 단계에 있든 업로드된 문서와 11대 데이터센터 비용 체계를 바탕으로 즉시 분석·질의응답·요청사항 구체화를 도와줍니다. 확인되지 않은 수치를 임의로 지어내지 말고, 미입력 항목은 미입력으로 안내하세요.',
        },
      });

      return res.json({
        reply: (response.text ?? '').trim() || '응답을 생성하지 못했습니다. 다시 시도해 주세요.',
      });
    } catch (err) {
      console.error('[/api/chat] Gemini error:', err);
      const mapped = mapGeminiError(err);
      return res.status(mapped.status).json({
        code: mapped.code,
        error: mapped.message,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
