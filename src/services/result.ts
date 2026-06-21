/**
 * Standard result envelope returned by every service call.
 *
 * Mirrors the `{ success, message, data }` shape the app previously consumed
 * from `@rcffuta/ict-lib`.
 */
export type ServiceResult<T> = {
    success: boolean;
    message: string;
    data: T;
};

const DISABLED_MESSAGE =
    "Backend integration (@rcffuta/ict-lib) is currently disabled.";

export const ok = <T>(data: T, message = ""): ServiceResult<T> => ({
    success: true,
    message,
    data,
});

export const fail = <T>(
    message: string = DISABLED_MESSAGE
): ServiceResult<T> => ({
    success: false,
    message,
    data: undefined as unknown as T,
});
