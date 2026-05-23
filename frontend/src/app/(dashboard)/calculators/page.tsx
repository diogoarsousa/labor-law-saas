import Link from "next/link";
import { Calculator, TrendingDown, Euro } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const calculadoras = [
  {
    href: "/calculators/severance",
    title: "Indemnização por despedimento",
    description:
      "Calcule a indemnização devida em caso de despedimento colectivo, extinção de posto de trabalho ou inadaptação, de acordo com o Código do Trabalho.",
    icon: TrendingDown,
    artigo: "Art. 366.º CT",
  },
  {
    href: "/calculators/salary",
    title: "Simulador de vencimento líquido",
    description:
      "Calcule o salário líquido a receber após deduções de IRS e Segurança Social com base no salário bruto e situação pessoal.",
    icon: Euro,
    artigo: "CIRS + CGSS",
  },
];

export default function CalculatorsPage() {
  return (
    <DashboardShell
      title="Calculadoras Laborais"
      description="Ferramentas de cálculo baseadas na legislação laboral portuguesa"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {calculadoras.map((calc) => {
          const Icon = calc.icon;
          return (
            <Link key={calc.href} href={calc.href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {calc.artigo}
                    </span>
                  </div>
                  <CardTitle className="mt-3 text-base">{calc.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {calc.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-indigo-600 group-hover:underline">
                    Abrir calculadora &rarr;
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {/* Coming soon */}
        {[
          {
            title: "Subsídio de férias",
            description: "Calcule o subsídio de férias proporcional.",
          },
          {
            title: "Trabalho suplementar",
            description: "Calcule o acréscimo por horas extra.",
          },
          {
            title: "Faltas injustificadas",
            description: "Calcule os descontos por faltas.",
          },
        ].map((item) => (
          <Card
            key={item.title}
            className="h-full opacity-60 cursor-not-allowed"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                  <Calculator className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
                  Em breve
                </span>
              </div>
              <CardTitle className="mt-3 text-base text-slate-500">
                {item.title}
              </CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
