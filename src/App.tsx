/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  ServicePage,
  UploadedDataCenterDoc,
  PresetSampleDoc,
  AnalysisTimeframe,
  AnalysisFocusArea,
  CustomAnalysisResult,
  PromptChatMessage,
  AidcProjectSpecs,
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

export default function App() {
  const [currentPage, setCurrentPage] = useState<ServicePage>('landing');
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDataCenterDoc[]>([]);
  const [analysisRequest, setAnalysisRequest] = useState<string>('');
  const [timeframe, setTimeframe] = useState<AnalysisTimeframe>('all');
  const [focusArea, setFocusArea] = useState<AnalysisFocusArea>('all');
  const [aidcSpecs, setAidcSpecs] = useState<AidcProjectSpecs>(INITIAL_AIDC_SPECS);
  const [analysisResult, setAnalysisResult] =
    useState<CustomAnalysisResult | null>(null);
  const [analysisRunKey, setAnalysisRunKey] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<PromptChatMessage[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    if (
      (page === 'analysis_loading' || page === 'dashboard_preview') &&
      uploadedDocs.length === 0
    ) {
      setUploadedDocs(getDefaultDocs());
    }
    if (page === 'analysis_loading') {
      setAnalysisRunKey((k) => k + 1);
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

  const handleClearDocs = () => {
    setUploadedDocs([]);
  };

  const handleStartAnalysis = () => {
    if (uploadedDocs.length === 0) return;
    setAnalysisRunKey((k) => k + 1);
    setCurrentPage('analysis_loading');
    scrollToTop();
  };

  const handleAnalysisComplete = useCallback(
    (result: CustomAnalysisResult | null) => {
      setAnalysisResult(result);
    },
    []
  );

  const handleProceedToDashboard = () => {
    setCurrentPage('dashboard_preview');
    scrollToTop();
  };

  const handleNewAnalysis = () => {
    setUploadedDocs([]);
    setAnalysisRequest('');
    setTimeframe('all');
    setFocusArea('all');
    setAidcSpecs(INITIAL_AIDC_SPECS);
    setAnalysisResult(null);
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
      setAnalysisRunKey((k) => k + 1);
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
              analysisRequest={analysisRequest}
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
                    analysisRequest={analysisRequest}
                    timeframe={timeframe}
                    focusArea={focusArea}
                    aidcSpecs={aidcSpecs}
                    onAddDocs={handleAddDocs}
                    onRemoveDoc={handleRemoveDoc}
                    onClearDocs={handleClearDocs}
                    onChangeAnalysisRequest={setAnalysisRequest}
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
                    analysisRequest={analysisRequest}
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
                    analysisRequest={analysisRequest}
                    timeframe={timeframe}
                    focusArea={focusArea}
                    aidcSpecs={aidcSpecs}
                    analysisResult={analysisResult}
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
