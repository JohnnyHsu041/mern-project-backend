class HttpError extends Error {
    constructor(readonly message: string, readonly code: number) {
        super(message);
    }
}

export default HttpError;
