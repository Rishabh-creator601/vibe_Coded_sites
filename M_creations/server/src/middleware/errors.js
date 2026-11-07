import { ZodError } from 'zod';
import multer from 'multer';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    const issue = err.issues[0];
    // Our own messages are written for customers. Only zod's generic defaults need the field name.
    const field = issue.path.join('.');
    const generic = /^(Required|Invalid|Expected)/.test(issue.message);
    return res.status(400).json({ error: generic && field ? `${field}: ${issue.message}` : issue.message });
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Choose an image under 5 MB.' : err.message;
    return res.status(400).json({ error: message });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'The server could not complete this request.' });
}
