# ADR-004: Authentication and Multi-Tenancy

**Status:** Accepted  
**Date:** 2026-05-22  
**Category:** Multi-tenancy  
**Deciders:** Diogo Sousa (Architect)  

## Context

As a B2B SaaS platform, we need to:
1. Authenticate users securely
2. Isolate data between organizations (tenants)
3. Support role-based access control within each organization
4. Handle subscription tiers (free, professional, enterprise)

## Decision

We adopt **Keycloak** for identity management with **schema-per-tenant** isolation using a discriminator column approach for the MVP, evolving to schema-per-tenant in production.

### Authentication Flow

```
[Browser] -> [Next.js] -> [Keycloak Authorization Code Flow + PKCE]
                              |
                        [JWT Access Token]
                              |
                    [Spring Security Resource Server]
                              |
                    [TenantContext from JWT claim]
```

### Roles

| Role | Permissions |
|------|------------|
| ROLE_WORKER | Legal Q&A, Calculators (read-only) |
| ROLE_HR | All features, manage company settings |
| ROLE_LAWYER | All features, jurisprudence, case tracking |
| ROLE_ADMIN | Tenant administration, user management |
| ROLE_SUPERADMIN | Platform administration (internal only) |

### Multi-Tenancy (MVP)

```java
@Component
public class TenantFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
            HttpServletResponse response, FilterChain chain) {
        String tenantId = extractTenantFromJwt(request);
        TenantContext.setCurrentTenant(tenantId);
        try {
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}

// All queries automatically filtered by tenant_id
@Entity
public abstract class TenantAwareEntity {
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;
}
```

## Consequences

### Positive
- Keycloak is battle-tested for enterprise SSO, SAML, OIDC
- JWT tokens are stateless, good for horizontal scaling
- Discriminator column is simple to implement for MVP
- Keycloak handles user registration, password reset, MFA

### Negative
- Keycloak adds operational complexity (another service to manage)
- Discriminator column requires careful query filtering (risk of data leaks)
- Keycloak's admin UI has a learning curve

### Mitigations
- Use Hibernate filters for automatic tenant filtering
- Add integration tests that verify tenant isolation
- Consider managed Keycloak (e.g., Keycloak on Railway) for MVP
