import { Scale } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-navy-800 p-12 text-white">
        <div className="flex items-center gap-3">
          <Scale className="h-8 w-8 text-indigo-400" />
          <span className="text-xl font-semibold">Doutor Trabalho</span>
        </div>
        <div>
          <h2 className="text-3xl font-semibold leading-tight">
            Direito do Trabalho
            <br />
            ao alcance de todos.
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Plataforma inteligente para equipas de RH, advogados e trabalhadores
            navegarem o Código do Trabalho português com confiança.
          </p>
        </div>
        <div className="text-sm text-slate-500">
          <p>Baseado no Código do Trabalho — Lei n.º 7/2009</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Scale className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-semibold text-navy-800">
              Doutor Trabalho
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
