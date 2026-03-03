/**
 * Horizontal Scroll System
 * Converts vertical scroll to horizontal navigation between components
 * Uses ScrollSmoother, ScrollTrigger, and ScrollToPlugin
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother, ScrollToPlugin } from '../gsap-init.js';
import { hasActiveInternalScroll, scrollInternalScroll } from './text-centered.js';

let smoother = null;
let scrollTriggerInstance = null;

/**
 * Initialize horizontal scroll system
 * @param {string} mode - 'horizontal' (smooth) or 'horizontal-snap' (snap to sections)
 */
export function initHorizontalScroll(mode = 'horizontal') {
    const main = document.querySelector('.c-main');
    
    if (!main) {
        console.warn('Horizontal scroll: .c-main not found');
        return;
    }

    // Wait for fonts and layout to be ready
    document.fonts.ready.then(() => {
        // Wait for DOM to be fully ready before initializing
        const initWhenReady = () => {
            if (document.body && document.documentElement && main) {
                if (mode === 'horizontal') {
                    initSmoothHorizontal(main);
                } else if (mode === 'horizontal-snap') {
                    initSnapHorizontal(main);
                }
            } else {
                // Retry if DOM not ready
                setTimeout(initWhenReady, 100);
            }
        };
        setTimeout(initWhenReady, 200);
    });
}

/**
 * Initialize smooth horizontal scroll using ScrollSmoother
 */
function initSmoothHorizontal(main) {
    if (!ScrollSmoother) {
        console.warn('ScrollSmoother plugin not available. Falling back to ScrollTrigger snap.');
        return initSnapHorizontal(main);
    }

    // Ensure wrapper exists
    let wrapper = document.querySelector('#smooth-wrapper');
    
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = 'smooth-wrapper';
        main.parentNode.insertBefore(wrapper, main);
        wrapper.appendChild(main);
    }

    try {
        // Verify wrapper and content exist before creating ScrollSmoother
        const wrapperEl = document.querySelector('#smooth-wrapper');
        const contentEl = document.querySelector('.horizontal-scroll-wrapper');
        
        if (!wrapperEl || !contentEl) {
            console.warn('ScrollSmoother: wrapper or content element not found');
            return;
        }
        
        // Ensure smooth mode styles
        document.body.classList.add('horizontal-smooth-mode');
        document.body.style.overflowY = 'hidden';
        document.body.style.height = '100vh';
        document.documentElement.classList.add('horizontal-smooth-mode');
        document.documentElement.style.overflowY = 'hidden';
        document.documentElement.style.height = '100vh';
        
        // Create ScrollSmoother instance
        smoother = ScrollSmoother.create({
            wrapper: "#smooth-wrapper",
            content: ".horizontal-scroll-wrapper",
            horizontal: true,
            smooth: 1.5,
            effects: true,
            normalizeScroll: true
        });

        console.log('Horizontal scroll (smooth) initialized');
    } catch (error) {
        console.error('Error creating ScrollSmoother:', error);
    }
}

/**
 * Initialize snap horizontal scroll using ScrollTrigger
 */
function initSnapHorizontal(main) {
    if (!ScrollToPlugin) {
        console.warn('ScrollToPlugin not available for snap mode.');
        return;
    }

        // Get all sections in order (direct children of main: .section-screen wrappers or legacy section/component nodes)
        const sections = Array.from(main.children).filter(child => {
            const tag = child.tagName.toLowerCase();
            return child.classList.contains('section-screen') ||
                   tag === 'section' ||
                   child.classList.contains('c-hero') ||
                   child.classList.contains('c-intro') ||
                   child.classList.contains('c-gallery-section') ||
                   child.classList.contains('c-quotes') ||
                   child.classList.contains('c-video') ||
                   child.classList.contains('c-details') ||
                   child.classList.contains('c-call-to-action') ||
                   child.classList.contains('c-logos') ||
                   child.classList.contains('c-share') ||
                   child.classList.contains('c-follow-us') ||
                   child.classList.contains('c-text-and-image-one') ||
                   child.classList.contains('c-text-and-image-two') ||
                   child.classList.contains('c-image') ||
                   child.classList.contains('c-ticketing') ||
                   child.classList.contains('c-sorteo') ||
                   child.classList.contains('c-custom');
        });

        if (sections.length === 0) {
            console.warn('Horizontal scroll: No sections found');
            return;
        }

    const nonParallaxSections = sections;
    const gapSize = 0; // Sin gap; fondos por sección
    const totalWidth = (nonParallaxSections.length * window.innerWidth) + ((nonParallaxSections.length - 1) * gapSize);

        // Calculate scroll height based on number of non-parallax sections
        const scrollHeight = nonParallaxSections.length * window.innerHeight;

    // Ensure body and html allow scroll for ScrollTrigger to detect
    // Scroll is hidden visually but functional for ScrollTrigger
    document.body.style.overflowY = 'auto';
    document.body.style.height = `${scrollHeight}px`; // Set height to enable scrolling
    document.body.classList.remove('horizontal-smooth-mode');
    document.documentElement.style.overflowY = 'auto';
    document.documentElement.style.height = 'auto';
    document.documentElement.classList.remove('horizontal-smooth-mode');

    // Track current section index
    let currentSectionIndex = 0;
    let isScrolling = false;

    // Create horizontal scroll animation
    // Set initial position immediately to prevent flash on load
    gsap.set(main, { 
        x: 0,
        immediateRender: true
    });
    
    // Ensure main is visible after positioning (prevent FOUC)
    requestAnimationFrame(() => {
        main.style.opacity = '1';
    });
    
    // Function to scroll to a specific section
    function scrollToSectionIndex(index) {
        if (isScrolling || index < 0 || index >= nonParallaxSections.length) {
            return;
        }
        
        isScrolling = true;
        currentSectionIndex = index;
        
        window.__currentSectionIndex = index;
        currentSectionIndex = index;
        
        const targetX = -(index * window.innerWidth) - (index * gapSize);
        
        gsap.to(main, {
            x: targetX,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => {
                isScrolling = false;
                updateScrollIndicator();
                if (typeof updateNextArrowVisibility === 'function') updateNextArrowVisibility();
                window.dispatchEvent(new CustomEvent('sectionChanged', { detail: { index } }));
            }
        });
        
        // Update scroll position to match
        const scrollProgress = index / (nonParallaxSections.length - 1);
        const targetScrollY = scrollProgress * (scrollHeight - window.innerHeight);
        window.scrollTo({
            top: targetScrollY,
            behavior: 'instant'
        });
    }
    
    // Initialize current section index
    window.__currentSectionIndex = 0;
    
    // Create and initialize horizontal scrollbar indicator
    function createScrollIndicator() {
        // Remove existing indicator if any
        const existing = document.querySelector('.horizontal-scroll-indicator');
        if (existing) existing.remove();
        
        if (!document.body) {
            return null;
        }
        
        const indicator = document.createElement('div');
        indicator.className = 'horizontal-scroll-indicator';
        // Force inline styles to ensure visibility
        indicator.style.cssText = 'position:fixed !important;bottom:0 !important;left:0 !important;height:8px !important;background:rgba(23,97,127,0.8) !important;z-index:10000 !important;pointer-events:none !important;display:block !important;visibility:visible !important;opacity:1 !important;border-radius:4px 4px 0 0 !important;';
        document.body.appendChild(indicator);
        
        return indicator;
    }
    
    const scrollIndicator = createScrollIndicator();

    // Flecha siguiente: se añade al body para que position:fixed sea siempre respecto al viewport (no a .c-menu ni a main)
    function createNextSectionArrow() {
        const existingBtn = document.querySelector('.horizontal-scroll-next-arrow');
        if (existingBtn) existingBtn.remove();
        if (!nonParallaxSections.length) return null;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'horizontal-scroll-next-arrow';
        btn.setAttribute('aria-label', 'Siguiente sección');
        const gap = 24;
        function positionArrow() {
            const cw = document.documentElement.clientWidth;
            btn.style.setProperty('position', 'fixed', 'important');
            btn.style.setProperty('top', `${window.innerHeight - 52 - gap}px`, 'important');
            // Mismo margen que la flecha izquierda: 24px del borde del área de contenido (clientWidth), sin salto al cargar el video
            btn.style.setProperty('left', `${cw - 52 - gap}px`, 'important');
            btn.style.setProperty('right', 'auto', 'important');
            btn.style.setProperty('bottom', 'auto', 'important');
            btn.style.setProperty('z-index', '99999', 'important');
            btn.style.pointerEvents = 'auto';
        }
        positionArrow();
        window.addEventListener('resize', positionArrow);
        window.addEventListener('load', positionArrow);
        btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        document.body.appendChild(btn);
        btn.addEventListener('click', () => {
            const idx = window.__currentSectionIndex ?? 0;
            if (idx < nonParallaxSections.length - 1) {
                scrollToSectionIndex(idx + 1);
            }
        });
        return btn;
    }
    const nextArrow = createNextSectionArrow();

    // Flecha anterior (esquina inferior izquierda); en body para que fixed sea respecto al viewport
    function createPrevSectionArrow() {
        const existingBtn = document.querySelector('.horizontal-scroll-prev-arrow');
        if (existingBtn) existingBtn.remove();
        if (!nonParallaxSections.length) return null;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'horizontal-scroll-prev-arrow';
        btn.setAttribute('aria-label', 'Sección anterior');
        const gap = 24;
        function positionArrow() {
            btn.style.setProperty('position', 'fixed', 'important');
            btn.style.setProperty('top', `${window.innerHeight - 52 - gap}px`, 'important');
            btn.style.setProperty('left', `${gap}px`, 'important');
            btn.style.setProperty('right', 'auto', 'important');
            btn.style.setProperty('bottom', 'auto', 'important');
            btn.style.setProperty('z-index', '99999', 'important');
            btn.style.pointerEvents = 'auto';
        }
        positionArrow();
        window.addEventListener('resize', positionArrow);
        window.addEventListener('load', positionArrow);
        btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        document.body.appendChild(btn);
        btn.addEventListener('click', () => {
            const idx = window.__currentSectionIndex ?? 0;
            if (idx > 0) {
                scrollToSectionIndex(idx - 1);
            }
        });
        return btn;
    }
    const prevArrow = createPrevSectionArrow();

    function updateNextArrowVisibility() {
        if (!nextArrow) return;
        const idx = window.__currentSectionIndex ?? 0;
        const isLast = idx >= nonParallaxSections.length - 1;
        nextArrow.style.opacity = isLast ? '0.35' : '1';
        nextArrow.style.pointerEvents = isLast ? 'none' : 'auto';
    }
    function updatePrevArrowVisibility() {
        if (!prevArrow) return;
        const idx = window.__currentSectionIndex ?? 0;
        const isFirst = idx <= 0;
        prevArrow.style.opacity = isFirst ? '0.35' : '1';
        prevArrow.style.pointerEvents = isFirst ? 'none' : 'auto';
    }
    updateNextArrowVisibility();
    updatePrevArrowVisibility();
    window.addEventListener('sectionChanged', () => {
        updateNextArrowVisibility();
        updatePrevArrowVisibility();
    });
    
    // Update scroll indicator position
    function updateScrollIndicator() {
        if (!scrollIndicator || nonParallaxSections.length === 0) {
            return;
        }
        const totalSections = nonParallaxSections.length;
        const progress = currentSectionIndex / Math.max(1, totalSections - 1);
        const indicatorWidth = Math.max(10, 100 / totalSections); // Min 10% width
        scrollIndicator.style.width = `${indicatorWidth}%`;
        scrollIndicator.style.left = `${progress * (100 - indicatorWidth)}%`;
    }
    
    // Initial update
    updateScrollIndicator();
    
    // Listen to wheel events - one section jump per scroll gesture
    let wheelTimeout = null;
    let lastWheelTime = 0;
    const WHEEL_DEBOUNCE = 800; // Minimum time between section changes (ms)
    
    window.addEventListener('wheel', (e) => {
        if (isScrolling) {
            e.preventDefault();
            return;
        }

        // Si el scroll es sobre la galería (imágenes o thumbnails), no cambiar de pantalla; la galería gestiona el wheel
        if (e.target.closest('.c-gallery-section__wrapper') || e.target.closest('.c-gallery-section__thumbnails')) {
            e.preventDefault();
            return;
        }
        
        // Prevent default scroll
        e.preventDefault();
        
        const now = Date.now();
        const timeSinceLastWheel = now - lastWheelTime;
        
        // Only process if enough time has passed since last section change
        if (timeSinceLastWheel < WHEEL_DEBOUNCE) {
            return;
        }
        
        // Check if current section has active internal scroll (e.g., textCentered with long text)
        const nonParallaxSections = sections.filter(section => !section.classList.contains('c-parallax'));
        const currentSection = nonParallaxSections[currentSectionIndex];
        
        if (currentSection && hasActiveInternalScroll && scrollInternalScroll) {
            if (hasActiveInternalScroll(currentSection)) {
                // Try to scroll the internal scroll element first
                const scrollConsumed = scrollInternalScroll(currentSection, e.deltaY);
                if (scrollConsumed) {
                    // Scroll was consumed by internal scroll, don't proceed to horizontal scroll
                    return;
                }
            }
        }
        
        // Clear any pending timeout
        if (wheelTimeout) {
            clearTimeout(wheelTimeout);
        }
        
        // Debounce rapid wheel events into a single action
        wheelTimeout = setTimeout(() => {
            const scrollDirection = e.deltaY > 0 ? 1 : -1;
            
            // Determine next section based on scroll direction
            if (scrollDirection > 0 && currentSectionIndex < nonParallaxSections.length - 1) {
                scrollToSectionIndex(currentSectionIndex + 1);
                lastWheelTime = Date.now();
            } else if (scrollDirection < 0 && currentSectionIndex > 0) {
                scrollToSectionIndex(currentSectionIndex - 1);
                lastWheelTime = Date.now();
            }
        }, 100); // Small delay to aggregate multiple wheel events
    }, { passive: false });
    
    // Also handle touch/swipe for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    window.addEventListener('touchend', (e) => {
        if (isScrolling) return;
        
        touchEndY = e.changedTouches[0].screenY;
        const touchDiff = touchStartY - touchEndY;
        const threshold = 50; // Minimum swipe distance
        const nonParallaxSections = sections.filter(section => !section.classList.contains('c-parallax'));
        
        if (Math.abs(touchDiff) > threshold) {
            if (touchDiff > 0 && currentSectionIndex < nonParallaxSections.length - 1) {
                // Swipe up - next section
                scrollToSectionIndex(currentSectionIndex + 1);
            } else if (touchDiff < 0 && currentSectionIndex > 0) {
                // Swipe down - previous section
                scrollToSectionIndex(currentSectionIndex - 1);
            }
        }
    }, { passive: true });
    
    try {
        // Use ScrollTrigger to pin the body but handle section navigation manually.
        // Run only after load so DOM is stable and no script (e.g. browser-sync) is mid-injection.
        let createScrollTriggerRetries = 0;
        const maxRetries = 3;
        const createScrollTrigger = () => {
            const body = document.body;
            const html = document.documentElement;
            if (!body || !html || !ScrollTrigger) {
                if (createScrollTriggerRetries < maxRetries) {
                    createScrollTriggerRetries += 1;
                    requestAnimationFrame(createScrollTrigger);
                }
                return;
            }
            // ScrollTrigger pin inserta un spacer en body.parentNode; debe existir y tener appendChild
            const parent = body.parentNode;
            if (!parent || !body.isConnected || typeof parent.appendChild !== 'function') {
                if (createScrollTriggerRetries < maxRetries) {
                    createScrollTriggerRetries += 1;
                    requestAnimationFrame(createScrollTrigger);
                }
                return;
            }
            if (!body.style) {
                if (createScrollTriggerRetries < maxRetries) {
                    createScrollTriggerRetries += 1;
                    requestAnimationFrame(createScrollTrigger);
                }
                return;
            }
            // Usar un wrapper como trigger para que el pin spacer se inserte en body, no en
            // documentElement (evita appendChild sobre null en entornos con inyección de scripts).
            let pinWrapper = document.getElementById('horizontal-scroll-pin-wrapper');
            if (!pinWrapper) {
                pinWrapper = document.createElement('div');
                pinWrapper.id = 'horizontal-scroll-pin-wrapper';
                pinWrapper.style.cssText = 'min-height:100vh;';
                while (body.firstChild) pinWrapper.appendChild(body.firstChild);
                body.appendChild(pinWrapper);
            }
            try {
                scrollTriggerInstance = ScrollTrigger.create({
                    trigger: pinWrapper,
                    start: "top top",
                    end: () => `+=${scrollHeight}`,
                    pin: true,
                    pinSpacing: true,
                    invalidateOnRefresh: true,
                    markers: false
                });
            } catch (error) {
                console.warn('Horizontal scroll: Error creating ScrollTrigger', error);
                if (!scrollTriggerInstance && createScrollTriggerRetries < maxRetries) {
                    createScrollTriggerRetries += 1;
                    setTimeout(() => requestAnimationFrame(createScrollTrigger), 500);
                }
            }
        };
        const runCreateScrollTrigger = () => {
            setTimeout(() => {
                requestAnimationFrame(() => requestAnimationFrame(createScrollTrigger));
            }, 400);
        };
        if (document.readyState === 'complete') {
            runCreateScrollTrigger();
        } else {
            window.addEventListener('load', runCreateScrollTrigger, { once: true });
        }
        
        // Store navigation function globally for menu links
        // Wrap it to also update the scroll indicator
        window.__scrollToSectionIndex = function(index) {
            scrollToSectionIndex(index);
            // updateScrollIndicator will be called in onComplete
        };
    } catch (error) {
        console.error('Error creating horizontal scroll:', error);
        return;
    }

    // Store sections for navigation (both all and non-parallax)
    window.__horizontalScrollSections = sections;
    window.__horizontalScrollNonParallaxSections = nonParallaxSections;

    console.log('Horizontal scroll (snap) initialized with', nonParallaxSections.length, 'non-parallax sections');
}

/**
 * Navigate to a specific section horizontally
 * @param {string|HTMLElement} target - Section ID selector or element
 */
export function scrollToSection(target) {
    const element = typeof target === 'string' 
        ? document.querySelector(target) 
        : target;

    if (!element) {
        console.warn('Horizontal scroll: Target section not found', target);
        return;
    }

    // If using ScrollSmoother
    if (smoother) {
        smoother.scrollTo(element, true, "x");
        return;
    }

    // If using ScrollTrigger snap mode
    if (window.__horizontalScrollNonParallaxSections && window.__scrollToSectionIndex) {
        const nonParallaxSections = window.__horizontalScrollNonParallaxSections;
        const main = document.querySelector('.c-main');
        let index = -1;
        const screen = element.closest('.section-screen');
        if (screen && nonParallaxSections.indexOf(screen) !== -1) {
            index = nonParallaxSections.indexOf(screen);
        } else if (main && main.contains(element)) {
            const screens = Array.from(main.children).filter(el => el.classList.contains('section-screen'));
            index = screens.findIndex(s => s.contains(element));
        }
        if (index !== -1) {
            window.__scrollToSectionIndex(index);
            return;
        }
    }
    
    // Fallback to old method if available
    if (window.__horizontalScrollSections) {
        const sections = window.__horizontalScrollSections;
        const index = sections.indexOf(element);
        
        if (index !== -1 && ScrollToPlugin) {
            const totalSections = sections.length;
            const scrollProgress = index / (totalSections - 1);
            const maxScroll = totalSections * window.innerWidth - window.innerWidth;
            const targetScroll = scrollProgress * maxScroll;
            
            gsap.to(window, {
                duration: 1.5,
                scrollTo: {
                    y: targetScroll,
                    autoKill: false
                },
                ease: "power2.inOut"
            });
        }
    }
}

/**
 * Get current smoother instance (for external use)
 */
export function getSmoother() {
    return smoother;
}

/**
 * Cleanup function
 */
export function destroyHorizontalScroll() {
    if (smoother) {
        smoother.kill();
        smoother = null;
    }
    
    if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
        scrollTriggerInstance = null;
    }
    
    ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === document.body || st.vars?.snap) {
            st.kill();
        }
    });
}

