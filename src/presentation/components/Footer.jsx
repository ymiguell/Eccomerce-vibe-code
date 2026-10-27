import { Link } from 'react-router'
import { INFO_GROUPS, INFO_PAGES } from '../content/infoPages.js'
import { STORE } from '../content/storeInfo.js'
import { formatPhone } from '../formatters/masks.js'
import Logo from './Logo.jsx'
import NewsletterForm from './NewsletterForm.jsx'

// Links do rodapé: as páginas vêm de content/infoPages.js; contato e empresa, de content/storeInfo.js
const linkGroups = Object.entries(INFO_GROUPS).map(([group, title]) => ({
  title,
  links: INFO_PAGES.filter((page) => page.group === group).map((page) => ({ label: page.title, to: `/${page.slug}` })),
}))

const contacts = [
  { label: 'E-mail', value: STORE.email, href: `mailto:${STORE.email}` },
  { label: 'Telefone', value: formatPhone(STORE.phone), href: `tel:+55${STORE.phone}` },
  { label: 'WhatsApp', value: formatPhone(STORE.whatsapp), href: `https://wa.me/55${STORE.whatsapp}` },
]

// Rede sem endereço em storeInfo.js não aparece (link vazio seria um botão que não leva a lugar nenhum)
const socials = [
  {
    name: 'Instagram',
    href: STORE.socials.instagram,
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
      </>
    ),
  },
  {
    name: 'TikTok',
    href: STORE.socials.tiktok,
    icon: <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.6 2.4 4.5 5 4.6" />,
  },
  {
    name: 'Facebook',
    href: STORE.socials.facebook,
    icon: <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H7v3.5h2V21h3.5v-8.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" />,
  },
  {
    name: 'YouTube',
    href: STORE.socials.youtube,
    icon: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
        <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" />
      </>
    ),
  },
  {
    name: 'Pinterest',
    href: STORE.socials.pinterest,
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M10.5 8.3c3.2-1.3 6.1.6 5.4 3.6-.5 2.3-2.8 3.4-4.5 2.2M11.6 11.5 9.5 20" />
      </>
    ),
  },
]

const activeSocials = socials.filter((social) => social.href)

const partners = ['Algodão Vivo', 'Tecelagem Aurora', 'Couro Nobre', 'EcoFrete', 'Ateliê Sul']

// As mesmas formas aceitas no checkout (ver página Formas de pagamento)
const paymentMethods = ['Pix', 'Visa', 'Mastercard', 'Elo', 'Amex']

const currentYear = new Date().getFullYear()

function FooterHeading({ children }) {
  return <h2 className="font-sans text-xs font-semibold tracking-[0.2em] text-white uppercase">{children}</h2>
}

function Footer({ onSubscribe }) {
  return (
    <footer id="contato" className="mt-8">
      {/* Transição em degradê: branco da página → vermelho suave → vermelho escuro do rodapé */}
      <div aria-hidden="true" className="h-28 bg-linear-to-b from-background via-primary/25 to-footer sm:h-40" />

      {/* Foco branco, pois o contorno vermelho padrão some no fundo vermelho */}
      <div className="bg-footer text-white/85 [&_:focus-visible]:outline-white">
        {/* Newsletter */}
        <section aria-labelledby="newsletter-title" className="mx-auto max-w-7xl px-4 pt-6 pb-14 sm:px-6 sm:pb-16 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <FooterHeading>Newsletter</FooterHeading>
              <p id="newsletter-title" className="mt-3 font-serif text-3xl leading-tight font-semibold text-balance text-white sm:text-4xl">
                Novidades e ofertas exclusivas no seu <span className="whitespace-nowrap">e-mail</span>
              </p>
              <p className="mt-3 max-w-md text-white/85">
                Seja o primeiro a saber dos lançamentos e ganhe <strong className="text-white">10% de desconto</strong> na
                primeira compra.
              </p>
            </div>
            <NewsletterForm onSubscribe={onSubscribe} />
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Marca, links e atendimento */}
          <div className="grid gap-10 border-t border-white/20 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-12">
            <div>
              <Link to="/" aria-label="Montreal Moda e Casa, página inicial" className="-m-1.5 inline-flex rounded-sm p-1.5 text-white">
                <Logo className="h-14" />
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed">
                Moda com propósito: peças versáteis, confortáveis e feitas para durar, do básico ao especial.
              </p>

              {activeSocials.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Redes sociais">
                  {activeSocials.map((social) => (
                    <li key={social.name}>
                      <a
                        href={social.href}
                        aria-label={`Siga-nos no ${social.name}`}
                        className="flex size-11 items-center justify-center rounded-full border border-white/30 text-white transition-colors duration-200 hover:border-white hover:bg-white hover:text-footer"
                      >
                        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          {social.icon}
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {linkGroups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <FooterHeading>{group.title}</FooterHeading>
                <ul className="mt-4 space-y-1">
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="inline-block py-1.5 text-sm hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div>
              <FooterHeading>Atendimento</FooterHeading>
              <ul className="mt-4 space-y-3">
                {contacts.map((contact) => (
                  <li key={contact.label}>
                    <span className="block text-xs text-white/80">{contact.label}</span>
                    <a href={contact.href} className="text-sm break-all text-white hover:text-white">
                      {contact.value}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-white/80">
                {STORE.hours.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </div>

          {/* Parceiros e pagamento */}
          <div className="grid gap-8 border-t border-white/20 py-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <FooterHeading>Parceiros</FooterHeading>
              <ul className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
                {partners.map((partner) => (
                  <li key={partner} className="font-serif text-xl font-semibold text-white/80 transition-colors duration-200 hover:text-white">
                    {partner}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <FooterHeading>Formas de pagamento</FooterHeading>
              <ul className="mt-4 flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <li key={method} className="rounded-sm border border-white/30 px-3 py-1.5 text-xs font-semibold tracking-wide text-white">
                    {method}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Direitos, CNPJ e voltar ao topo */}
          <div className="flex flex-col gap-4 border-t border-white/20 py-8 text-xs text-white/80 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p>© {currentYear} {STORE.name}. Todos os direitos reservados.</p>
              <p>
                {STORE.legalName} · CNPJ {STORE.cnpj} · {STORE.address}
              </p>
            </div>
            {/* "#top" é especial no navegador: sobe ao topo de qualquer página */}
            <a
              href="#top"
              className="inline-flex items-center gap-2 self-start py-2 font-medium text-white hover:text-white sm:self-auto"
            >
              Voltar ao topo
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
