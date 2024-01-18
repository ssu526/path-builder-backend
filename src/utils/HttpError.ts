class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message?: string) {
    super(message || "Unknown Error");
    this.statusCode = statusCode;
  }
}

export default HttpError;
