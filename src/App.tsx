/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import {
  ServicePage,
  UploadedDataCenterDoc,
  PresetSampleDoc,
  AnalysisTimeframe,
  AnalysisFocusArea,
  CustomAnalysisResult,
  PromptChatMessage,
} from './types';
import { SAMPLE_DATA_CENTER_PRESETS } from './data/costTaxonomyData';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { PromptSidebar } from './components/llm/PromptSidebar';
import { LandingPage } from './pages/LandingPage';
import { UploadPage } from './pages/UploadPage';
import { AnalysisLoadingPage } from './pages/AnalysisLoadingPage';
import { DashboardPreviewPage } from './pages/DashboardPreviewPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<ServicePage>('landing');
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDataCenterDoc[]>([]);
  const [analysisRequest, setAnalysisRequest] = useState<string>('');
  const [timeframe, setTimeframe] = useState<AnalysisTimeframe>('all');
  const [focusArea, setFocusArea] = useState<AnalysisFocusArea>('all');
  const [analysisResult, setAnalysisResult] =
    useState<CustomAnalysisResult | null>(null);
  const [analysisRunKey, setAnalysisRunKey] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<PromptChatMessage[]>([]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartUpload = () => {
    setCurrentPage('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysisComplete = useCallback(
    (result: CustomAnalysisResult | null) => {
      setAnalysisResult(result);
    },
    []
  );

  const handleProceedToDashboard = () => {
    setCurrentPage('dashboard_preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewAnalysis = () => {
    setUploadedDocs([]);
    setAnalysisRequest('');
    setTimeframe('all');
    setFocusArea('all');
    setAnalysisResult(null);
    setCurrentPage('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    else if (requestText.includes('수선') || requestText.includes('유지보수') || requestText.includes('외주'))
      setFocusArea('maintenance');

    if (runAnalysis && uploadedDocs.length > 0) {
      setAnalysisRunKey((k) => k + 1);
      setCurrentPage('analysis_loading');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const showPromptSidebar =
    currentPage === 'upload' ||
    currentPage === 'analysis_loading' ||
    currentPage === 'dashboard_preview';

  const activeDocs =
    uploadedDocs.length > 0 ? uploadedDocs : getDefaultDocs();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-[#172033] font-sans antialiased">
      {/* Unified Enterprise Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        uploadedCount={uploadedDocs.length}
      />

      {/* Main Content Area (Persistent Left LLM Prompt Sidebar on Upload / Analysis / Dashboard) */}
      <main className="flex-1 flex flex-col">
        {currentPage === 'landing' && (
          <LandingPage
            onStartUpload={handleStartUpload}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {showPromptSidebar && (
          <div className="flex-1 flex flex-col lg:flex-row">
            <PromptSidebar
              currentPage={currentPage}
              uploadedDocs={uploadedDocs}
              analysisRequest={analysisRequest}
              analysisResult={analysisResult}
              messages={chatMessages}
              onAddMessage={handleAddChatMessage}
              onClearMessages={handleClearChatMessages}
              onApplyRequest={handleApplyRequestFromSidebar}
            />

            <div className="flex-1 min-w-0">
              {currentPage === 'upload' && (
                <UploadPage
                  uploadedDocs={uploadedDocs}
                  analysisRequest={analysisRequest}
                  timeframe={timeframe}
                  focusArea={focusArea}
                  onAddDocs={handleAddDocs}
                  onRemoveDoc={handleRemoveDoc}
                  onClearDocs={handleClearDocs}
                  onChangeAnalysisRequest={setAnalysisRequest}
                  onChangeTimeframe={setTimeframe}
                  onChangeFocusArea={setFocusArea}
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
                  analysisResult={analysisResult}
                  onNewAnalysis={handleNewAnalysis}
                  onEditRequest={() => handleNavigate('upload')}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Unified Enterprise Footer */}
      <Footer />
    </div>
  );
}
