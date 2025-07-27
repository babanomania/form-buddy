const logIO = process.env.REACT_APP_LOG_MODEL_IO === 'true';

export function logger(...args) {
  if (logIO) console.log('[form-buddy]', ...args);
}

export function loggerError(...args) {
  if (logIO) console.error('[form-buddy]', ...args);
}
