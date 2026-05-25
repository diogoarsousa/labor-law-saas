package pt.doutortrabalho.auth.domain.port.out;

import pt.doutortrabalho.auth.application.dto.LoginResponse;

/**
 * Outbound port for interacting with the external Identity Provider (Keycloak).
 * This is the secondary/driven port that the infrastructure adapter implements.
 */
public interface IdentityProviderClient {

    /**
     * Obtains tokens using the Resource Owner Password Credentials grant.
     */
    LoginResponse authenticate(String email, String password);

    /**
     * Invalidates the given refresh token at the IdP.
     */
    void logout(String refreshToken);

    /**
     * Creates a new user in the IdP and sends a verification email.
     *
     * @return the IdP-assigned user ID
     */
    String createUser(String firstName, String lastName, String email, String password);

    /**
     * Exchanges a refresh token for a new access token.
     */
    LoginResponse refreshToken(String refreshToken);

    /**
     * Triggers a password reset email for the user identified by email.
     * Should not reveal whether the email exists (silent failure).
     */
    void sendPasswordResetEmail(String email);

    /**
     * Changes the password for the given user ID, validating the current password first.
     */
    void changePassword(String userId, String currentPassword, String newPassword);
}
