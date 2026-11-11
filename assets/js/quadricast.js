/* Migrado do tema legado do qsite-core. */
// Navbar Scroll Effect
        const nav = document.getElementById('mainNav');
        if (nav) {
            window.addEventListener('scroll', () => {
                const isBridge = nav.classList.contains('navbar-bridge-variant');
                if (window.scrollY > 50) {
                    nav.classList.add('scrolled');
                    if (!isBridge) {
                        nav.classList.add('shadow');
                        const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
                        if (isDark) {
                            nav.classList.add('bg-dark');
                            nav.classList.remove('bg-light');
                        } else {
                            nav.classList.add('bg-light');
                            nav.classList.remove('bg-dark');
                        }
                    }
                } else {
                    nav.classList.remove('bg-dark', 'bg-light', 'shadow', 'scrolled');
                }
            });
        }

        // Theme Toggle Script
        document.addEventListener('DOMContentLoaded', () => {
            const getStoredTheme = () => localStorage.getItem('qs-theme');
            const getPreferredTheme = () => {
                const storedTheme = getStoredTheme();
                if (storedTheme) return storedTheme;
                return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
            };
            const setTheme = theme => {
                document.documentElement.setAttribute('data-bs-theme', theme);
                localStorage.setItem('qs-theme', theme);
                
                // Adjust navbar background class if already scrolled
                if (nav && window.scrollY > 50) {
                    const isBridge = nav.classList.contains('navbar-bridge-variant');
                    if (!isBridge) {
                        if (theme === 'dark') {
                            nav.classList.add('bg-dark');
                            nav.classList.remove('bg-light');
                        } else {
                            nav.classList.add('bg-light');
                            nav.classList.remove('bg-dark');
                        }
                    }
                }
            };

            // Setup click listeners for both desktop and mobile toggle buttons
            const themeToggles = document.querySelectorAll('.theme-toggle-btn');
            themeToggles.forEach(btn => {
                btn.addEventListener('click', () => {
                    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                    setTheme(newTheme);
                });
            });

            // Floating buttons behavior
            const backToTopBtn = document.getElementById('floating-back-to-top');
            const whatsappBtn = document.getElementById('floating-whatsapp');
            
            const getIconHTML = (iconString, extraClass = '') => {
                if (!iconString) return '';
                if (iconString.trim().startsWith('<')) return iconString;
                if (iconString.includes(':')) {
                    const [type, iconName] = iconString.split(':');
                    return `<span class="${type} ${extraClass}">${iconName}</span>`;
                }
                let classes = iconString.trim();
                if (!classes.includes(' ') && !classes.includes('/') && !classes.includes(':')) {
                    classes = 'bi ' + classes;
                }
                return `<i class="${classes} ${extraClass}"></i>`;
            };

            const iconsConfig = (typeof CONFIG !== 'undefined' && CONFIG.brand && CONFIG.brand.icons) ? CONFIG.brand.icons : {};
            const whatsappIconClass = iconsConfig.whatsapp || 'bi bi-whatsapp';
            const backToTopIconClass = iconsConfig.back_to_top || 'bi bi-arrow-up';

            if (whatsappBtn) {
                whatsappBtn.innerHTML = getIconHTML(whatsappIconClass, 'fs-5');
            }
            if (backToTopBtn) {
                backToTopBtn.innerHTML = getIconHTML(backToTopIconClass, 'fs-5');
            }
            
            if (backToTopBtn) {
                window.addEventListener('scroll', () => {
                    if (window.scrollY > 300) {
                        backToTopBtn.classList.remove('d-none');
                        backToTopBtn.classList.add('d-flex');
                    } else {
                        backToTopBtn.classList.add('d-none');
                        backToTopBtn.classList.remove('d-flex');
                    }
                });
                
                backToTopBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
            
            const hasMessaging = typeof CONFIG !== 'undefined' && CONFIG.messaging && Array.isArray(CONFIG.messaging.channels) && CONFIG.messaging.channels.length > 0;
            if (whatsappBtn && !hasMessaging && typeof CONFIG !== 'undefined' && CONFIG.social && CONFIG.social.whatsapp) {
                whatsappBtn.href = CONFIG.social.whatsapp;
                whatsappBtn.classList.remove('d-none');
                whatsappBtn.classList.add('d-flex');
            }

            // === GLOBAL SCROLL REVEAL SYSTEM ===
            const animateElements = document.querySelectorAll('section, .card, .portal-card, .bio-link-card');
            
            animateElements.forEach((el) => {
                if (el.classList.contains('no-reveal')) return;
                
                // Add base animation class
                el.classList.add('reveal-up');
                
                // Check if element is already above the fold
                const rect = el.getBoundingClientRect();
                const isAboveFold = rect.top < window.innerHeight;
                if (isAboveFold) {
                    el.classList.add('revealed');
                }
                
                // Apply stagger delays to items inside rows
                const col = el.closest('.col, [class*="col-"]') || el;
                const row = col.parentElement;
                if (row && row.classList.contains('row')) {
                    const siblings = Array.from(row.children);
                    const idx = siblings.indexOf(col);
                    if (idx > 0) {
                        el.classList.add(`reveal-delay-${Math.min(idx, 5)}`);
                    }
                }
            });

            // Intersection Observer
            if ('IntersectionObserver' in window) {
                const revealObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('revealed');
                            revealObserver.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0.05,
                    rootMargin: '0px 0px -40px 0px'
                });
                
                animateElements.forEach(el => {
                    if (!el.classList.contains('revealed') && !el.classList.contains('no-reveal')) {
                        revealObserver.observe(el);
                    }
                });
            } else {
                // Fallback for older browsers
                animateElements.forEach(el => el.classList.add('revealed'));
            }
        });

(function () {
            const siteKey = "";
            if (siteKey && siteKey !== "" && siteKey !== "{" + "T" + "URNSTILE_SITE_KEY" + "}") {
                const container = document.getElementById('hero-turnstile-container');
                if (container) {
                    const ts = document.createElement('div');
                    ts.className = 'cf-turnstile';
                    ts.dataset.sitekey = siteKey;
                    ts.dataset.theme = 'dark';
                    container.appendChild(ts);

                    if (!document.querySelector('script[src*="turnstile/v0/api.js"]')) {
                        const script = document.createElement('script');
                        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
                        script.async = true;
                        script.defer = true;
                        document.head.appendChild(script);
                    }
                }
            }
        })();

document.addEventListener('DOMContentLoaded', function () {
            const cards = Array.from(document.querySelectorAll('.gallery-masonry-card-Portfolio'));
            const lightbox = document.getElementById('galleryLightbox-Portfolio');
            const lightboxImg = document.getElementById('lightboxImg-Portfolio');
            const lightboxTitle = document.getElementById('lightboxTitle-Portfolio');
            const lightboxDesc = document.getElementById('lightboxDesc-Portfolio');
            const closeBtn = lightbox.querySelector('.lightbox-close');
            const prevBtn = lightbox.querySelector('.lightbox-prev');
            const nextBtn = lightbox.querySelector('.lightbox-next');

            let currentIndex = 0;

            function showImage(index) {
                if (index < 0 || index >= cards.length) return;
                currentIndex = index;

                const card = cards[currentIndex];
                const url = card.getAttribute('data-image-url');
                const title = card.getAttribute('data-title');
                const desc = card.getAttribute('data-description');

                lightboxImg.src = url;
                lightboxTitle.textContent = title || '';
                lightboxDesc.textContent = desc || '';
            }

            cards.forEach((card, index) => {
                card.addEventListener('click', () => {
                    lightbox.classList.add('show');
                    showImage(index);
                    document.body.style.overflow = 'hidden'; // Impede scroll
                });
            });

            function closeLightbox() {
                lightbox.classList.remove('show');
                document.body.style.overflow = '';
            }

            closeBtn.addEventListener('click', closeLightbox);

            lightbox.addEventListener('click', function (e) {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });

            prevBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                let prev = currentIndex - 1;
                if (prev < 0) prev = cards.length - 1;
                showImage(prev);
            });

            nextBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                let next = currentIndex + 1;
                if (next >= cards.length) next = 0;
                showImage(next);
            });

            // Navegação pelo teclado
            document.addEventListener('keydown', function (e) {
                if (!lightbox.classList.contains('show')) return;

                if (e.key === 'Escape') {
                    closeLightbox();
                } else if (e.key === 'ArrowLeft') {
                    let prev = currentIndex - 1;
                    if (prev < 0) prev = cards.length - 1;
                    showImage(prev);
                } else if (e.key === 'ArrowRight') {
                    let next = currentIndex + 1;
                    if (next >= cards.length) next = 0;
                    showImage(next);
                }
            });
        });

{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://quadricast.com.br/quadricast/#faq",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Posso apenas alugar o estúdio?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim. A locação está disponível para criadores e equipes que já possuem produção própria. Também é possível contratar o estúdio com operador técnico incluso ou optar pelo pacote de produção completa com direção e edição."
            }
        },
        {
            "@type": "Question",
            "name": "Preciso levar minha própria equipe de suporte?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Não necessariamente. A equipe da Quadricast pode absorver toda a operação técnica — cuidando de pré-produção, iluminação, microfonação, enquadramentos, direção de corte, edição e pós-produção de desdobramentos."
            }
        },
        {
            "@type": "Question",
            "name": "Vocês produzem podcasts e videocasts do zero?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim. Participamos desde a concepção do formato, dinâmica e alinhamento de pauta até a captação multicâmera, edição de blocos, vinhetas, cortes verticais legendados e arquivos finais organizados para distribuição."
            }
        },
        {
            "@type": "Question",
            "name": "É possível realizar transmissões ao vivo (lives)?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim. Realizamos transmissões ao vivo de padrão broadcast com tecnologia multicâmera e latência controlada, integradas ao YouTube, LinkedIn, plataformas privadas corporativas ou sistemas híbridos de eventos."
            }
        },
        {
            "@type": "Question",
            "name": "Vocês realizam gravações fora do estúdio?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim. Transportamos equipamentos e equipe para empresas, fábricas, congressos, feiras e convenções. Nossa equipe faz uma avaliação prévia de acústica, energia e conectividade para garantir estabilidade e previsibilidade."
            }
        },
        {
            "@type": "Question",
            "name": "Como funciona o estúdio de culinária e gastronomia?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "É um espaço especializado com bancada operacional funcional, pia, iluminação desenhada para realçar textura de ingredientes e infraestrutura para programas de receitas, degustações, branded content e cursos práticos."
            }
        },
        {
            "@type": "Question",
            "name": "Vocês editam e entregam cortes prontos para redes sociais?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim. Em cada projeto podemos estruturar um pacote de desdobramentos com cortes verticais (9:16), teasers dinâmicos, legendas sincronizadas e materiais pensados especificamente para Reels, TikTok, YouTube Shorts e LinkedIn."
            }
        },
        {
            "@type": "Question",
            "name": "Como é calculado o orçamento de um projeto?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "O investimento é dimensionado conforme a duração da captação, o formato desejado, a quantidade de câmeras, necessidade de estúdio móvel externo, pós-produção e número de entregas. Nossa equipe avalia sua demanda e monta a proposta ideal."
            }
        }
    ]
}

document.addEventListener('DOMContentLoaded',function(){
var cards=Array.from(document.querySelectorAll('.catalog-card'));
if(!cards.length)return;
var lb=document.getElementById('catalogLightbox'),gi=document.getElementById('lightboxImg'),gt=document.getElementById('lightboxTitle'),gd=document.getElementById('lightboxDesc'),cq=lb.querySelector('.lightbox-close'),cp=lb.querySelector('.lightbox-prev'),cn=lb.querySelector('.lightbox-next'),ci=0;
function si(j){if(j<0||j>=cards.length)return;ci=j;var a=cards[ci];gi.src=a.getAttribute('data-image-url');gt.textContent=a.getAttribute('data-title')||'';gd.textContent=a.getAttribute('data-description')||''}
cards.forEach(function(a,k){a.addEventListener('click',function(){lb.classList.add('show');si(k);document.body.style.overflow='hidden'})});
function cl(){lb.classList.remove('show');document.body.style.overflow=''}
cq.addEventListener('click',cl);lb.addEventListener('click',function(e){if(e.target===lb)cl()});
cp.addEventListener('click',function(e){e.stopPropagation();var k=ci-1;if(k<0)k=cards.length-1;si(k)});
cn.addEventListener('click',function(e){e.stopPropagation();var k=ci+1;if(k>=cards.length)k=0;si(k)});
document.addEventListener('keydown',function(e){if(!lb.classList.contains('show'))return;if(e.key==='Escape')cl();else if(e.key==='ArrowLeft'){var k=ci-1;if(k<0)k=cards.length-1;si(k)}else if(e.key==='ArrowRight'){var k=ci+1;if(k>=cards.length)k=0;si(k)}})
});

setTimeout(function() {
                var cta = document.getElementById('vsl-cta-container');
                if (cta) {
                    cta.classList.remove('d-none');
                }
            }, 5000);

(function() {
                var targetDate = new Date("2026-12-31T23:59:59").getTime();
                var timer = setInterval(function() {
                    var now = new Date().getTime();
                    var distance = targetDate - now;

                    if (distance < 0) {
                        clearInterval(timer);
                        var box = document.getElementById("timer-box");
                        if (box) {
                            box.innerHTML = "<div class='alert alert-warning rounded-4 px-4 py-3 w-100'>A oferta expirou!</div>";
                        }
                        return;
                    }

                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    var dEl = document.getElementById("timer-days");
                    var hEl = document.getElementById("timer-hours");
                    var mEl = document.getElementById("timer-minutes");
                    var sEl = document.getElementById("timer-seconds");

                    if (dEl) dEl.innerText = String(days).padStart(2, '0');
                    if (hEl) hEl.innerText = String(hours).padStart(2, '0');
                    if (mEl) mEl.innerText = String(minutes).padStart(2, '0');
                    if (sEl) sEl.innerText = String(seconds).padStart(2, '0');
                }, 1000);
            })();

document.addEventListener('DOMContentLoaded',function(){
var cards=Array.from(document.querySelectorAll('.catalog-card'));
if(!cards.length)return;
var lb=document.getElementById('catalogLightbox'),gi=document.getElementById('lightboxImg'),gt=document.getElementById('lightboxTitle'),gd=document.getElementById('lightboxDesc'),cq=lb.querySelector('.lightbox-close'),cp=lb.querySelector('.lightbox-prev'),cn=lb.querySelector('.lightbox-next'),ci=0;
function si(j){if(j<0||j>=cards.length)return;ci=j;var a=cards[ci];gi.src=a.getAttribute('data-image-url');gt.textContent=a.getAttribute('data-title')||'';gd.textContent=a.getAttribute('data-description')||''}
cards.forEach(function(a,k){a.addEventListener('click',function(){lb.classList.add('show');si(k);document.body.style.overflow='hidden'})});
function cl(){lb.classList.remove('show');document.body.style.overflow=''}
cq.addEventListener('click',cl);lb.addEventListener('click',function(e){if(e.target===lb)cl()});
cp.addEventListener('click',function(e){e.stopPropagation();var k=ci-1;if(k<0)k=cards.length-1;si(k)});
cn.addEventListener('click',function(e){e.stopPropagation();var k=ci+1;if(k>=cards.length)k=0;si(k)});
document.addEventListener('keydown',function(e){if(!lb.classList.contains('show'))return;if(e.key==='Escape')cl();else if(e.key==='ArrowLeft'){var k=ci-1;if(k<0)k=cards.length-1;si(k)}else if(e.key==='ArrowRight'){var k=ci+1;if(k>=cards.length)k=0;si(k)}})
});
