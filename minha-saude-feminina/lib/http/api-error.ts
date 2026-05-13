import { ApiError } from '@/lib/http/api-client';

export function getUserFacingErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    if (error instanceof Error && error.message.includes('EXPO_PUBLIC_ADMIN_API_KEY')) {
      return 'Chave administrativa nao configurada. Defina EXPO_PUBLIC_ADMIN_API_KEY apenas em ambiente interno.';
    }

    if (error instanceof Error && error.message.includes('EXPO_PUBLIC_API_BASE_URL')) {
      return 'URL da API nao configurada. Defina EXPO_PUBLIC_API_BASE_URL.';
    }

    return 'Nao foi possivel completar a solicitacao. Tente novamente.';
  }

  switch (error.code) {
    case 'SLUG_ALREADY_EXISTS':
      return 'Ja existe um registro usando este slug.';
    case 'CATEGORY_NOT_FOUND':
      return 'Categoria nao encontrada.';
    case 'ARTICLE_NOT_FOUND':
      return 'Artigo nao encontrado.';
    case 'VALIDATION_ERROR':
      return 'Os dados enviados sao invalidos.';
    case 'ADMIN_API_KEY_NOT_CONFIGURED':
      return 'A chave administrativa nao esta configurada na API.';
    case 'UNAUTHORIZED':
      return 'Voce nao esta autenticado para executar esta acao.';
  }

  switch (error.status) {
    case 400:
      return 'Verifique os dados informados e tente novamente.';
    case 401:
      return 'Sua sessao expirou. Faca login novamente.';
    case 403:
      return 'Voce nao tem permissao para executar esta acao.';
    case 404:
      return 'O recurso solicitado nao foi encontrado.';
    case 409:
      return 'A operacao conflita com dados ja existentes.';
    case 422:
      return 'Alguns campos precisam ser corrigidos antes de continuar.';
    case 500:
      return 'Ocorreu um erro interno. Tente novamente em instantes.';
    case 503:
      return 'Servico temporariamente indisponivel. Tente novamente em instantes.';
    default:
      return error.message || 'Nao foi possivel completar a solicitacao.';
  }
}
