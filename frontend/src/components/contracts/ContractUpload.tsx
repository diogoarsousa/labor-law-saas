"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContractUploadProps {
  /** Called when a file is selected and ready to analyze */
  onFileSelected: (file: File) => void;
  /** Whether an upload/analysis is in progress */
  isLoading?: boolean;
}

/**
 * Drag-and-drop file upload zone for employment contracts.
 * Accepts PDF, DOC, DOCX files up to 10MB.
 */
export function ContractUpload({
  onFileSelected,
  isLoading = false,
}: ContractUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ACCEPTED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Formato não suportado. Utilize PDF, DOC, DOCX ou TXT.";
    }
    if (file.size > MAX_SIZE) {
      return "O ficheiro não pode exceder 10MB.";
    }
    return null;
  };

  const handleFile = (file: File) => {
    const err = validateFile(file);
    if (err) {
      setError(err);
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
          dragOver
            ? "border-indigo-400 bg-indigo-50"
            : "border-slate-300 bg-slate-50 hover:border-slate-400",
          selectedFile && "cursor-default",
          !selectedFile && "cursor-pointer"
        )}
      >
        {selectedFile ? (
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-indigo-600 shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="ml-2 text-slate-400 hover:text-red-500"
              aria-label="Remover ficheiro"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="mb-3 h-10 w-10 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">
              Arraste e solte o contrato aqui
            </p>
            <p className="mt-1 text-xs text-slate-500">
              ou clique para selecionar ficheiro
            </p>
            <p className="mt-2 text-xs text-slate-400">
              PDF, DOC, DOCX, TXT — máx. 10MB
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleInputChange}
        className="sr-only"
        aria-label="Selecionar ficheiro de contrato"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {selectedFile && (
        <Button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              A analisar...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Analisar contrato
            </>
          )}
        </Button>
      )}
    </div>
  );
}
