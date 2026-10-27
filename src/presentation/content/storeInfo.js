/*
 * Dados da loja usados no rodapé e nas páginas institucionais (privacidade, trocas, contato...).
 * ATENÇÃO: só o e-mail é real; os outros valores ainda são de EXEMPLO. Troque pelos dados reais antes de abrir a loja —
 * é só editar aqui, todas as páginas usam este arquivo.
 */
export const STORE = Object.freeze({
  name: 'Montreal Moda e Casa',
  legalName: 'Montreal Moda e Casa Ltda.',
  cnpj: '12.345.678/0001-90',
  address: 'Rua das Flores, 123 · São Paulo/SP',
  email: 'montrealmoda1@gmail.com',
  // Telefone e WhatsApp só com números (DDD + número); a tela formata
  phone: '1140000000',
  whatsapp: '11900000000',
  hours: ['Segunda a sexta, das 9h às 18h', 'Sábado, das 9h às 13h'],
  // Redes sociais: deixe null as que a loja não usa (somem do rodapé)
  socials: Object.freeze({
    instagram: null,
    tiktok: null,
    facebook: null,
    youtube: null,
    pinterest: null,
  }),
})
