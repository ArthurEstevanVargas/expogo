export function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, '');

  if (!apiBaseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL nao configurada');
  }

  return apiBaseUrl;
}

export function getAdminApiKey(): string {
  const adminApiKey = process.env.EXPO_PUBLIC_ADMIN_API_KEY?.trim();

  if (!adminApiKey) {
    throw new Error('EXPO_PUBLIC_ADMIN_API_KEY nao configurada');
  }

  return adminApiKey;
}
