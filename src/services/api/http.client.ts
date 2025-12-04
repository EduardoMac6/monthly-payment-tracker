/**
 * HTTP Client
 * Generic HTTP client for making API requests with retry logic, interceptors, and error handling
 */

/**
 * HTTP Error class for API-related errors
 */
export class HttpError extends Error {
    status: number;
    statusText: string;
    response?: unknown;

    constructor(status: number, statusText: string, message?: string, response?: unknown) {
        super(message || `HTTP Error ${status}: ${statusText}`);
        this.name = 'HttpError';
        this.status = status;
        this.statusText = statusText;
        this.response = response;
    }
}

/**
 * Request interceptor function type
 */
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

/**
 * Response interceptor function type
 */
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

/**
 * Request configuration
 */
export interface RequestConfig {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
    timeout?: number;
    retries?: number;
}

/**
 * HTTP Client options
 */
export interface HttpClientOptions {
    baseURL: string;
    timeout?: number;
    defaultHeaders?: Record<string, string>;
    retries?: number;
    retryDelay?: number;
    requestInterceptors?: RequestInterceptor[];
    responseInterceptors?: ResponseInterceptor[];
}

/**
 * Generic HTTP Client
 * Provides methods for making HTTP requests with retry logic, interceptors, and error handling
 */
export class HttpClient {
    private baseURL: string;
    private timeout: number;
    private defaultHeaders: Record<string, string>;
    private retries: number;
    private retryDelay: number;
    private requestInterceptors: RequestInterceptor[];
    private responseInterceptors: ResponseInterceptor[];

    constructor(options: HttpClientOptions) {
        this.baseURL = options.baseURL.endsWith('/')
            ? options.baseURL.slice(0, -1)
            : options.baseURL;
        this.timeout = options.timeout || 30000; // 30 seconds default
        this.defaultHeaders = options.defaultHeaders || {
            'Content-Type': 'application/json',
        };
        this.retries = options.retries ?? 3;
        this.retryDelay = options.retryDelay || 1000; // 1 second default
        this.requestInterceptors = options.requestInterceptors || [];
        this.responseInterceptors = options.responseInterceptors || [];
    }

    /**
     * Add request interceptor
     */
    addRequestInterceptor(interceptor: RequestInterceptor): void {
        this.requestInterceptors.push(interceptor);
    }

    /**
     * Add response interceptor
     */
    addResponseInterceptor(interceptor: ResponseInterceptor): void {
        this.responseInterceptors.push(interceptor);
    }

    /**
     * Build full URL from endpoint
     */
    private buildURL(endpoint: string): string {
        if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
            return endpoint;
        }
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${this.baseURL}${cleanEndpoint}`;
    }

    /**
     * Apply request interceptors
     */
    private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
        let processedConfig = config;
        for (const interceptor of this.requestInterceptors) {
            processedConfig = await interceptor(processedConfig);
        }
        return processedConfig;
    }

    /**
     * Apply response interceptors
     */
    private async applyResponseInterceptors(response: Response): Promise<Response> {
        let processedResponse = response;
        for (const interceptor of this.responseInterceptors) {
            processedResponse = await interceptor(processedResponse);
        }
        return processedResponse;
    }

    /**
     * Check if error is retryable
     */
    private isRetryableError(status: number, _error?: Error): boolean {
        // Retry on network errors, timeouts, and 5xx server errors
        if (!status) {
            return true; // Network error
        }
        // Retry on 5xx errors and 429 (Too Many Requests)
        return status >= 500 || status === 429;
    }

    /**
     * Calculate retry delay with exponential backoff
     */
    private calculateRetryDelay(attempt: number): number {
        return this.retryDelay * Math.pow(2, attempt);
    }

    /**
     * Make HTTP request with retry logic
     */
    private async request<T>(
        method: string,
        endpoint: string,
        data?: unknown,
        options?: Partial<RequestConfig>
    ): Promise<T> {
        const url = this.buildURL(endpoint);
        const timeout = options?.timeout || this.timeout;
        const retries = options?.retries ?? this.retries;

        let config: RequestConfig = {
            method,
            url,
            headers: { ...this.defaultHeaders, ...options?.headers },
            body: data,
            timeout,
            retries,
        };

        // Apply request interceptors
        config = await this.applyRequestInterceptors(config);

        let lastError: Error | HttpError | undefined;

        // Retry loop
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                // Prepare request body
                let body: string | undefined;
                if (config.body !== undefined) {
                    if (
                        config.headers &&
                        config.headers['Content-Type']?.includes('application/json')
                    ) {
                        body = JSON.stringify(config.body);
                    } else {
                        body = config.body as string;
                    }
                }

                // Create abort controller for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                try {
                    // Make fetch request
                    const response = await fetch(config.url, {
                        method: config.method,
                        headers: config.headers,
                        body,
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    // Apply response interceptors
                    const processedResponse = await this.applyResponseInterceptors(response);

                    // Check if response is ok
                    if (!processedResponse.ok) {
                        const errorText = await processedResponse.text().catch(() => '');
                        let errorData: unknown;
                        try {
                            errorData = errorText ? JSON.parse(errorText) : undefined;
                        } catch {
                            errorData = errorText;
                        }

                        const httpError = new HttpError(
                            processedResponse.status,
                            processedResponse.statusText,
                            `HTTP ${processedResponse.status}: ${processedResponse.statusText}`,
                            errorData
                        );

                        // Check if retryable
                        if (this.isRetryableError(processedResponse.status) && attempt < retries) {
                            lastError = httpError;
                            const delay = this.calculateRetryDelay(attempt);
                            await new Promise((resolve) => setTimeout(resolve, delay));
                            continue;
                        }

                        throw httpError;
                    }

                    // Parse response
                    const contentType = processedResponse.headers.get('content-type');
                    if (contentType?.includes('application/json')) {
                        return (await processedResponse.json()) as T;
                    }
                    return (await processedResponse.text()) as T;
                } catch (error) {
                    clearTimeout(timeoutId);
                    throw error;
                }
            } catch (error) {
                const isAborted = error instanceof Error && error.name === 'AbortError';
                const isNetworkError = error instanceof TypeError || isAborted;

                if (
                    isNetworkError ||
                    (error instanceof HttpError && this.isRetryableError(error.status))
                ) {
                    if (attempt < retries) {
                        lastError = error as Error;
                        const delay = this.calculateRetryDelay(attempt);
                        await new Promise((resolve) => setTimeout(resolve, delay));
                        continue;
                    }
                }

                // Not retryable or max retries reached
                if (error instanceof HttpError) {
                    throw error;
                }

                if (isAborted) {
                    throw new HttpError(
                        408,
                        'Request Timeout',
                        `Request timed out after ${timeout}ms`
                    );
                }

                if (isNetworkError) {
                    throw new HttpError(
                        0,
                        'Network Error',
                        'Network request failed. Please check your connection.',
                        error
                    );
                }

                throw error;
            }
        }

        // If we get here, all retries failed
        if (lastError instanceof HttpError) {
            throw lastError;
        }
        throw lastError || new HttpError(0, 'Unknown Error', 'Request failed after retries');
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, options?: Partial<RequestConfig>): Promise<T> {
        return this.request<T>('GET', endpoint, undefined, options);
    }

    /**
     * POST request
     */
    async post<T>(endpoint: string, data?: unknown, options?: Partial<RequestConfig>): Promise<T> {
        return this.request<T>('POST', endpoint, data, options);
    }

    /**
     * PUT request
     */
    async put<T>(endpoint: string, data?: unknown, options?: Partial<RequestConfig>): Promise<T> {
        return this.request<T>('PUT', endpoint, data, options);
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string, options?: Partial<RequestConfig>): Promise<T> {
        return this.request<T>('DELETE', endpoint, undefined, options);
    }
}
