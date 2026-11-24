/**
 * Mensagem de erro da API (ProblemDetail: `detail`, com `message` mantido por compatibilidade).
 * Usa o texto padrão quando o corpo não é JSON ou não traz mensagem.
 */
export async function lerMensagemDeErro(response, padrao) {
  const dados = await response.json().catch(() => null);
  return dados?.detail || dados?.message || padrao;
}
