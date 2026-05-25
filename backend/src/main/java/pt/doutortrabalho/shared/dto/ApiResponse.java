package pt.doutortrabalho.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

/**
 * Standard API response envelope following the project convention:
 * { "data": {...}, "meta": {...}, "errors": [...] }
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        T data,
        Meta meta,
        List<ApiError> errors
) {

    public record Meta(
            Instant timestamp,
            String requestId
    ) {
        public Meta {
            if (timestamp == null) {
                timestamp = Instant.now();
            }
        }
    }

    public record ApiError(
            String code,
            String message,
            String field
    ) {
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data, new Meta(Instant.now(), null), null);
    }

    public static <T> ApiResponse<T> success(T data, String requestId) {
        return new ApiResponse<>(data, new Meta(Instant.now(), requestId), null);
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(null, new Meta(Instant.now(), null),
                List.of(new ApiError(code, message, null)));
    }

    public static <T> ApiResponse<T> error(List<ApiError> errors) {
        return new ApiResponse<>(null, new Meta(Instant.now(), null), errors);
    }
}
