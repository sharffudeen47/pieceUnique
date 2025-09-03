// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
        const id=a.getAttribute('href');
        if(id.length>1){
            e.preventDefault();
            document.querySelector(id)?.scrollIntoView({behavior:'smooth'});
        }
    });
});

// Slider
class SimpleSlider{
    constructor(root){
        this.root=root;
        this.track=root.querySelector('.slides');
        this.slides=[...root.querySelectorAll('.slide')];
        this.prevBtn=root.querySelector('.prev');
        this.nextBtn=root.querySelector('.next');
        this.index=0; this.len=this.slides.length;
        this.intervalMs=parseInt(root.dataset.interval||'5000',10);
        this.autoplay=root.dataset.autoplay==='true';
        this.timer=null;

        if(root.dataset.dots==='true'){ this.makeDots(); }
        this.update();

        this.prevBtn?.addEventListener('click',()=>this.go(-1));
        this.nextBtn?.addEventListener('click',()=>this.go(1));

        if(this.autoplay){ this.start(); root.addEventListener('mouseenter',()=>this.stop()); root.addEventListener('mouseleave',()=>this.start()); }
        window.addEventListener('visibilitychange',()=>document.hidden?this.stop():this.start());
    }
    makeDots(){
        const dots=document.createElement('div');dots.className='dots';
        this.dots=[];
        for(let i=0;i<this.len;i++){
            const dot=document.createElement('button');
            dot.className='dot';
            dot.addEventListener('click',()=>{this.index=i;this.update(true);});
            dots.appendChild(dot);
            this.dots.push(dot);
        }
        this.root.appendChild(dots);
    }
    start(){ if(!this.autoplay) return; this.stop(); this.timer=setInterval(()=>this.go(1), this.intervalMs); }
    stop(){ if(this.timer){ clearInterval(this.timer); this.timer=null; } }
    go(step){ this.index=(this.index+step+this.len)%this.len; this.update(true); }
    update(user=false){
        this.track.style.transform=`translateX(-${this.index*100}%)`;
        this.dots?.forEach((d,i)=>d.classList.toggle('active',i===this.index));
        if(user && this.autoplay){ this.start(); }
    }
}
document.querySelectorAll('.slider').forEach(s=>new SimpleSlider(s));

// Footer year
document.getElementById('year').textContent=new Date().getFullYear();
