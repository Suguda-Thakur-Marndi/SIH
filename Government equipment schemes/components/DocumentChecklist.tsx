'use client';

import React from 'react';
import { DocumentItem } from '../types';

import { useLanguage } from '@/lib/language-context';
interface DocumentChecklistProps {
  schemeId: string;
  documents: DocumentItem[];
  onToggleReady: (schemeId: string, docId: string) => void;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  schemeId,
  documents,
  onToggleReady,
}) => {
  const { t } = useLanguage();
  const readyCount = documents.filter((d) => d.status === 'ready').length;
  const totalCount = documents.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-[#6B6B66] font-medium">{t('document_readiness_status', 'Document Readiness Status')}{' '}</span>
        <span
          className={`font-bold px-2.5 py-0.5 rounded-full ${
            readyCount === totalCount
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {readyCount} of {totalCount} ready
        </span>
      </div>

      <div className="space-y-2">
        {documents.map((doc) => {
          const isReady = doc.status === 'ready';

          return (
            <div
              key={doc.id}
              onClick={() => onToggleReady(schemeId, doc.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                isReady
                  ? 'bg-emerald-50/50 border-emerald-200 text-[#1A1A1A]'
                  : 'bg-[#F8F8F6] border-gray-200/80 text-[#1A1A1A] hover:bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className={`w-5 h-5 mt-0.5 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isReady
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'border border-gray-300 bg-white text-transparent hover:border-gray-400'
                  }`}
                >
                  ✓
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1A1A1A]">
                      {doc.name}
                    </span>
                    {doc.required && (
                      <span className="text-[10px] uppercase font-bold text-[#E4574B]">
                        {t('required', 'Required')}
                      </span>
                    )}
                  </div>
                  {doc.description && (
                    <p className="text-xs text-[#6B6B66] mt-0.5 font-medium">
                      {doc.description}
                    </p>
                  )}
                </div>
              </div>

              <span
                className={`text-xs px-2.5 py-1 rounded-xl font-bold whitespace-nowrap ${
                  isReady
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-white text-[#4A4A4A] border border-gray-200'
                }`}
              >
                {isReady ? '✓ Ready' : 'Mark Ready'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentChecklist;
