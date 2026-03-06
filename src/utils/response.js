// src/utils/response.js
// Consistent JSON envelope for all responses
// Shape: { success, message, data?, meta?, errors? }

const send = (res, status, success, message, extras = {}) =>
  res.status(status).json({ success, message, ...extras });

const sendSuccess  = (res, message = 'OK', data = null, meta = null) =>
  send(res, 200, true, message, {
    ...(data !== null && { data }),
    ...(meta !== null && { meta }),
  });

const sendCreated  = (res, message = 'Created', data = null) =>
  send(res, 201, true, message, ...(data !== null ? [{ data }] : []));

const sendError    = (res, status = 500, message = 'Internal Server Error', errors = null) =>
  send(res, status, false, message, ...(errors !== null ? [{ errors }] : []));

const sendBadRequest   = (res, message = 'Bad request', errors = null) =>
  sendError(res, 400, message, errors);

const sendUnauthorized = (res, message = 'Unauthorized') =>
  sendError(res, 401, message);

const sendForbidden    = (res, message = 'Forbidden') =>
  sendError(res, 403, message);

const sendNotFound     = (res, message = 'Not found') =>
  sendError(res, 404, message);

const sendConflict     = (res, message = 'Conflict') =>
  sendError(res, 409, message);

export {
  sendSuccess,
  sendCreated,
  sendError,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
};