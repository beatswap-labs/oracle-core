type FetchRetryOptions = {
    retries?: number;
    delayMs?: number;
    retryOnCodes?: string[];
    onRetry?: (error: unknown, attempt: number, maxRetries: number) => void;
};

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractErrorCode(error: unknown): string | undefined {
    if (!error || typeof error !== 'object') {
        return undefined;
    }

    const fetchError = error as { code?: string; errno?: string };
    return fetchError.code ?? fetchError.errno;
}

export async function fetchWithRetry(
    url: string,
    init?: RequestInit,
    options: FetchRetryOptions = {},
) {
    const {
        retries = 3,
        delayMs = 1000,
        retryOnCodes = ['EAI_AGAIN'],
        onRetry,
    } = options;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            return await fetch(url, init);
        } catch (error) {
            const errorCode = extractErrorCode(error);
            const shouldRetry = attempt <= retries && !!errorCode && retryOnCodes.includes(errorCode);

            if (!shouldRetry) {
                throw error;
            }

            onRetry?.(error, attempt, retries);
            await sleep(delayMs * attempt);
        }
    }

    throw new Error('fetchWithRetry exhausted without returning a response');
}
