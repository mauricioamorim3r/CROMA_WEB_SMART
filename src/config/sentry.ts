// Arquivo dummy do Sentry para evitar erros de import
// As funções reais foram comentadas temporariamente

export const sentryConfig = {};

export const isSentryConfigValid = (): boolean => false;

export const initSentry = (): boolean => {
  console.log('Sentry desabilitado temporariamente');
  return false;
};

export const logSentryStatus = (): void => {
  console.log('Sentry: Desabilitado');
};

export const captureError = (error: Error, context?: any) => {
  console.error('Error captured:', error, context);
};

export const captureMessage = (message: string, level: string = 'info') => {
  console.log(`[${level}] ${message}`);
};

export const addBreadcrumb = (message: string, category: string = 'custom') => {
  console.log(`Breadcrumb [${category}]: ${message}`);
};

export const setUser = (user: { id?: string; email?: string; username?: string }) => {
  console.log('User set:', user);
};

export const setTag = (key: string, value: string) => {
  console.log(`Tag set: ${key} = ${value}`);
}; 