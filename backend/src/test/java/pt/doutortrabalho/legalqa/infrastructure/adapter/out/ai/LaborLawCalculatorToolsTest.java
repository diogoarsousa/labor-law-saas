package pt.doutortrabalho.legalqa.infrastructure.adapter.out.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("LaborLawCalculatorTools")
class LaborLawCalculatorToolsTest {

    private LaborLawCalculatorTools tools;

    @BeforeEach
    void setUp() {
        tools = new LaborLawCalculatorTools();
    }

    @Nested
    @DisplayName("calculateSeverance")
    class Severance {

        @Test
        @DisplayName("should calculate severance for 5 years of service")
        void shouldCalculateFor5Years() {
            String result = tools.calculateSeverance(1500.0, "2019-01-01", "2024-01-01");

            assertThat(result)
                    .contains("Indemnizacao por despedimento")
                    .contains("Salario base: 1500.00 EUR")
                    .contains("Artigo 366");
        }

        @Test
        @DisplayName("should calculate severance for 1 year of service")
        void shouldCalculateFor1Year() {
            String result = tools.calculateSeverance(1000.0, "2023-01-01", "2024-01-01");

            assertThat(result)
                    .contains("1000.00 EUR")
                    .contains("Artigo 366");
        }
    }

    @Nested
    @DisplayName("calculateOvertime")
    class Overtime {

        @Test
        @DisplayName("should calculate overtime for workday")
        void shouldCalculateForWorkday() {
            String result = tools.calculateOvertime(1500.0, 3.0, "UTIL");

            assertThat(result)
                    .contains("dia util")
                    .contains("25%")
                    .contains("Artigo 268");
        }

        @Test
        @DisplayName("should calculate overtime for rest day")
        void shouldCalculateForRestDay() {
            String result = tools.calculateOvertime(1500.0, 2.0, "DESCANSO");

            assertThat(result)
                    .contains("dia de descanso/feriado")
                    .contains("50%")
                    .contains("Artigo 268");
        }
    }

    @Nested
    @DisplayName("calculateVacation")
    class Vacation {

        @Test
        @DisplayName("should return 22 days for non-first year")
        void shouldReturn22DaysForFullYear() {
            String result = tools.calculateVacation("2020-01-15", 2024);

            assertThat(result)
                    .contains("22 dias uteis")
                    .contains("Artigo 238");
        }

        @Test
        @DisplayName("should calculate proportional days for first year")
        void shouldCalculateProportionalForFirstYear() {
            String result = tools.calculateVacation("2024-06-01", 2024);

            assertThat(result)
                    .contains("Ano de admissao")
                    .contains("Artigo 238");
        }
    }
}
