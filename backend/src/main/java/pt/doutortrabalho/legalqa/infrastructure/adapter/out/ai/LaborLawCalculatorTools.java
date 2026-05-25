package pt.doutortrabalho.legalqa.infrastructure.adapter.out.ai;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Spring AI @Tool definitions for Portuguese labor law calculators.
 * These tools are automatically callable by Claude during chat interactions.
 *
 * Legal basis: Codigo do Trabalho (Lei n.o 7/2009)
 */
public class LaborLawCalculatorTools {

    @Tool(description = """
            Calcula a indemnizacao por despedimento (severance pay) segundo o Codigo do Trabalho portugues.
            Aplica-se a despedimentos coletivos, extincao de posto de trabalho e despedimento por inadaptacao.
            Base legal: Artigo 366.o do Codigo do Trabalho.
            Para contratos iniciados apos 1 de outubro de 2013: 12 dias de retribuicao base por cada ano completo de antiguidade.
            """)
    public String calculateSeverance(
            @ToolParam(description = "Salario base mensal em euros") double baseSalary,
            @ToolParam(description = "Data de inicio do contrato (formato YYYY-MM-DD)") String startDate,
            @ToolParam(description = "Data do despedimento (formato YYYY-MM-DD)") String endDate) {

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        long totalDays = ChronoUnit.DAYS.between(start, end);
        double years = totalDays / 365.25;

        // Post-2013 rule: 12 days per year of service
        BigDecimal dailyRate = BigDecimal.valueOf(baseSalary)
                .divide(BigDecimal.valueOf(30), 4, RoundingMode.HALF_UP);
        BigDecimal severance = dailyRate
                .multiply(BigDecimal.valueOf(12))
                .multiply(BigDecimal.valueOf(years))
                .setScale(2, RoundingMode.HALF_UP);

        return String.format(
                "Indemnizacao por despedimento:%n" +
                "- Salario base: %.2f EUR%n" +
                "- Antiguidade: %.1f anos (%d dias)%n" +
                "- Calculo: (%.2f EUR/dia x 12 dias x %.1f anos)%n" +
                "- Valor total: %.2f EUR%n" +
                "- Base legal: Artigo 366.o do Codigo do Trabalho",
                baseSalary, years, totalDays,
                dailyRate.doubleValue(), years,
                severance.doubleValue());
    }

    @Tool(description = """
            Calcula o pagamento de trabalho suplementar (overtime) segundo o Codigo do Trabalho portugues.
            Base legal: Artigo 268.o do Codigo do Trabalho.
            Primeira hora: +25% em dia util, +50% em dia de descanso/feriado.
            Horas seguintes: +37.5% em dia util, +75% em dia de descanso/feriado.
            """)
    public String calculateOvertime(
            @ToolParam(description = "Salario base mensal em euros") double baseSalary,
            @ToolParam(description = "Numero de horas suplementares") double overtimeHours,
            @ToolParam(description = "Tipo de dia: UTIL (dia util) ou DESCANSO (dia de descanso/feriado)") String dayType) {

        BigDecimal hourlyRate = BigDecimal.valueOf(baseSalary)
                .divide(BigDecimal.valueOf(174), 4, RoundingMode.HALF_UP); // 40h/week * 4.35

        boolean isWorkday = "UTIL".equalsIgnoreCase(dayType);
        double firstHourRate = isWorkday ? 1.25 : 1.50;
        double subsequentRate = isWorkday ? 1.375 : 1.75;

        BigDecimal firstHourPay = overtimeHours >= 1
                ? hourlyRate.multiply(BigDecimal.valueOf(firstHourRate))
                : hourlyRate.multiply(BigDecimal.valueOf(firstHourRate))
                        .multiply(BigDecimal.valueOf(overtimeHours));

        BigDecimal remainingPay = overtimeHours > 1
                ? hourlyRate.multiply(BigDecimal.valueOf(subsequentRate))
                        .multiply(BigDecimal.valueOf(overtimeHours - 1))
                : BigDecimal.ZERO;

        BigDecimal totalPay = firstHourPay.add(remainingPay).setScale(2, RoundingMode.HALF_UP);

        String dayTypeLabel = isWorkday ? "dia util" : "dia de descanso/feriado";

        return String.format(
                "Trabalho suplementar (%s):%n" +
                "- Salario base: %.2f EUR (taxa horaria: %.2f EUR)%n" +
                "- Horas suplementares: %.1f%n" +
                "- 1.a hora: +%d%% = %.2f EUR%n" +
                "- Horas seguintes: +%.1f%% = %.2f EUR%n" +
                "- Total: %.2f EUR%n" +
                "- Base legal: Artigo 268.o do Codigo do Trabalho",
                dayTypeLabel, baseSalary, hourlyRate.doubleValue(),
                overtimeHours,
                (int) ((firstHourRate - 1) * 100), firstHourPay.doubleValue(),
                (subsequentRate - 1) * 100, remainingPay.doubleValue(),
                totalPay.doubleValue());
    }

    @Tool(description = """
            Calcula o direito a ferias segundo o Codigo do Trabalho portugues.
            Base legal: Artigo 238.o do Codigo do Trabalho.
            O periodo anual de ferias e de 22 dias uteis. No ano de admissao, o trabalhador
            tem direito a 2 dias uteis de ferias por cada mes de duracao do contrato, ate 20 dias.
            """)
    public String calculateVacation(
            @ToolParam(description = "Data de inicio do contrato (formato YYYY-MM-DD)") String startDate,
            @ToolParam(description = "Ano para o qual calcular as ferias") int referenceYear) {

        LocalDate start = LocalDate.parse(startDate);
        int startYear = start.getYear();

        int vacationDays;
        String explanation;

        if (referenceYear == startYear) {
            // First year: 2 days per month, max 20
            long monthsWorked = ChronoUnit.MONTHS.between(start, LocalDate.of(startYear, 12, 31));
            vacationDays = (int) Math.min(monthsWorked * 2, 20);
            explanation = String.format(
                    "Ano de admissao: %d meses trabalhados x 2 dias = %d dias (maximo 20)",
                    monthsWorked, vacationDays);
        } else if (referenceYear == startYear + 1 && start.getMonthValue() > 6) {
            // Second year after late start: proportional
            long monthsInFirstYear = ChronoUnit.MONTHS.between(start, LocalDate.of(startYear + 1, 1, 1));
            vacationDays = (int) Math.min(monthsInFirstYear * 2, 22);
            explanation = String.format(
                    "Segundo ano (admissao tardia): %d meses no 1.o ano x 2 dias = %d dias",
                    monthsInFirstYear, vacationDays);
        } else {
            vacationDays = 22;
            explanation = "Periodo normal de ferias: 22 dias uteis";
        }

        return String.format(
                "Direito a ferias (%d):%n" +
                "- Data de admissao: %s%n" +
                "- %s%n" +
                "- Dias de ferias: %d dias uteis%n" +
                "- Base legal: Artigo 238.o do Codigo do Trabalho",
                referenceYear, startDate, explanation, vacationDays);
    }
}
