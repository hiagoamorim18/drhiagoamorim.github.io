/* Dr. Hiago Amorim — comportamento compartilhado por todas as páginas.
   Toda busca de elemento é protegida: uma página sem hero, sem menu ou sem
   contador não quebra o resto do script. */
(function () {
    'use strict';

    var $  = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var reduzMovimento = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ===== BARRA DE PROGRESSO ===== */
    var barra = $('#progress-bar');
    if (barra) {
        window.addEventListener('scroll', function () {
            var doc = document.documentElement;
            var altura = doc.scrollHeight - doc.clientHeight;
            barra.style.width = (altura > 0 ? (doc.scrollTop / altura) * 100 : 0) + '%';
        }, { passive: true });
    }

    /* ===== NAVBAR AO ROLAR ===== */
    var navbar = $('#navbar');
    if (navbar) {
        var aoRolar = function () {
            navbar.classList.toggle('scrolled', window.scrollY > 80);
        };
        window.addEventListener('scroll', aoRolar, { passive: true });
        aoRolar();
    }

    /* ===== FOTO DO HERO (só existe na home) ===== */
    var heroBg = $('#heroBg');
    if (heroBg) {
        if (document.readyState === 'complete') {
            heroBg.classList.add('loaded');
        } else {
            window.addEventListener('load', function () { heroBg.classList.add('loaded'); });
        }
    }

    /* ===== MENU MOBILE ===== */
    var hamburger = $('#hamburger');
    var menu = $('#mobileMenu');
    var fecharMenu = function () {};
    if (hamburger && menu) {
        fecharMenu = function () {
            menu.style.display = 'none';
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        };
        hamburger.addEventListener('click', function () {
            var aberto = menu.style.display === 'flex';
            menu.style.display = aberto ? 'none' : 'flex';
            hamburger.setAttribute('aria-expanded', String(!aberto));
            document.body.style.overflow = aberto ? '' : 'hidden';
        });
        $$('a', menu).forEach(function (a) { a.addEventListener('click', fecharMenu); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' || e.key === 'Esc') fecharMenu();
        });
    }
    /* o HTML do menu usa onclick="closeMobileMenu()" — manter global */
    window.closeMobileMenu = fecharMenu;

    /* ===== ANIMAÇÕES DE ENTRADA ===== */
    var alvos = $$('.animate-on-scroll');
    if (alvos.length) {
        if (reduzMovimento || !('IntersectionObserver' in window)) {
            alvos.forEach(function (el) { el.classList.add('visible'); });
        } else {
            var obs = new IntersectionObserver(function (entradas) {
                entradas.forEach(function (e) {
                    if (e.isIntersecting) {
                        e.target.classList.add('visible');
                        obs.unobserve(e.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            alvos.forEach(function (el) { obs.observe(el); });
        }
    }

    /* ===== ROLAGEM SUAVE EM ÂNCORAS ===== */
    $$('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var id = this.getAttribute('href');
            if (!id || id === '#') return;
            var alvo = document.querySelector(id);
            if (!alvo) return;
            e.preventDefault();
            window.scrollTo({
                top: alvo.getBoundingClientRect().top + window.pageYOffset - 72,
                behavior: reduzMovimento ? 'auto' : 'smooth'
            });
        });
    });

    /* ===== CONTADORES DO HERO ===== */
    var contadores = $$('[data-counter]');
    if (contadores.length && !reduzMovimento && 'IntersectionObserver' in window) {
        var obsNum = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) {
                if (!e.isIntersecting) return;
                var el = e.target;
                obsNum.unobserve(el);
                var destino = parseInt(el.getAttribute('data-counter'), 10);
                if (isNaN(destino)) return;
                var sufixo = el.textContent.replace(/[0-9]/g, '');
                var passo = destino / 60;
                var atual = 0;
                var t = setInterval(function () {
                    atual += passo;
                    if (atual >= destino) { atual = destino; clearInterval(t); }
                    el.textContent = Math.floor(atual) + sufixo;
                }, 2000 / 60);
            });
        }, { threshold: 0.5 });
        contadores.forEach(function (el) { obsNum.observe(el); });
    }
})();
