"use client";

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import PatientDetailsForm from "./PatientDetailsForm";

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientModal({ isOpen, onClose }: PatientModalProps) {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <div
        className="fixed top-0 left-0 h-full backdrop-blur-sm"
        style={{ width: `calc(100vw - 900px)` }}
        onClick={onClose}
        aria-label="Close modal overlay"
      />


      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 h-full w-[1000px] bg-white dark:bg-gray-900 shadow-lg z-50 flex flex-col"
        style={{
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Header with close button */}
        <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Patient Details
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            ✕
          </button>
        </header>

        {/* Form content */}
        <div className="p-4 flex-grow  text-gray-900 dark:text-gray-100">
          <PatientDetailsForm />
        </div>
      </aside>
    </>,
    document.body
  );
}
