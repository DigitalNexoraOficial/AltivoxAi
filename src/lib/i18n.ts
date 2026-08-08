export type Lang = "es" | "en";

export type Dictionary = {
  nav: Record<string, string>;
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    desc: string;
    cta1: string;
    cta2: string;
    risk: string;
  };
  services: {
    eyebrow: string;
    title: string;
    sub: string;
    filters: { id: string; label: string }[];
    items: {
      id: string;
      category: string;
      title: string;
      short: string;
      long: string;
    }[];
    seeDetails: string;
  };
  offers: {
    eyebrow: string;
    title: string;
    sub: string;
    items: { title: string; price: string; desc: string; cta: string }[];
  };
  about: { eyebrow: string; title: string; desc: string; points: string; cta: string };
  cases: {
    eyebrow: string;
    title: string;
    sub: string;
    items: { title: string; text: string; m1: string; m2: string }[];
  };
  calc: {
    eyebrow: string;
    title: string;
    sub: string;
    hours: string;
    savings: string;
    placeholder: string;
    btn: string;
    success: string;
  };
  lead: {
    eyebrow: string;
    title: string;
    desc: string;
    placeholder: string;
    btn: string;
    success: string;
    openPdf: string;
  };
  sim: {
    eyebrow: string;
    title: string;
    btnCode: string;
    btnScript: string;
    btnEcom: string;
    idle: string;
  };
  blog: {
    eyebrow: string;
    title: string;
    sub: string;
    read: string;
    items: { meta: string; title: string; short: string; long: string }[];
  };
  testi: {
    eyebrow: string;
    title: string;
    sub: string;
    items: { quote: string; role: string }[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: { q: string; a: string }[];
  };
  contact: {
    eyebrow: string;
    title: string;
    sub: string;
    emailLbl: string;
    waLbl: string;
    waLink: string;
    webLbl: string;
    phName: string;
    phEmail: string;
    phCompany: string;
    phMessage: string;
    btn: string;
    success: string;
  };
  footer: { slogan: string; legal: string };
  chat: {
    open: string;
    close: string;
    placeholder: string;
    send: string;
    voice: string;
    file: string;
  };
  common: { theme: string; lang: string; menu: string; top: string };
};

export const dictionaries: Record<Lang, Dictionary> = {
  es: {
    nav: {
      home: "Inicio",
      services: "Ecosistema",
      offers: "Ofertas",
      cases: "Casos de Éxito",
      calc: "Calculadora ROI",
      guide: "Guía IA",
      blog: "Insights",
      testi: "Testimonios",
      faq: "FAQ",
      contact: "Contacto",
    },
    hero: {
      eyebrow: "Agencia IA para pymes · España · Primera llamada gratis",
      title: "Más leads.",
      titleAccent: "Menos trabajo manual",
      desc: "Chatbots, automatización de leads y agentes de IA con precio cerrado. Empieza con un piloto de 7 días o una llamada de 15 minutos sin compromiso.",
      cta1: "Ver ofertas y precios",
      cta2: "Pedir piloto 7 días",
      risk: "Riesgo bajo · Precio cerrado · Entrega en días, no meses",
    },
    services: {
      eyebrow: "Servicios",
      title: "IA aplicada donde aporta retorno",
      sub: "Chatbots, automatización e integraciones en producción — no demos que caducan. Pilotos acotados y precio cerrado para pymes.",
      filters: [
        { id: "all", label: "Todos" },
        { id: "web", label: "Web & producto" },
        { id: "ai", label: "IA & agentes" },
        { id: "cloud", label: "Integraciones & e‑com" },
      ],
      items: [
        {
          id: "svc1",
          category: "web",
          title: "Desarrollo web con IA",
          short: "Landings, paneles y apps a medida conectados a CRM, agentes y automatizaciones.",
          long: "Diseñamos y desplegamos webs y paneles que no se quedan en escaparate: formularios, chat, scoring y flujos comerciales integrados. Ideal si necesitas una herramienta propia, no un SaaS genérico.",
        },
        {
          id: "svc2",
          category: "ai",
          title: "Chatbots y agentes conversacionales",
          short: "Web y WhatsApp 24/7: responden FAQs, cualifican leads y escalan a humano.",
          long: "Asistentes entrenados con tu oferta, tono y reglas de negocio. Recogen contacto, agendan o derivan al equipo cuando hace falta. Multicanal (web, WhatsApp, email) con handoff claro.",
        },
        {
          id: "svc3",
          category: "ai",
          title: "Automatización de procesos y leads",
          short: "De formulario a CRM y seguimiento sin copiar datos a mano.",
          long: "Workflows que conectan captación, scoring, alertas, email y cola comercial. Eliminamos tareas repetitivas para que tu equipo solo entre en oportunidades calientes.",
        },
        {
          id: "svc4",
          category: "cloud",
          title: "Integraciones y stack cloud",
          short: "CRM, email, WhatsApp y dashboards en un flujo único y medible.",
          long: "Conectamos las herramientas que ya usas para que la IA vea contexto real (leads, pedidos, FAQs). Seguridad, trazabilidad y métricas desde el día uno.",
        },
        {
          id: "svc5",
          category: "ai",
          title: "Contenido y operaciones con IA",
          short: "Pipelines de copy, redes y ops que escalan sin ampliar plantilla.",
          long: "Agentes asistidos con supervisión humana para contenido, reporting y operaciones internas. Menos trabajo manual, más consistencia de marca.",
        },
        {
          id: "svc6",
          category: "cloud",
          title: "E‑commerce con agentes",
          short: "Atención, pedidos y upsell conectados a tu catálogo y stock.",
          long: "Chat y automatizaciones sobre envíos, disponibilidad y postventa. Soporte 24/7 en lo repetitivo; humanos para lo complejo. Reporting en tiempo real.",
        },
      ],
      seeDetails: "Ver detalles",
    },
    offers: {
      eyebrow: "Precios",
      title: "Paquetes con precio cerrado",
      sub: "Alineados con el mercado de agencias IA en España. Alcance confirmado en la llamada gratuita de 15 minutos · sin permanencia.",
      items: [
        {
          title: "Chatbot web con IA",
          price: "desde 990€",
          desc: "Widget en tu web entrenado con tu oferta: responde FAQs, cualifica leads, captura contacto y te avisa al instante. Entrega típica en ~7 días. Ideal para el primer piloto.",
          cta: "Empezar piloto",
        },
        {
          title: "Automatización de leads",
          price: "desde 1.890€",
          desc: "Captura → score → CRM → alertas y secuencias de seguimiento. Varios flujos e integraciones estándar para que no se enfríe ninguna oportunidad.",
          cta: "Pedir presupuesto",
        },
        {
          title: "Agentes IA + operaciones",
          price: "desde 2.990€",
          desc: "Varios agentes, chatbot o WhatsApp, integraciones y panel de métricas. El paquete para operar atención y ventas con IA de forma seria.",
          cta: "Agendar llamada",
        },
      ],
    },
    about: {
      eyebrow: "AltivoxAi",
      title: "Equipo en España, foco en pymes",
      desc: "Somos un equipo en España enfocado en pymes que quieren vender y atender mejor con IA, sin jerga innecesaria. Diseñamos, desplegamos y dejamos el sistema listo para usar.",
      points:
        "· Contacto directo: info@altivoxai.es\n· Web y demos en vivo: www.altivoxai.es\n· Trabajos recientes en hostelería, e‑commerce y automatización comercial",
      cta: "Hablar con el equipo",
    },
    cases: {
      eyebrow: "Casos",
      title: "Resultados reales",
      sub: "Empresas que ya automatizaron captura y seguimiento con AltivoxAi.",
      items: [
        {
          title: "Hostelería · Reserva y leads",
          text: "Chatbot + alertas redujeron tiempo de respuesta y subieron reservas cualificadas.",
          m1: "−60% tiempo respuesta",
          m2: "+28% leads útiles",
        },
        {
          title: "E-commerce · Atención 24/7",
          text: "Agente de soporte filtró FAQs y escaló solo incidencias reales al equipo.",
          m1: "24/7 cobertura",
          m2: "−40% tickets repetidos",
        },
      ],
    },
    calc: {
      eyebrow: "ROI",
      title: "Calculadora de ahorro",
      sub: "Estima el impacto de automatizar horas repetitivas en tu operación.",
      hours: "Horas manuales / mes",
      savings: "Ahorro estimado mensual",
      placeholder: "Tu correo corporativo...",
      btn: "Desbloquear Informe",
      success: "Informe registrado. Te contactamos pronto.",
    },
    lead: {
      eyebrow: "Recurso exclusivo CRO",
      title: "Guía de Automatización con IA para Empresas",
      desc: "Descubre los protocolos exactos para integrar agentes inteligentes y optimizar procesos corporativos en menos de 7 días.",
      placeholder: "Tu correo corporativo...",
      btn: "Descargar Guía Gratis",
      success: "Guía lista.",
      openPdf: "Abrir PDF",
    },
    sim: {
      eyebrow: "Entorno de prueba",
      title: "Simulador neural en vivo",
      btnCode: "Generar Código",
      btnScript: "Crear Guion",
      btnEcom: "E-Commerce",
      idle: "// Selecciona una opción superior para inicializar el núcleo de procesamiento de AltivoxAi...",
    },
    blog: {
      eyebrow: "Liderazgo técnico",
      title: "Insights & tendencias IA",
      sub: "Artículos y análisis sobre el futuro del desarrollo web y la automatización corporativa.",
      read: "Leer artículo →",
      items: [
        {
          meta: "Julio 2026 · 4 min",
          title: "El impacto de las PWAs móviles en la retención",
          short: "Cómo las arquitecturas web progresivas sustituyen apps nativas en empresas emergentes.",
          long: "PWA + SPA + IA mejoran retención, velocidad y conversión con despliegue cloud.",
        },
        {
          meta: "Julio 2026 · 6 min",
          title: "Agentes LLM autónomos 24/7",
          short: "Estrategias de integración de modelos para operaciones continuas.",
          long: "CRM, WhatsApp, email, memoria conversacional y métricas de ROI.",
        },
        {
          meta: "Junio 2026 · 5 min",
          title: "E-Commerce escalable sin stock previo",
          short: "Canales online que minimizan riesgo con flujos automatizados.",
          long: "Catálogo, pedidos, pagos y fulfillment con control de margen.",
        },
      ],
    },
    testi: {
      eyebrow: "Clientes",
      title: "Lo que dicen nuestros clientes",
      sub: "Empresas que ya han automatizado procesos y acelerado su crecimiento con AltivoxAi.",
      items: [
        {
          quote:
            "La automatización implantada por AltivoxAi redujo el tiempo de atención y mejoró nuestra conversión desde la primera semana.",
          role: "Director Comercial",
        },
        {
          quote:
            "Ahora generamos contenido para redes de forma automática. Hemos multiplicado presencia digital sin aumentar costes.",
          role: "CEO · Agencia Digital",
        },
        {
          quote:
            "Todo el proceso fue rápido y profesional. Hoy disponemos de infraestructura moderna lista para crecer.",
          role: "Fundador · Startup Tecnológica",
        },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Resolvemos tus dudas",
      items: [
        {
          q: "¿Qué tipo de empresas pueden trabajar con AltivoxAi?",
          a: "Pymes y equipos comerciales que quieren captar y atender mejor con IA, sin un departamento técnico interno.",
        },
        {
          q: "¿Cuánto tiempo tarda un proyecto?",
          a: "El piloto de chatbot puede estar en 7 días. Automatizaciones y agentes dependen del alcance confirmado en la llamada.",
        },
        {
          q: "¿Necesito conocimientos técnicos?",
          a: "No. Nosotros desplegamos y te dejamos el sistema listo para usar.",
        },
        {
          q: "¿Podéis integrar la IA con mis herramientas actuales?",
          a: "Sí: web, CRM, email y flujos habituales. Lo concretamos en la llamada de 15 minutos.",
        },
        {
          q: "¿Qué soporte ofrecéis después de la entrega?",
          a: "Acompañamiento post-lanzamiento y mejoras iterativas según el paquete.",
        },
        {
          q: "¿Cuánto cuesta y hay sorpresas?",
          a: "Precio cerrado por paquete. El alcance exacto se confirma antes de empezar.",
        },
        {
          q: "¿Qué necesitáis de mi lado para empezar?",
          a: "Acceso a web/dominio, email de contacto, FAQs y, si aplica, CRM.",
        },
        {
          q: "¿Cumplís con privacidad / GDPR?",
          a: "Sí. Tratamos datos conforme a la normativa aplicable y puedes ejercer tus derechos en info@altivoxai.es.",
        },
      ],
    },
    contact: {
      eyebrow: "Contacto",
      title: "Primera llamada gratis",
      sub: "15 minutos para elegir paquete, confirmar precio cerrado y decidir si quieres el piloto de 7 días. Sin compromiso.",
      emailLbl: "Email",
      waLbl: "WhatsApp",
      waLink: "Solicita una reunión",
      webLbl: "Sitio web",
      phName: "Nombre",
      phEmail: "Correo electrónico",
      phCompany: "Empresa (Opcional)",
      phMessage: "¿Qué paquete te interesa? Chatbot 7 días / Automatización / Agentes…",
      btn: "Pedir llamada gratis",
      success: "Mensaje enviado. Te respondemos lo antes posible.",
    },
    footer: {
      slogan: "Ecosistema de Inteligencia Artificial & Automatización.",
      legal: "Términos y Condiciones",
    },
    chat: {
      open: "Abrir chat",
      close: "Cerrar chat",
      placeholder: "Escribe tu mensaje...",
      send: "Enviar",
      voice: "Usar voz",
      file: "Adjuntar archivo",
    },
    common: {
      theme: "Cambiar tema",
      lang: "Cambiar idioma",
      menu: "Abrir menú",
      top: "Volver arriba",
    },
  },
  en: {
    nav: {
      home: "Home",
      services: "Ecosystem",
      offers: "Offers",
      cases: "Case studies",
      calc: "ROI Calculator",
      guide: "AI Guide",
      blog: "Insights",
      testi: "Testimonials",
      faq: "FAQ",
      contact: "Contact",
    },
    hero: {
      eyebrow: "AI agency for SMBs · Spain · Free first call",
      title: "More leads.",
      titleAccent: "Less manual work",
      desc: "Chatbots, lead automation and AI agents with fixed pricing. Start with a 7-day pilot or a free 15-minute call.",
      cta1: "See offers & pricing",
      cta2: "Request 7-day pilot",
      risk: "Low risk · Fixed price · Delivered in days, not months",
    },
    services: {
      eyebrow: "Services",
      title: "AI where it drives ROI",
      sub: "Chatbots, automation and integrations in production — not demos that expire. Scoped pilots and fixed pricing for SMBs.",
      filters: [
        { id: "all", label: "All" },
        { id: "web", label: "Web & product" },
        { id: "ai", label: "AI & agents" },
        { id: "cloud", label: "Integrations & e‑com" },
      ],
      items: [
        {
          id: "svc1",
          category: "web",
          title: "AI-ready web development",
          short: "Landings, dashboards and custom apps wired to CRM, agents and automations.",
          long: "We ship websites and panels that convert: forms, chat, scoring and sales flows built in. Best when you need a tailored tool — not a generic SaaS.",
        },
        {
          id: "svc2",
          category: "ai",
          title: "Chatbots & conversational agents",
          short: "Web and WhatsApp 24/7: FAQs, lead qualification and human handoff.",
          long: "Agents trained on your offer, tone and business rules. They capture contact, book or escalate when needed — multi-channel with clean handoff.",
        },
        {
          id: "svc3",
          category: "ai",
          title: "Process & lead automation",
          short: "From form to CRM and follow-up — no more copy-paste.",
          long: "Workflows connecting capture, scoring, alerts, email and sales queues so your team only joins hot opportunities.",
        },
        {
          id: "svc4",
          category: "cloud",
          title: "Integrations & cloud stack",
          short: "CRM, email, WhatsApp and dashboards in one measurable flow.",
          long: "We connect the tools you already use so AI sees real context. Security, traceability and metrics from day one.",
        },
        {
          id: "svc5",
          category: "ai",
          title: "AI content & operations",
          short: "Copy, social and ops pipelines that scale without headcount.",
          long: "Human-supervised agents for content, reporting and internal ops — less busywork, more brand consistency.",
        },
        {
          id: "svc6",
          category: "cloud",
          title: "E‑commerce with agents",
          short: "Support, orders and upsell tied to catalog and stock.",
          long: "Chat and automations for shipping, availability and after-sales. 24/7 on repetitive queries; humans for the complex. Live reporting.",
        },
      ],
      seeDetails: "See details",
    },
    offers: {
      eyebrow: "Pricing",
      title: "Fixed-price packages",
      sub: "Benchmarked against Spanish AI agency market rates. Exact scope confirmed on the free 15-minute call · no lock-in.",
      items: [
        {
          title: "AI web chatbot",
          price: "from €990",
          desc: "Site widget trained on your offer: answers FAQs, qualifies leads, captures contact and alerts you instantly. Typical delivery ~7 days. Ideal first pilot.",
          cta: "Start pilot",
        },
        {
          title: "Lead automation",
          price: "from €1,890",
          desc: "Capture → score → CRM → alerts and follow-up sequences. Multiple flows and standard integrations so opportunities never go cold.",
          cta: "Request quote",
        },
        {
          title: "AI agents + operations",
          price: "from €2,990",
          desc: "Multiple agents, web or WhatsApp chat, integrations and metrics dashboard — the package to run sales and support on AI seriously.",
          cta: "Book a call",
        },
      ],
    },
    about: {
      eyebrow: "AltivoxAi",
      title: "Spain-based team, SMB focus",
      desc: "We help SMBs sell and support better with AI — without unnecessary jargon.",
      points:
        "· Direct contact: info@altivoxai.es\n· Live site & demos: www.altivoxai.es\n· Recent work in hospitality, e-commerce and sales automation",
      cta: "Talk to the team",
    },
    cases: {
      eyebrow: "Cases",
      title: "Real outcomes",
      sub: "Companies that already automated capture and follow-up with AltivoxAi.",
      items: [
        {
          title: "Hospitality · Booking & leads",
          text: "Chatbot + alerts cut response time and raised qualified bookings.",
          m1: "−60% response time",
          m2: "+28% useful leads",
        },
        {
          title: "E-commerce · 24/7 support",
          text: "Support agent filtered FAQs and escalated only real issues.",
          m1: "24/7 coverage",
          m2: "−40% repeat tickets",
        },
      ],
    },
    calc: {
      eyebrow: "ROI",
      title: "Savings calculator",
      sub: "Estimate the impact of automating repetitive hours in your operation.",
      hours: "Manual hours / month",
      savings: "Estimated monthly savings",
      placeholder: "Your corporate email...",
      btn: "Unlock report",
      success: "Report registered. We'll contact you soon.",
    },
    lead: {
      eyebrow: "Exclusive CRO resource",
      title: "AI Automation Guide for Businesses",
      desc: "Discover the protocols to integrate intelligent agents and optimize corporate processes in under 7 days.",
      placeholder: "Your corporate email...",
      btn: "Download free guide",
      success: "Guide ready.",
      openPdf: "Open PDF",
    },
    sim: {
      eyebrow: "Test environment",
      title: "Live neural simulator",
      btnCode: "Generate code",
      btnScript: "Create script",
      btnEcom: "E-Commerce",
      idle: "// Select an option above to initialize the AltivoxAi processing core...",
    },
    blog: {
      eyebrow: "Technical leadership",
      title: "Insights & AI trends",
      sub: "Articles on the future of web development and corporate automation.",
      read: "Read article →",
      items: [
        {
          meta: "July 2026 · 4 min",
          title: "Mobile PWAs and retention",
          short: "How progressive web architectures replace native apps.",
          long: "PWA + SPA + AI improve retention, speed and conversion.",
        },
        {
          meta: "July 2026 · 6 min",
          title: "Autonomous LLM agents 24/7",
          short: "Integration strategies for continuous operations.",
          long: "CRM, WhatsApp, email, memory and ROI metrics.",
        },
        {
          meta: "June 2026 · 5 min",
          title: "Scalable e-commerce without prior stock",
          short: "Online channels that reduce risk with automated flows.",
          long: "Catalog, orders, payments and fulfillment with margin control.",
        },
      ],
    },
    testi: {
      eyebrow: "Clients",
      title: "What our clients say",
      sub: "Companies that automated processes and accelerated growth with AltivoxAi.",
      items: [
        {
          quote:
            "AltivoxAi automation reduced response time and improved conversion from week one.",
          role: "Sales Director",
        },
        {
          quote:
            "We now generate social content automatically and grew presence without raising costs.",
          role: "CEO · Digital Agency",
        },
        {
          quote:
            "Fast and professional. We now have modern infrastructure ready to scale.",
          role: "Founder · Tech Startup",
        },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Answers to common questions",
      items: [
        {
          q: "What kind of companies work with AltivoxAi?",
          a: "SMBs and sales teams that want to capture and support better with AI.",
        },
        {
          q: "How long does a project take?",
          a: "Chatbot pilots can ship in 7 days. Broader scope is confirmed on the call.",
        },
        {
          q: "Do I need technical knowledge?",
          a: "No. We deploy and leave the system ready to use.",
        },
        {
          q: "Can you integrate with our current tools?",
          a: "Yes — web, CRM, email and common flows.",
        },
        {
          q: "What support do you offer after delivery?",
          a: "Post-launch support and iterative improvements per package.",
        },
        {
          q: "How much does it cost?",
          a: "Fixed package pricing. Scope confirmed before we start.",
        },
        {
          q: "What do you need from us to start?",
          a: "Site/domain access, contact email, FAQs and CRM if relevant.",
        },
        {
          q: "Do you comply with privacy / GDPR?",
          a: "Yes. Contact info@altivoxai.es for data rights.",
        },
      ],
    },
    contact: {
      eyebrow: "Contact",
      title: "Free first call",
      sub: "15 minutes to pick a package, confirm fixed pricing and decide on the 7-day pilot.",
      emailLbl: "Email",
      waLbl: "WhatsApp",
      waLink: "Request a meeting",
      webLbl: "Website",
      phName: "Name",
      phEmail: "Email",
      phCompany: "Company (optional)",
      phMessage: "Which package interests you? 7-day chatbot / Automation / Agents…",
      btn: "Request free call",
      success: "Message sent. We'll reply soon.",
    },
    footer: {
      slogan: "Artificial Intelligence & Automation ecosystem.",
      legal: "Terms & Conditions",
    },
    chat: {
      open: "Open chat",
      close: "Close chat",
      placeholder: "Write your message...",
      send: "Send",
      voice: "Use voice",
      file: "Attach file",
    },
    common: {
      theme: "Toggle theme",
      lang: "Change language",
      menu: "Open menu",
      top: "Back to top",
    },
  },
};
