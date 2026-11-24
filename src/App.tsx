/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ServicePage, UploadedDataCenterDoc, PresetSampleDoc } from './types';
import { SAMPLE_DATA_CENTER_PRESETS } from './data/costTaxonomyData';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingPage } from './pages/LandingPage';
import { UploadPage } from './pages/UploadPage';
import { AnalysisLoadingPage } from './pages/AnalysisLoadingPage';
import { DashboardPreviewPage } from './pages/DashboardPreviewPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<ServicePage>('landing');
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDataCenterDoc | null>(null);

  // Fallback default sample document if navigating directly without an uploaded file
  const getDefaultDoc = (): UploadedDataCenterDoc => {
    const preset = SAMPLE_DATA_CENTER_PRESETS[0];
    return {
      id: preset.id,
      name: preset.name,
      sizeBytes: preset.fileSizeBytes,
      uploadedAt: new Date(),
      pageCount: preset.pageCount,
      sourceType: 'preset_sample',
      documentSummary: preset.summary,
    };
  };

  const handleNavigate = (page: ServicePage) => {
    // If user jumps straight to analysis or dashboard preview without selecting a file, auto-set default preset
    if ((page === 'analysis_loading' || page === 'dashboard_preview') && !uploadedDoc) {
      setUploadedDoc(getDefaultDoc());
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
    setUploadedDoc(doc);
    setCurrentPage('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadDoc = (doc: UploadedDataCenterDoc) => {
    setUploadedDoc(doc);
  };

  const handleRemoveDoc = () => {
    setUploadedDoc(null);
  };

  const handleStartAnalysis = () => {
    if (!uploadedDoc) return;
    setCurrentPage('analysis_loading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToDashboard = () => {
    setCurrentPage('dashboard_preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewAnalysis = () => {
    setUploadedDoc(null);
    setCurrentPage('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-[#172033] font-sans antialiased">
      {/* Unified Enterprise Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        uploadedFileName={uploadedDoc?.name}
      />

      {/* Main Pages Router */}
      <main className="flex-1 flex flex-col">
        {currentPage === 'landing' && (
          <LandingPage
            onStartUpload={handleStartUpload}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {currentPage === 'upload' && (
          <UploadPage
            uploadedDoc={uploadedDoc}
            onUploadDoc={handleUploadDoc}
            onRemoveDoc={handleRemoveDoc}
            onStartAnalysis={handleStartAnalysis}
            onBackToLanding={() => handleNavigate('landing')}
          />
        )}

        {currentPage === 'analysis_loading' && (
          <AnalysisLoadingPage
            uploadedDoc={uploadedDoc || getDefaultDoc()}
            onProceedToDashboard={handleProceedToDashboard}
            onBackToUpload={() => handleNavigate('upload')}
          />
        )}

        {currentPage === 'dashboard_preview' && (
          <DashboardPreviewPage
            uploadedDoc={uploadedDoc || getDefaultDoc()}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </main>

      {/* Unified Enterprise Footer */}
      <Footer />
    </div>
  );
}
