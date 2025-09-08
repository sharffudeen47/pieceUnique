/* Smooth scroll (anchors) */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id && id.length > 1) {
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

/* Infinite, smooth slider (hero + gallery) */
class SimpleSlider {
    constructor(root) {
        this.root    = root;
        this.track   = root.querySelector('.slides');
        this.prevBtn = root.querySelector('.prev');
        this.nextBtn = root.querySelector('.next');

        // Options
        this.autoplay   = root.dataset.autoplay === 'true';
        this.intervalMs = parseInt(root.dataset.interval || '4000', 10);
        this.perView    = Math.max(1, parseInt(root.dataset.perView || '1', 10));
        this.gap        = Math.max(0, parseInt(root.dataset.gap || '16', 10)); // px

        // Base state
        this.timer       = null;
        this.userTouched = false;

        // Build once from the original children
        this.originalSlides = Array.from(root.querySelectorAll('.slide'));
        this.total          = this.originalSlides.length;

        // Dots (based on logical windows, not clones)
        if (root.dataset.dots === 'true') this.makeDots();

        // Prepare track (gap for nice spacing)
        this.track.style.gap = this.gap + 'px';

        // Infinite setup (clones)
        this.setupInfinite();

        // Bind controls
        this.prevBtn?.addEventListener('click', () => this.go(-1));
        this.nextBtn?.addEventListener('click', () => this.go(1));

        // Pause on hover if autoplay
        if (this.autoplay) {
            this.start();
            root.addEventListener('mouseenter', () => this.stop());
            root.addEventListener('mouseleave', () => this.start());
            document.addEventListener('visibilitychange', () => document.hidden ? this.stop() : this.start());
        }

        // Resize handling
        window.addEventListener('resize', () => { this.measure(); this.snap(); });

        // Init measurements and position
        this.measure();
        this.snap(); // go to current index without animation
    }

    setupInfinite() {
        // Remove any previous clones (if any)
        Array.from(this.track.querySelectorAll('.slide.is-clone')).forEach(n => n.remove());

        // Clone last perView slides to the front, and first perView slides to the end
        const n = Math.min(this.perView, this.total);
        const firstN = this.originalSlides.slice(0, n).map(el => el.cloneNode(true));
        const lastN  = this.originalSlides.slice(-n).map(el => el.cloneNode(true));

        firstN.forEach(cl => { cl.classList.add('is-clone'); this.track.appendChild(cl); });
        lastN.reverse().forEach(cl => { cl.classList.add('is-clone'); this.track.insertBefore(cl, this.track.firstChild); });

        // Update slides collection to include clones
        this.slides = Array.from(this.track.querySelectorAll('.slide'));

        // Start index: after the prepended clones
        this.index = n;

        // Transition end handler for seamless looping
        this.track.addEventListener('transitionend', () => {
            // When we move into clones, jump back to the matching real index instantly
            const n = Math.min(this.perView, this.total);
            if (this.index < n) {
                this.index += this.total;
                this.snap(); // instant reposition
            } else if (this.index >= this.total + n) {
                this.index -= this.total;
                this.snap();
            }
        }, { passive: true });
    }

    measure() {
        // Set flex-basis to fit perView with gaps: (100% - gap*(n-1)) / n
        const basis = `calc((100% - ${(this.perView - 1) * this.gap}px) / ${this.perView})`;
        this.slides.forEach(s => { s.style.flex = `0 0 ${basis}`; });

        // Pixel math for precise translate
        const rootW = this.root.clientWidth;
        const tileW = (rootW - (this.perView - 1) * this.gap) / this.perView;
        this.stepPx = tileW + this.gap;

        // Pages for dots (logical windows, not counting clones)
        this.pages = Math.max(1, this.total - this.perView + 1);

        // Helper class for responsive overrides
        if (this.perView > 1) this.root.classList.add('multi');
        else this.root.classList.remove('multi');
    }

    makeDots() {
        const dots = document.createElement('div');
        dots.className = 'dots';
        this.dots = [];
        // Pages without clones
        const count = Math.max(1, this.total - Math.max(1, this.perView) + 1);
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('button');
            dot.className = 'dot';
            dot.type = 'button';
            dot.setAttribute('aria-label', `Go to set ${i + 1}`);
            dot.addEventListener('click', () => {
                const n = Math.min(this.perView, this.total);
                this.index = n + i; // map dot directly into logical window (offset by prepended clones)
                this.update(true);
            });
            dots.appendChild(dot);
            this.dots.push(dot);
        }
        this.root.appendChild(dots);
    }

    start() {
        this.stop();
        this.timer = setInterval(() => this.go(1), this.intervalMs);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    go(step) {
        this.index += step;
        this.update(true);
    }

    // Apply transform with animation
    update(user = false) {
        this.track.style.transition = 'transform .35s ease';
        this.track.style.transform  = `translateX(-${this.index * this.stepPx}px)`;

        // Update dots (map current index back to logical page 0..pages-1)
        if (this.dots) {
            const n = Math.min(this.perView, this.total);
            const logical = ((this.index - n) % this.pages + this.pages) % this.pages;
            this.dots.forEach((d, i) => d.classList.toggle('active', i === logical));
        }

        if (user && this.autoplay) this.start();
    }

    // Reposition instantly (no animation) – used after resize & seamless wrap
    snap() {
        this.track.style.transition = 'none';
        this.track.style.transform  = `translateX(-${this.index * this.stepPx}px)`;

        // Keep dots in sync
        if (this.dots) {
            const n = Math.min(this.perView, this.total);
            const logical = ((this.index - n) % this.pages + this.pages) % this.pages;
            this.dots.forEach((d, i) => d.classList.toggle('active', i === logical));
        }
        // Force reflow to ensure next animated update works immediately
        void this.track.offsetWidth;
    }
}

/* Init all sliders */
document.querySelectorAll('.slider').forEach(s => new SimpleSlider(s));

/* Footer year */
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();
