/**
 * Hero Component GSAP Animations
 * Variants: parallax-smooth, split-text-reveal, magnetic-interactive, cinematic-fade
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Check if horizontal scroll mode is active
function isHorizontalMode() {
    return document.body && document.body.classList.contains('horizontal-scroll-active');
}

// Parallax Smooth Variant
function initHeroParallaxSmooth(element) {
    const bgVideo = element.querySelector('.c-hero__bg-video video');
    const bgImage = element.querySelector('.c-hero__bg-image img');
    const info = element.querySelector('.c-hero__info');
    const titleWrapper = element.querySelector('.heroTitleWrapper');
    const buttons = element.querySelectorAll('.c-hero__button');

    // Set initial states
    gsap.set([bgVideo, bgImage], { scale: 1.1 });
    gsap.set([info, titleWrapper, ...buttons], { opacity: 0, y: 50 });

    // Parallax effect on background (only in vertical mode)
    if ((bgVideo || bgImage) && !isHorizontalMode()) {
        gsap.to(bgVideo || bgImage, {
            yPercent: -20,
            ease: "none",
            scrollTrigger: {
                trigger: element,
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    }

    // Reveal info content
    gsap.timeline({ delay: 0.3 })
        .to(info, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" })
        .to(titleWrapper, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.8")
        .to(buttons, { 
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            stagger: 0.15,
            ease: "power3.out" 
        }, "-=0.6");
}

// Split Text Reveal Variant
function initHeroSplitTextReveal(element) {
    const titleWrapper = element.querySelector('.heroTitleWrapper');
    const title = titleWrapper?.querySelector('img') || titleWrapper?.querySelector('h1');
    const info = element.querySelector('.c-hero__info');
    const buttons = element.querySelectorAll('.c-hero__button');
    const bgVideo = element.querySelector('.c-hero__bg-video video');
    const bgImage = element.querySelector('.c-hero__bg-image img');

    // Set initial states
    gsap.set([titleWrapper, info, ...buttons], { opacity: 0 });
    gsap.set(bgVideo || bgImage, { scale: 1.15, opacity: 0.3 });

    // Animate background fade in
    gsap.to(bgVideo || bgImage, {
        scale: 1,
        opacity: 1,
        duration: 2,
        ease: "power2.out"
    });

    // Split text effect (simulated with clip-path or scale)
    if (titleWrapper) {
        gsap.timeline({ delay: 0.5 })
            .to(titleWrapper, {
                opacity: 1,
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.2,
                ease: "power3.out"
            })
            .fromTo(titleWrapper, 
                { scale: 0.9, y: 30 },
                { scale: 1, y: 0, duration: 1, ease: "back.out(1.7)" },
                "-=0.8"
            );
    }

    // Reveal info and buttons
    gsap.timeline({ delay: 1.2 })
        .to(info, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
        .to(buttons, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.4");
}

// Magnetic Interactive Variant
function initHeroMagneticInteractive(element) {
    const info = element.querySelector('.c-hero__info');
    const titleWrapper = element.querySelector('.heroTitleWrapper');
    const buttons = element.querySelectorAll('.c-hero__button');
    const bgVideo = element.querySelector('.c-hero__bg-video video');
    const bgImage = element.querySelector('.c-hero__bg-image img');

    // Initial animation
    gsap.set([info, titleWrapper, ...buttons], { opacity: 0, scale: 0.8 });
    gsap.set(bgVideo || bgImage, { scale: 1.1 });

    // Reveal animation
    gsap.timeline({ delay: 0.4 })
        .to([info, titleWrapper], {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "back.out(1.2)"
        })
        .to(buttons, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.4)"
        }, "-=0.5");

    // Magnetic effect on buttons
    buttons.forEach(button => {
        const handleMouseMove = (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(button, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.5,
                ease: "power2.out"
            });
        };

        const handleMouseLeave = () => {
            gsap.to(button, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        };

        button.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseleave', handleMouseLeave);
    });

    // Parallax on scroll (only in vertical mode)
    if ((bgVideo || bgImage) && !isHorizontalMode()) {
        gsap.to(bgVideo || bgImage, {
            yPercent: -15,
            ease: "none",
            scrollTrigger: {
                trigger: element,
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    }
}

// Cinematic Fade Variant
function initHeroCinematicFade(element) {
    const bgVideo = element.querySelector('.c-hero__bg-video video');
    const bgImage = element.querySelector('.c-hero__bg-image img');
    const info = element.querySelector('.c-hero__info');
    const titleWrapper = element.querySelector('.heroTitleWrapper');
    const buttons = element.querySelectorAll('.c-hero__button');

    // Set initial states with cinematic look
    gsap.set(bgVideo || bgImage, { scale: 1.2, opacity: 0 });
    gsap.set([info, titleWrapper, ...buttons], { opacity: 0 });

    // Create overlay effect
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 50%, rgba(0,0,0,0.3) 100%);
        z-index: 1;
        pointer-events: none;
    `;
    element.querySelector('.c-hero__bg').appendChild(overlay);

    // Fade in background
    gsap.to(bgVideo || bgImage, {
        scale: 1,
        opacity: 1,
        duration: 2.5,
        ease: "power1.out"
    });

    // Cinematic reveal of content
    gsap.timeline({ delay: 1 })
        .to(info, {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "power2.inOut"
        })
        .to(titleWrapper, {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power2.out"
        }, "-=1")
        .to(buttons, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out"
        }, "-=0.8");
}

// Main initialization function
export function initHero(element, variant = 'default') {
    const variants = {
        'parallax-smooth': initHeroParallaxSmooth,
        'split-text-reveal': initHeroSplitTextReveal,
        'magnetic-interactive': initHeroMagneticInteractive,
        'cinematic-fade': initHeroCinematicFade,
        'default': initHeroParallaxSmooth
    };

    const initFn = variants[variant] || variants['default'];
    
    // Wait for images/videos to load
    if (element.querySelector('video') || element.querySelector('img')) {
        window.addEventListener('load', () => {
            initFn(element);
        });
    } else {
        initFn(element);
    }
}

