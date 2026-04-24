document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       0. NAVIGATION MOBILE
       ========================================== */
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('active');
            mobileMenu.hidden = !isOpen;
            mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
            mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
            mobileMenuToggle.innerHTML = isOpen
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenu.hidden = true;
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.setAttribute('aria-label', 'Ouvrir le menu');
                mobileMenuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                mobileMenu.hidden = true;
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.setAttribute('aria-label', 'Ouvrir le menu');
                mobileMenuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            }
        });
    }

    /* ==========================================
       1. SCROLL REVEAL ANIMATIONS
       ========================================== */
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-top');
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    
    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);
    revealElements.forEach(el => revealOnScroll.observe(el));

    // Navbar animation initiale
    setTimeout(() => { document.querySelector('.navbar')?.classList.add('active'); }, 100);

    /* ==========================================
       2. NAVBAR EFFETS
       ========================================== */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = "0.2rem 0";
            navbar.style.boxShadow = "var(--shadow-sm)";
        } else {
            navbar.style.padding = "0";
            navbar.style.boxShadow = "none";
        }
    });

    /* ==========================================
       3. DARK MODE TOGGLE
       ========================================== */
    const themeToggle = document.getElementById('theme-toggle');
    const rootElement = document.documentElement;
    // Vérification du localStorage
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        rootElement.setAttribute('data-theme', 'dark');
        if(themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
    
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (rootElement.getAttribute('data-theme') === 'dark') {
                rootElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
            } else {
                rootElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            }
        });
    }

    /* ==========================================
       4. ANIMATION DES STATISTIQUES (COMPTEURS)
       ========================================== */
    const counters = document.querySelectorAll('.counter-value');
    let animated = false;
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    let count = 0;
                    const duration = 2000; // 2 secondes
                    const increment = target / (duration / 30); // 30ms par frame
                    
                    const updateCount = () => {
                        count += increment;
                        if (count < target) {
                            counter.innerText = Math.ceil(count).toLocaleString('fr-FR');
                            setTimeout(updateCount, 30);
                        } else {
                            counter.innerText = target.toLocaleString('fr-FR');
                        }
                    };
                    updateCount();
                });
                animated = true; // S'assure que cela ne s'anime qu'une seule fois
            }
        });
    }, { threshold: 0.5 });
    
    const statsSection = document.getElementById('stats');
    if (statsSection) counterObserver.observe(statsSection);

    /* ==========================================
       5. BOUTON MAGNETIQUE (MICRO-INTERACTIONS)
       ========================================== */
    const magneticBtns = document.querySelectorAll('.btn-primary');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            // Calculer la déviation par rapport au centre du bouton
            const x = (e.clientX - rect.left - rect.width / 2) * 0.2; 
            const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
            // Ne pas trop déplacer pour garder l'utilisabilité
            requestAnimationFrame(() => {
                btn.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
        btn.addEventListener('mouseleave', () => {
            requestAnimationFrame(() => {
                btn.style.transform = `translate(0px, 0px)`;
            });
        });
    });

    /* ==========================================
       6. SIMULATEUR DE SCANNER BLOCKCHAIN
       ========================================== */
    const verifyBtn = document.getElementById('verify-btn');
    const modal = document.getElementById('scanner-modal');
    const closeBtn = document.querySelector('.close-modal');
    const steps = document.querySelectorAll('.scan-step');
    const holoContainer = document.querySelector('.holographic-result');
    const stepContainer = document.querySelector('.scanner-steps');
    const scannerContent = document.querySelector('.modal-content');

    let simulationRunId = 0;
    const pendingTimeouts = [];
    let lastFocusedElement = null;

    const clearPendingTimeouts = () => {
        pendingTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        pendingTimeouts.length = 0;
    };

    const queueTimeout = (callback, delay) => {
        const timeoutId = setTimeout(() => {
            const index = pendingTimeouts.indexOf(timeoutId);
            if (index !== -1) pendingTimeouts.splice(index, 1);
            callback();
        }, delay);
        pendingTimeouts.push(timeoutId);
        return timeoutId;
    };

    const getFocusableElements = () => {
        if (!modal) return [];
        const selectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        return Array.from(modal.querySelectorAll(selectors)).filter(el => !el.hasAttribute('disabled'));
    };

    const closeModal = () => {
        if (!modal) return;
        simulationRunId++;
        clearPendingTimeouts();
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleModalKeydown);
        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }
    };

    const handleModalKeydown = (event) => {
        if (!modal || !modal.classList.contains('active')) return;

        if (event.key === 'Escape') {
            closeModal();
            return;
        }

        if (event.key !== 'Tab') return;

        const focusable = getFocusableElements();
        if (!focusable.length) return;

        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];
        const activeEl = document.activeElement;

        if (event.shiftKey && activeEl === firstEl) {
            event.preventDefault();
            lastEl.focus();
        } else if (!event.shiftKey && activeEl === lastEl) {
            event.preventDefault();
            firstEl.focus();
        }
    };

    if(verifyBtn && modal) {
        verifyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            simulationRunId++;
            const currentRunId = simulationRunId;
            clearPendingTimeouts();
            lastFocusedElement = document.activeElement;

            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleModalKeydown);
            if (closeBtn) closeBtn.focus();
            
            // Reset state
            if (stepContainer) stepContainer.style.display = 'block';
            if (holoContainer) holoContainer.classList.remove('active');
            steps.forEach(step => {
                step.classList.remove('active', 'completed');
                const statusIcon = step.querySelector('.status-icon');
                if (statusIcon) {
                    statusIcon.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                }
            });

            // Lancer la séquence simulée
            let stepIndex = 0;
            const runSimulation = () => {
                if (currentRunId !== simulationRunId || !modal.classList.contains('active')) return;

                if (stepIndex < steps.length) {
                    steps[stepIndex].classList.add('active');
                    
                    // Temps aléatoire simulé entre 1s et 1.8s
                    let delay = 1000 + Math.random() * 800; 
                    
                    queueTimeout(() => {
                        if (currentRunId !== simulationRunId || !modal.classList.contains('active')) return;
                        steps[stepIndex].classList.replace('active', 'completed');
                        const statusIcon = steps[stepIndex].querySelector('.status-icon');
                        if (statusIcon) {
                            statusIcon.innerHTML = '<i class="fa-solid fa-check text-success"></i>';
                        }
                        stepIndex++;
                        runSimulation();
                    }, delay);
                } else {
                    // Cacher les étapes et montrer la carte holographique
                    queueTimeout(() => {
                        if (currentRunId !== simulationRunId || !modal.classList.contains('active')) return;
                        if (stepContainer) stepContainer.style.display = 'none';
                        if (holoContainer) holoContainer.classList.add('active');
                    }, 500);
                }
            };
            
            runSimulation();
        });

        // Fermeture du modal
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });

        if (scannerContent) {
            scannerContent.addEventListener('click', (event) => event.stopPropagation());
        }
    }

    /* ==========================================
       7. CARTE HOLOGRAPHIQUE (EFFET 3D TILT & GLARE)
       ========================================== */
    const holoCard = document.querySelector('.holo-card');
    if (holoCard) {
        const glare = holoCard.querySelector('.holo-glare');
        
        holoCard.addEventListener('mousemove', (e) => {
            const rect = holoCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Rotation 3D
            const rotateX = ((y - centerY) / centerY) * -12; // Modifie l'intensité de la rotation
            const rotateY = ((x - centerX) / centerX) * 12;
            holoCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // Mouvement du reflet lumineux
            if (glare) {
                // Background position de 0% à 100%
                const bgX = (x / rect.width) * 100;
                const bgY = (y / rect.height) * 100;
                glare.style.backgroundPosition = `${bgX}% ${bgY}%`;
            }
        });

        holoCard.addEventListener('mouseleave', () => {
            holoCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            if (glare) {
                glare.style.backgroundPosition = `100% 100%`; // Position de repos
            }
        });
    }

});
