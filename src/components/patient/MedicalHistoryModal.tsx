"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import MedicalHistoryForm from "./MedicalHistoryForm";

interface MedicalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MedicalHistoryModal({
  isOpen,
  onClose,
}: MedicalHistoryModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-label="Close modal overlay"
      />

      {/* Modal */}
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 h-full w-full max-w-[500px] bg-white dark:bg-gray-900 shadow-lg z-50 flex flex-col overflow-y-auto"
      >
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Medical History Details
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            ✕
          </button>
        </header>

        {/* Form */}
        <div className="p-4 flex-grow text-gray-900 dark:text-gray-100 mt-12">
          <MedicalHistoryForm onClose={onClose} />
        </div>
      </aside>
    </>,
    document.body
  );
}
