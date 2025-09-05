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

/* Simple, accessible slider */
class SimpleSlider {
    constructor(root) {
        this.root    = root;
        this.track   = root.querySelector('.slides');
        this.slides  = Array.from(root.querySelectorAll('.slide'));
        this.prevBtn = root.querySelector('.prev');
        this.nextBtn = root.querySelector('.next');

        // Options
        this.autoplay   = root.dataset.autoplay === 'true';
        this.intervalMs = parseInt(root.dataset.interval || '4000', 10);
        this.perView    = Math.max(1, parseInt(root.dataset.perView || '1', 10));
        this.gap        = Math.max(0, parseInt(root.dataset.gap || '16', 10)); // px

        // State
        this.total  = this.slides.length;
        this.index  = 0;   // page index
        this.timer  = null;

        // Apply track gap
        this.track.style.gap = this.gap + 'px';

        // Dots
        if (root.dataset.dots === 'true') this.makeDots();

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
        window.addEventListener('resize', () => { this.measure(); this.update(); });

        // Init
        this.measure();
        this.update();
    }

    measure() {
        // Set flex-basis to fit perView with gaps: (100% - gap*(n-1)) / n
        const basis = `calc((100% - ${(this.perView - 1) * this.gap}px) / ${this.perView})`;
        this.slides.forEach(s => { s.style.flex = `0 0 ${basis}`; });

        // Pixel math for precise translate
        const rootW  = this.root.clientWidth;
        const tileW  = (rootW - (this.perView - 1) * this.gap) / this.perView;
        this.stepPx  = tileW + this.gap;

        // Number of windows/pages to loop over
        this.pages = Math.max(1, this.total - this.perView + 1);

        // Responsive helper class
        if (this.perView > 1) this.root.classList.add('multi');
        else this.root.classList.remove('multi');
    }

    makeDots() {
        const dots = document.createElement('div');
        dots.className = 'dots';
        this.dots = [];
        const count = Math.max(1, this.total - this.perView + 1);
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('button');
            dot.className = 'dot';
            dot.type = 'button';
            dot.setAttribute('aria-label', `Go to set ${i + 1}`);
            dot.addEventListener('click', () => { this.index = i; this.update(true); });
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
        // Looping carousel
        this.index = (this.index + step + this.pages) % this.pages;
        this.update(true);
    }

    update(user = false) {
        const offset = this.index * this.stepPx;
        this.track.style.transform = `translateX(-${offset}px)`;
        this.dots?.forEach((d, i) => d.classList.toggle('active', i === this.index));
        if (user && this.autoplay) this.start();
    }
}

/* Init all sliders */
document.querySelectorAll('.slider').forEach(s => new SimpleSlider(s));

/* Footer year */
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();
