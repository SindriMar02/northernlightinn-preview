import {initLenis,lenis} from './lenis.js';
import {initMotion} from './motion.js';
import {initMenu} from './menu.js';
import {initStay} from './stay.js';
const {gsap,ScrollTrigger,CustomEase}=window;
if(gsap&&ScrollTrigger){
 gsap.registerPlugin(ScrollTrigger,CustomEase);CustomEase.create('house','.625,.05,0,1');ScrollTrigger.config({ignoreMobileResize:true});
 initLenis(gsap,ScrollTrigger);
 const menu=initMenu(),stay=initStay();
 window.nli={menu,stay,get lenis(){return lenis;}};
 await initMotion(gsap,ScrollTrigger);
 document.documentElement.dataset.ready='true';
}
