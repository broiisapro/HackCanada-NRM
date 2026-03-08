'use client';

import { useAppContext } from '../../context/app-context';
import { UploadTab } from '../../components/dashboard-ui';
import { AppLayoutHeader } from '../../components/app-layout-header';

export default function UploadPage() {
  const {
    uploadFile,
    setUploadFile,
    analyzing,
    uploadResult,
    handleAnalyze,
    hasAnalyzed,
  } = useAppContext();

  const handleFileChange = (file: File | null) => {
    setUploadFile(file);
  };

  return (
    <>
      <AppLayoutHeader title="Upload & Analyze" />
      <div className="p-6">
        <UploadTab
          selectedFile={uploadFile}
          analyzing={analyzing}
          result={uploadResult}
          onFileChange={handleFileChange}
          onAnalyze={handleAnalyze}
          hasAnalyzed={hasAnalyzed}
        />
      </div>
    </>
  );
}
