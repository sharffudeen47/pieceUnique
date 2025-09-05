// Smooth scroll (keep if you already have it)
document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
        const id=a.getAttribute('href');
        if(id.length>1){
            e.preventDefault();
            document.querySelector(id)?.scrollIntoView({behavior:'smooth'});
        }
    });
});

class SimpleSlider {
    constructor(root){
        this.root    = root;
        this.track   = root.querySelector('.slides');
        this.slides  = [...root.querySelectorAll('.slide')];
        this.prevBtn = root.querySelector('.prev');
        this.nextBtn = root.querySelector('.next');

        // Options
        this.autoplay   = root.dataset.autoplay === 'true';
        this.intervalMs = parseInt(root.dataset.interval || '5000', 10);
        this.perView    = Math.max(1, parseInt(root.dataset.perView || '1', 10));
        this.gap        = Math.max(0, parseInt(root.dataset.gap || '16', 10)); // px

        // Apply gap to track
        this.track.style.gap = this.gap + 'px';

        // State
        this.total  = this.slides.length;
        this.index  = 0;     // page index
        this.timer  = null;

        // Build dots
        if (root.dataset.dots === 'true') this.makeDots();

        // Bind
        this.prevBtn?.addEventListener('click', ()=> this.go(-1));
        this.nextBtn?.addEventListener('click', ()=> this.go(1));
        if (this.autoplay){
            this.start();
            root.addEventListener('mouseenter', ()=> this.stop());
            root.addEventListener('mouseleave', ()=> this.start());
        }
        window.addEventListener('resize', ()=> { this.measure(); this.update(); });
        window.addEventListener('visibilitychange', ()=> document.hidden ? this.stop() : this.start());

        // First layout
        this.measure();
        this.update();
    }

    measure(){
        // Calculate slide basis with gap preserved: (100% - gap*(n-1)) / n
        const basis = `calc((100% - ${(this.perView-1)*this.gap}px) / ${this.perView})`;
        this.slides.forEach(s => { s.style.flex = `0 0 ${basis}`; });

        // For movement we use pixel math
        const rootW = this.root.clientWidth;
        const slideW = (rootW - (this.perView - 1) * this.gap) / this.perView;
        this.stepPx = slideW + this.gap;             // one-tile step width
        this.pages  = Math.max(1, this.total - this.perView + 1);

        // Multi flag for responsive overrides
        if (this.perView > 1) this.root.classList.add('multi');
        else this.root.classList.remove('multi');
    }

    makeDots(){
        const dots = document.createElement('div');
        dots.className = 'dots';
        this.dots = [];
        // pages = total - perView + 1
        const count = Math.max(1, this.total - this.perView + 1);
        for (let i = 0; i < count; i++){
            const dot = document.createElement('button');
            dot.className = 'dot';
            dot.setAttribute('aria-label', `Go to set ${i+1}`);
            dot.addEventListener('click', ()=> { this.index = i; this.update(true); });
            dots.appendChild(dot);
            this.dots.push(dot);
        }
        this.root.appendChild(dots);
    }

    start(){ if(!this.autoplay) return; this.stop(); this.timer = setInterval(()=> this.go(1), this.intervalMs); }
    stop(){ if(this.timer){ clearInterval(this.timer); this.timer = null; } }

    go(step){
        this.index = Math.min(Math.max(this.index + step, 0), this.pages - 1);
        this.update(true);
    }

    update(user=false){
        const offset = this.index * this.stepPx; // pixels
        this.track.style.transform = `translateX(-${offset}px)`;
        this.dots?.forEach((d,i)=> d.classList.toggle('active', i === this.index));
        if (user && this.autoplay) this.start();
    }
}

// Init all sliders on the page (hero + gallery)
document.querySelectorAll('.slider').forEach(s => new SimpleSlider(s));

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
