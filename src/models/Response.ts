
export interface AppResponse<T> {
    success: boolean;
    data: T;
    message: string;
    token: string;
    error?: string;
    responseCode?: string;
    errorData?: unknown;
}
