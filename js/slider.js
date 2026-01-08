document.addEventListener('DOMContentLoaded', () => {
    // Utility function to initialize a slider
    function initSlider({
        trackSelector,
        cardSelector,
        nextBtnSelector,
        prevBtnSelector,
        dotsContainerSelector,
        dotClass = 'dot',
        activeClass = 'active',
        isCarousel = false // If true, cards are smaller than track width
    }) {
        const track = document.querySelector(trackSelector);
        if (!track) return;

        const cards = Array.from(document.querySelectorAll(cardSelector));
        const nextBtn = document.querySelector(nextBtnSelector);
        const prevBtn = document.querySelector(prevBtnSelector);
        const dotsContainer = document.querySelector(dotsContainerSelector);

        let currentIndex = 0;

        // Create dots
        cards.forEach((_, index) => {
            if (dotsContainer) {
                const dot = document.createElement('div');
                dot.classList.add(dotClass);
                if (index === 0) dot.classList.add(activeClass);
                dot.addEventListener('click', () => {
                    currentIndex = index;
                    updateSlider();
                });
                dotsContainer.appendChild(dot);
            }
        });

        const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll(`.${dotClass}`)) : [];

        function updateSlider() {
            if (!cards.length) return;

            // Only set max-content for carousel mode (testimonials)
            // For non-carousel (case studies), keep the CSS width for side-by-side panels
            if (isCarousel) {
                track.style.width = 'max-content';
            }

            const cardWidth = cards[currentIndex].offsetWidth;
            const gap = parseInt(window.getComputedStyle(track).gap) || 0;

            if (isCarousel) {
                const container = track.parentElement;
                const containerWidth = container.offsetWidth;

                // Position of active card's center relative to track start
                // (Sum of previous cards + gaps) + half of current card
                let activeCardCenterInTrack = 0;
                for (let i = 0; i < currentIndex; i++) {
                    activeCardCenterInTrack += cards[i].offsetWidth + gap;
                }
                activeCardCenterInTrack += cardWidth / 2;

                // We want this center to be at containerWidth / 2
                let moveAmount = activeCardCenterInTrack - (containerWidth / 2);

                // Clamp moveAmount to ensure the first card is properly centered
                // When moveAmount is negative, it means we're trying to show space before the first card
                if (moveAmount < 0) {
                    moveAmount = 0;
                }

                track.style.transform = `translateX(-${moveAmount}px)`;

                cards.forEach((card, index) => {
                    if (index === currentIndex) {
                        card.classList.add(activeClass);
                    } else {
                        card.classList.remove(activeClass);
                    }
                });
            } else {
                // Simple slider (for case studies)
                // Card is 100% width, so just move by index * 100%
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
            }

            // Update dots
            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add(activeClass);
                } else {
                    dot.classList.remove(activeClass);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % cards.length;
                updateSlider();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + cards.length) % cards.length;
                updateSlider();
            });
        }

        // Handle clicks on cards directly (for carousel)
        if (isCarousel) {
            cards.forEach((card, index) => {
                card.addEventListener('click', () => {
                    currentIndex = index;
                    updateSlider();
                });
            });
        }

        // Initialize
        updateSlider();

        // Re-calculate on resize
        window.addEventListener('resize', updateSlider);
    }

    // Initialize Testimonials Slider
    initSlider({
        trackSelector: '.slider-track',
        cardSelector: '.testimonial-card',
        nextBtnSelector: '.slider-btn.next',
        prevBtnSelector: '.slider-btn.prev',
        dotsContainerSelector: '.slider-dots',
        isCarousel: true
    });

    // Initialize Case Studies Slider
    initSlider({
        trackSelector: '.case-track',
        cardSelector: '.case-card',
        nextBtnSelector: '.case-slider-btn.next',
        prevBtnSelector: '.case-slider-btn.prev',
        dotsContainerSelector: '.case-slider-dots',
        dotClass: 'case-dot',
        isCarousel: false
    });

    // Add swipe support for Case Studies slider (since buttons are hidden)
    const caseTrack = document.querySelector('.case-track');
    if (caseTrack) {
        let startX = 0;
        let isDragging = false;
        const caseCards = document.querySelectorAll('.case-card');
        let currentCaseIndex = 0;

        function goToCase(index) {
            currentCaseIndex = Math.max(0, Math.min(index, caseCards.length - 1));
            caseTrack.style.transform = `translateX(-${currentCaseIndex * 100}%)`;
        }

        caseTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        caseTrack.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    // Swiped left - go next
                    goToCase(currentCaseIndex + 1);
                } else {
                    // Swiped right - go prev
                    goToCase(currentCaseIndex - 1);
                }
            }
            isDragging = false;
        }, { passive: true });

        // Also support mouse drag
        caseTrack.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isDragging = true;
            caseTrack.style.cursor = 'grabbing';
        });

        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            const diff = startX - e.clientX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    goToCase(currentCaseIndex + 1);
                } else {
                    goToCase(currentCaseIndex - 1);
                }
            }
            isDragging = false;
            caseTrack.style.cursor = 'grab';
        });

        caseTrack.style.cursor = 'grab';
    }
});
