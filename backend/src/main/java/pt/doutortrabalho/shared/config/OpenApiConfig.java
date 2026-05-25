package pt.doutortrabalho.shared.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger configuration for Doutor do Trabalho API.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Doutor do Trabalho API")
                        .description("AI-powered Portuguese Labor Law SaaS platform. "
                                + "Provides legal Q&A, contract analysis, compliance checking, "
                                + "and labor law calculators powered by RAG and Claude AI.")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Doutor do Trabalho Team")
                                .email("diogo97sousa@gmail.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://doutortrabalho.pt")))
                .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"))
                .components(new Components()
                        .addSecuritySchemes("bearer-jwt",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .in(SecurityScheme.In.HEADER)
                                        .name("Authorization")
                                        .description("JWT token from Keycloak")));
    }
}
