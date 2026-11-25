/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ServicePage,
  UploadedDataCenterDoc,
  PresetSampleDoc,
  AnalysisTimeframe,
  AnalysisFocusArea,
  CustomAnalysisResult,
  PromptChatMessage,
  AidcProjectSpecs,
  AnalysisHistoryEntry,
  AdditionalAnalysisPayload,
} from './types';
import { SAMPLE_DATA_CENTER_PRESETS } from './data/costTaxonomyData';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { PromptSidebar } from './components/llm/PromptSidebar';
import { LandingPage } from './pages/LandingPage';
import { UploadPage } from './pages/UploadPage';
import { AnalysisLoadingPage } from './pages/AnalysisLoadingPage';
import { DashboardPreviewPage } from './pages/DashboardPreviewPage';

const INITIAL_AIDC_SPECS: AidcProjectSpecs = {
  commencementDate: '',
  usageDuration: '',
  gpuSystemType: '',
  storageCapacity: '',
  diaBandwidth: '',
};

const HISTORY_STORAGE_KEY = 'aidc_cost_analysis_history_v1';

function loadInitialHistory(): AnalysisHistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry, idx) => ({
      ...entry,
      sequenceNumber:
        typeof entry.sequenceNumber === 'number' ? entry.sequenceNumber : idx + 1,
      documents: Array.isArray(entry.documents)
        ? entry.documents.map((doc: UploadedDataCenterDoc) => ({
            ...doc,
            uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date(),
          }))
        : [],
    }));
  } catch {
    return [];
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<ServicePage>('landing');
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDataCenterDoc[]>([]);
  const [analysisTitle, setAnalysisTitle] = useState<string>('');
  const [analysisRequest, setAnalysisRequest] = useState<string>('');
  const [requestMemo, setRequestMemo] = useState<string>('');
  const [timeframe, setTimeframe] = useState<AnalysisTimeframe>('all');
  const [focusArea, setFocusArea] = useState<AnalysisFocusArea>('all');
  const [aidcSpecs, setAidcSpecs] = useState<AidcProjectSpecs>(INITIAL_AIDC_SPECS);
  const [analysisResult, setAnalysisResult] =
    useState<CustomAnalysisResult | null>(null);
  const [analysisRunKey, setAnalysisRunKey] = useState<number>(() => Date.now());
  const [isAdditionalRun, setIsAdditionalRun] = useState<boolean>(false);
  const [addedDocCount, setAddedDocCount] = useState<number>(0);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryEntry[]>(
    loadInitialHistory
  );
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(() => {
    const loaded = loadInitialHistory();
    return loaded.length > 0 ? loaded[loaded.length - 1].id : null;
  });
  const [chatMessages, setChatMessages] = useState<PromptChatMessage[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastSyncedRunKeyRef = useRef<number | null>(null);

  useEffect(() => {
    const matched = analysisHistory.find((e) => e.runKey === analysisRunKey);
    if (matched && lastSyncedRunKeyRef.current !== analysisRunKey) {
      lastSyncedRunKeyRef.current = analysisRunKey;
      setActiveHistoryId(matched.id);
    }
  }, [analysisHistory, analysisRunKey]);

  useEffect(() => {
    try {
      const compactHistory = analysisHistory.map((entry) => ({
        ...entry,
        documents: entry.documents.map(({ base64Data: _omit, ...rest }) => rest),
      }));
      window.localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(compactHistory.slice(-30))
      );
    } catch {
      // Ignore storage quota errors safely
    }
  }, [analysisHistory]);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDefaultDocs = (): UploadedDataCenterDoc[] => {
    const preset = SAMPLE_DATA_CENTER_PRESETS[0];
    return [
      {
        id: preset.id,
        name: preset.name,
        sizeBytes: preset.fileSizeBytes,
        uploadedAt: new Date(),
        pageCount: preset.pageCount,
        sourceType: 'preset_sample',
        documentSummary: preset.summary,
      },
    ];
  };

  const handleNavigate = (page: ServicePage) => {
    if (page === 'dashboard_preview') {
      if (uploadedDocs.length === 0 && analysisHistory.length > 0) {
        const latest = analysisHistory[analysisHistory.length - 1];
        setUploadedDocs(latest.documents);
        setAnalysisTitle(latest.title);
        setRequestMemo(latest.memo);
        setAnalysisRequest(latest.analysisRequest);
        setTimeframe(latest.timeframe);
        setFocusArea(latest.focusArea);
        setAidcSpecs(latest.aidcSpecs);
        setAnalysisResult(latest.result);
        setActiveHistoryId(latest.id);
      } else {
        const docsToSave = uploadedDocs.length > 0 ? uploadedDocs : getDefaultDocs();
        if (uploadedDocs.length === 0) {
          setUploadedDocs(docsToSave);
        }
        const alreadyRecorded = analysisHistory.some(
          (e) => e.id === activeHistoryId || e.runKey === analysisRunKey
        );
        if (!alreadyRecorded) {
          setAnalysisHistory((prev) => {
            if (prev.some((e) => e.runKey === analysisRunKey)) return prev;
            const nextSequence =
              prev.length > 0
                ? Math.max(...prev.map((e) => e.sequenceNumber)) + 1
                : 1;
            const seqLabel = String(nextSequence).padStart(3, '0');
            const resolvedTitle =
              analysisTitle.trim() ||
              (docsToSave[0]?.name
                ? `${docsToSave[0].name} 분석`
                : `데이터센터 비용 분석 #${seqLabel}`);
            const entry: AnalysisHistoryEntry = {
              id: `hist-${analysisRunKey}-${nextSequence}`,
              runKey: analysisRunKey,
              sequenceNumber: nextSequence,
              title: resolvedTitle,
              memo: requestMemo.trim(),
              analysisRequest: analysisRequest.trim(),
              timeframe,
              focusArea,
              aidcSpecs: { ...aidcSpecs },
              documents: docsToSave.map((d) => ({ ...d })),
              result: analysisResult,
              createdAt: new Date().toISOString(),
              isAdditional: false,
            };
            return [...prev, entry];
          });
        }
      }
    } else if (page === 'analysis_loading') {
      if (uploadedDocs.length === 0) {
        setUploadedDocs(getDefaultDocs());
      }
      setIsAdditionalRun(false);
      setAddedDocCount(0);
      setAnalysisRunKey((k) => Math.max(k + 1, Date.now()));
    }
    setCurrentPage(page);
    scrollToTop();
  };

  const handleStartUpload = () => {
    setCurrentPage('upload');
    scrollToTop();
  };

  const handleSelectPreset = (preset: PresetSampleDoc) => {
    const doc: UploadedDataCenterDoc = {
      id: preset.id,
      name: preset.name,
      sizeBytes: preset.fileSizeBytes,
      uploadedAt: new Date(),
      pageCount: preset.pageCount,
      sourceType: 'preset_sample',
      documentSummary: preset.summary,
    };
    setUploadedDocs((prev) => {
      if (prev.some((d) => d.id === doc.id)) return prev;
      return [...prev, doc];
    });
    setCurrentPage('upload');
    scrollToTop();
  };

  const handleAddDocs = (docs: UploadedDataCenterDoc[]) => {
    setUploadedDocs((prev) => [...prev, ...docs]);
  };

  const handleRemoveDoc = (docId: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleUpdateDocTitle = (
    docId: string,
    newTitle: string,
    isCustomTitle = true
  ) => {
    setUploadedDocs((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              name: newTitle,
              isCustomTitle,
            }
          : d
      )
    );
  };

  const handleClearDocs = () => {
    setUploadedDocs([]);
  };

  const handleStartAnalysis = () => {
    if (uploadedDocs.length === 0) return;
    setIsAdditionalRun(false);
    setAddedDocCount(0);
    setAnalysisRunKey((k) => Math.max(k + 1, Date.now()));
    setCurrentPage('analysis_loading');
    scrollToTop();
  };

  const handleStartAdditionalAnalysis = (payload: AdditionalAnalysisPayload) => {
    const baseDocs = uploadedDocs.length > 0 ? uploadedDocs : getDefaultDocs();
    const mergedDocs = payload.includeExistingDocs
      ? [
          ...baseDocs,
          ...payload.newDocs.filter(
            (nd) => !baseDocs.some((existing) => existing.id === nd.id)
          ),
        ]
      : [...payload.newDocs];

    if (mergedDocs.length === 0) return;

    // Ensure the initial/baseline analysis is recorded in history before launching the additional run
    const hasBaselineInHistory = analysisHistory.some(
      (e) => e.id === activeHistoryId || e.runKey === analysisRunKey
    );
    if (!hasBaselineInHistory) {
      setAnalysisHistory((prev) => {
        if (prev.some((e) => e.runKey === analysisRunKey)) return prev;
        const baseSeq =
          prev.length > 0 ? Math.max(...prev.map((e) => e.sequenceNumber)) + 1 : 1;
        const baseSeqLabel = String(baseSeq).padStart(3, '0');
        const baseTitle =
          analysisTitle.trim() ||
          (baseDocs[0]?.name
            ? `${baseDocs[0].name} 분석`
            : `데이터센터 비용 분석 #${baseSeqLabel}`);
        const baselineEntry: AnalysisHistoryEntry = {
          id: `hist-${analysisRunKey}-${baseSeq}`,
          runKey: analysisRunKey,
          sequenceNumber: baseSeq,
          title: baseTitle,
          memo: requestMemo.trim(),
          analysisRequest: analysisRequest.trim(),
          timeframe,
          focusArea,
          aidcSpecs: { ...aidcSpecs },
          documents: baseDocs.map((d) => ({ ...d })),
          result: analysisResult,
          createdAt: new Date().toISOString(),
          isAdditional: false,
        };
        return [...prev, baselineEntry];
      });
    }

    const nextSeqNum =
      (analysisHistory[analysisHistory.length - 1]?.sequenceNumber ??
        analysisHistory.length) +
      (hasBaselineInHistory ? 1 : 2);
    const nextTitle =
      payload.title.trim() ||
      `추가 비용 분석 #${String(nextSeqNum).padStart(3, '0')}`;
    const nextMemo = payload.memo.trim();
    const nextRequest =
      payload.request.trim() ||
      nextMemo ||
      analysisRequest.trim() ||
      '추가 업로드한 서류를 기존 분석 내역과 통합하여 비용 변화 및 최적화 방안을 분석해줘';

    setUploadedDocs(mergedDocs);
    setAnalysisTitle(nextTitle);
    setRequestMemo(nextMemo);
    setAnalysisRequest(nextRequest);
    setIsAdditionalRun(true);
    setAddedDocCount(payload.newDocs.length);
    setAnalysisRunKey((k) => Math.max(k + 1, Date.now()));
    setCurrentPage('analysis_loading');
    scrollToTop();
  };

  const handleAnalysisComplete = useCallback(
    (result: CustomAnalysisResult | null) => {
      setAnalysisResult(result);

      const snapshotDocs = uploadedDocs.length > 0 ? uploadedDocs : getDefaultDocs();

      setAnalysisHistory((prev) => {
        const existingIndex = prev.findIndex((item) => item.runKey === analysisRunKey);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            result,
          };
          return updated;
        }

        const nextSequence =
          prev.length > 0
            ? Math.max(...prev.map((e) => e.sequenceNumber)) + 1
            : 1;
        const seqLabel = String(nextSequence).padStart(3, '0');
        const resolvedTitle =
          analysisTitle.trim() ||
          (snapshotDocs[0]?.name
            ? `${snapshotDocs[0].name} 분석`
            : `데이터센터 비용 분석 #${seqLabel}`);

        const newEntry: AnalysisHistoryEntry = {
          id: `hist-${analysisRunKey}-${nextSequence}`,
          runKey: analysisRunKey,
          sequenceNumber: nextSequence,
          title: resolvedTitle,
          memo: requestMemo.trim(),
          analysisRequest: analysisRequest.trim(),
          timeframe,
          focusArea,
          aidcSpecs: { ...aidcSpecs },
          documents: snapshotDocs.map((d) => ({ ...d })),
          result,
          createdAt: new Date().toISOString(),
          isAdditional: isAdditionalRun,
          addedDocCount: isAdditionalRun ? addedDocCount : undefined,
        };

        return [...prev, newEntry];
      });
    },
    [
      analysisRunKey,
      uploadedDocs,
      analysisTitle,
      requestMemo,
      analysisRequest,
      timeframe,
      focusArea,
      aidcSpecs,
      isAdditionalRun,
      addedDocCount,
    ]
  );

  const handleProceedToDashboard = () => {
    const snapshotDocs = uploadedDocs.length > 0 ? uploadedDocs : getDefaultDocs();
    const alreadyRecorded = analysisHistory.some(
      (e) => e.runKey === analysisRunKey || e.id === activeHistoryId
    );
    if (!alreadyRecorded) {
      setAnalysisHistory((prev) => {
        if (prev.some((e) => e.runKey === analysisRunKey)) return prev;
        const nextSequence =
          prev.length > 0
            ? Math.max(...prev.map((e) => e.sequenceNumber)) + 1
            : 1;
        const seqLabel = String(nextSequence).padStart(3, '0');
        const resolvedTitle =
          analysisTitle.trim() ||
          (snapshotDocs[0]?.name
            ? `${snapshotDocs[0].name} 분석`
            : `데이터센터 비용 분석 #${seqLabel}`);
        const newEntry: AnalysisHistoryEntry = {
          id: `hist-${analysisRunKey}-${nextSequence}`,
          runKey: analysisRunKey,
          sequenceNumber: nextSequence,
          title: resolvedTitle,
          memo: requestMemo.trim(),
          analysisRequest: analysisRequest.trim(),
          timeframe,
          focusArea,
          aidcSpecs: { ...aidcSpecs },
          documents: snapshotDocs.map((d) => ({ ...d })),
          result: analysisResult,
          createdAt: new Date().toISOString(),
          isAdditional: isAdditionalRun,
          addedDocCount: isAdditionalRun ? addedDocCount : undefined,
        };
        return [...prev, newEntry];
      });
    }
    setCurrentPage('dashboard_preview');
    scrollToTop();
  };

  const handleSelectHistoryEntry = (entryId: string) => {
    const entry = analysisHistory.find((e) => e.id === entryId);
    if (!entry) return;
    setUploadedDocs(entry.documents);
    setAnalysisTitle(entry.title);
    setRequestMemo(entry.memo);
    setAnalysisRequest(entry.analysisRequest);
    setTimeframe(entry.timeframe);
    setFocusArea(entry.focusArea);
    setAidcSpecs(entry.aidcSpecs);
    setAnalysisResult(entry.result);
    setActiveHistoryId(entry.id);
    setIsAdditionalRun(Boolean(entry.isAdditional));
    setAddedDocCount(entry.addedDocCount ?? 0);
    scrollToTop();
  };

  const handleDeleteHistoryEntry = (entryId: string) => {
    setAnalysisHistory((prev) => {
      const remaining = prev.filter((e) => e.id !== entryId);
      if (activeHistoryId === entryId) {
        const fallback = remaining[remaining.length - 1] ?? null;
        if (fallback) {
          setUploadedDocs(fallback.documents);
          setAnalysisTitle(fallback.title);
          setRequestMemo(fallback.memo);
          setAnalysisRequest(fallback.analysisRequest);
          setTimeframe(fallback.timeframe);
          setFocusArea(fallback.focusArea);
          setAidcSpecs(fallback.aidcSpecs);
          setAnalysisResult(fallback.result);
          setActiveHistoryId(fallback.id);
        } else {
          setActiveHistoryId(null);
        }
      }
      return remaining;
    });
  };

  const handleNewAnalysis = () => {
    setUploadedDocs([]);
    setAnalysisTitle('');
    setAnalysisRequest('');
    setRequestMemo('');
    setTimeframe('all');
    setFocusArea('all');
    setAidcSpecs(INITIAL_AIDC_SPECS);
    setAnalysisResult(null);
    setActiveHistoryId(null);
    setIsAdditionalRun(false);
    setAddedDocCount(0);
    setAnalysisRunKey((k) => Math.max(k + 1, Date.now()));
    setCurrentPage('upload');
    scrollToTop();
  };

  const handleAddChatMessage = (msg: PromptChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  };

  const handleClearChatMessages = () => {
    setChatMessages([]);
  };

  const handleApplyRequestFromSidebar = (
    requestText: string,
    runAnalysis = false
  ) => {
    setAnalysisRequest(requestText);

    if (requestText.includes('3년')) setTimeframe('3y');
    else if (requestText.includes('1년')) setTimeframe('1y');
    else if (requestText.includes('5년')) setTimeframe('5y');

    if (requestText.includes('전력')) setFocusArea('power');
    else if (requestText.includes('감가상각')) setFocusArea('depreciation');
    else if (requestText.includes('OPEX') || requestText.includes('운영비'))
      setFocusArea('opex_only');
    else if (
      requestText.includes('수선') ||
      requestText.includes('유지보수') ||
      requestText.includes('외주')
    )
      setFocusArea('maintenance');

    if (runAnalysis && uploadedDocs.length > 0) {
      setIsAdditionalRun(false);
      setAddedDocCount(0);
      setAnalysisRunKey((k) => Math.max(k + 1, Date.now()));
      setCurrentPage('analysis_loading');
      scrollToTop();
    }
  };

  const showPromptSidebar =
    currentPage === 'upload' ||
    currentPage === 'analysis_loading' ||
    currentPage === 'dashboard_preview';

  const activeDocs =
    uploadedDocs.length > 0 ? uploadedDocs : getDefaultDocs();

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-slate-50 text-[#172033] font-sans antialiased">
      {/* Unified Enterprise Header (Pinned at top) */}
      <div className="shrink-0">
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          uploadedCount={uploadedDocs.length}
        />
      </div>

      {/* Main Content Area locked to remaining viewport height */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {currentPage === 'landing' && (
          <div
            ref={scrollContainerRef}
            className="flex-1 min-h-0 overflow-y-auto flex flex-col"
          >
            <div className="flex-1">
              <LandingPage
                onStartUpload={handleStartUpload}
                onSelectPreset={handleSelectPreset}
              />
            </div>
            <Footer />
          </div>
        )}

        {showPromptSidebar && (
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
            <PromptSidebar
              currentPage={currentPage}
              uploadedDocs={uploadedDocs}
              analysisTitle={analysisTitle}
              analysisRequest={analysisRequest}
              requestMemo={requestMemo}
              aidcSpecs={aidcSpecs}
              analysisResult={analysisResult}
              messages={chatMessages}
              onAddMessage={handleAddChatMessage}
              onClearMessages={handleClearChatMessages}
              onApplyRequest={handleApplyRequestFromSidebar}
            />

            <div
              ref={scrollContainerRef}
              className="flex-1 min-w-0 min-h-0 overflow-y-auto flex flex-col"
            >
              <div className="flex-1">
                {currentPage === 'upload' && (
                  <UploadPage
                    uploadedDocs={uploadedDocs}
                    analysisTitle={analysisTitle}
                    analysisRequest={analysisRequest}
                    requestMemo={requestMemo}
                    timeframe={timeframe}
                    focusArea={focusArea}
                    aidcSpecs={aidcSpecs}
                    chatMessages={chatMessages}
                    onAddDocs={handleAddDocs}
                    onRemoveDoc={handleRemoveDoc}
                    onUpdateDocTitle={handleUpdateDocTitle}
                    onClearDocs={handleClearDocs}
                    onChangeAnalysisTitle={setAnalysisTitle}
                    onChangeAnalysisRequest={setAnalysisRequest}
                    onChangeRequestMemo={setRequestMemo}
                    onChangeTimeframe={setTimeframe}
                    onChangeFocusArea={setFocusArea}
                    onChangeAidcSpecs={setAidcSpecs}
                    onStartAnalysis={handleStartAnalysis}
                    onBackToLanding={() => handleNavigate('landing')}
                  />
                )}

                {currentPage === 'analysis_loading' && (
                  <AnalysisLoadingPage
                    uploadedDocs={activeDocs}
                    analysisTitle={analysisTitle}
                    isAdditionalRun={isAdditionalRun}
                    addedDocCount={addedDocCount}
                    analysisRequest={analysisRequest}
                    requestMemo={requestMemo}
                    timeframe={timeframe}
                    focusArea={focusArea}
                    aidcSpecs={aidcSpecs}
                    analysisRunKey={analysisRunKey}
                    onAnalysisComplete={handleAnalysisComplete}
                    onProceedToDashboard={handleProceedToDashboard}
                    onBackToUpload={() => handleNavigate('upload')}
                  />
                )}

                {currentPage === 'dashboard_preview' && (
                  <DashboardPreviewPage
                    uploadedDocs={activeDocs}
                    analysisTitle={analysisTitle}
                    analysisRequest={analysisRequest}
                    requestMemo={requestMemo}
                    timeframe={timeframe}
                    focusArea={focusArea}
                    aidcSpecs={aidcSpecs}
                    analysisResult={analysisResult}
                    analysisHistory={analysisHistory}
                    activeHistoryId={activeHistoryId}
                    onSelectHistoryEntry={handleSelectHistoryEntry}
                    onDeleteHistoryEntry={handleDeleteHistoryEntry}
                    onStartAdditionalAnalysis={handleStartAdditionalAnalysis}
                    onNewAnalysis={handleNewAnalysis}
                    onEditRequest={() => handleNavigate('upload')}
                  />
                )}
              </div>

              <Footer />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
