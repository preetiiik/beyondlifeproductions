const menuToggle = document.getElementById('menuToggle');
const menu = document.getElementById('mobileMenu');
const mediaMotion = matchMedia('(prefers-reduced-motion: reduce)');
let introActive = Boolean(document.getElementById('cinemaIntro'));
let motionPaused = mediaMotion.matches;
let imagesPaused = mediaMotion.matches;
const pauseImages = document.getElementById('imagePause');
const pauseMotion = document.getElementById('motionToggle');
function setMenu(open) {
  menu.classList.toggle('open', open);
  menu.inert = !open;
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.textContent = open ? 'CLOSE' : 'MENU';
}
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => {
  if (menu.inert) return;
  if (e.key === 'Escape') { setMenu(false); menuToggle.focus(); }
  if (e.key === 'Tab') {
    const links = [...menu.querySelectorAll('a')];
    if (e.shiftKey && document.activeElement === menuToggle) { e.preventDefault(); links.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === links.at(-1)) { e.preventDefault(); menuToggle.focus(); }
  }
});
// Circular photo selectors expand into the full hero, following the supplied reference.
const homeSlides=[
  [4,'A couple holding hands as they cross a rocky stream'],
  [5,'A couple embracing in a sunlit forest'],
  [9,'A couple sharing an affectionate glance'],
  [3,'A wedding couple resting their foreheads together'],
  [13,'A family member carefully arranging the bridal veil']
];
let homeSlideIndex=0,homePhotoTimer;
let homeSlideChanging=false;
async function showHomeSlide(index){
  const photo=document.getElementById('homeCarouselPhoto');
  if(!photo||homeSlideChanging)return;
  const nextIndex=(index+homeSlides.length)%homeSlides.length;
  if(nextIndex===homeSlideIndex)return;
  homeSlideChanging=true;
  const [number,alt]=homeSlides[nextIndex];
  const thumb=document.querySelector(`[data-home-slide="${nextIndex}"]`);
  const heroRect=document.getElementById('home').getBoundingClientRect();
  const thumbRect=thumb?.getBoundingClientRect();
  const cx=thumbRect?thumbRect.left+thumbRect.width/2-heroRect.left:heroRect.width*.88;
  const cy=thumbRect?thumbRect.top+thumbRect.height/2-heroRect.top:heroRect.height*.5;
  const incoming=new Image();
  incoming.src=`assets/images/homepage-gallery/photo${number}.webp`;
  incoming.alt=alt;incoming.className='hero-photo-incoming';
  try {
    await incoming.decode();
    const stage=photo.parentElement;stage.append(incoming);
    const reduced=mediaMotion.matches||motionPaused;
    if(!reduced){
      const radius=Math.hypot(heroRect.width,heroRect.height);
      const options={duration:1350,easing:'cubic-bezier(.7,0,.2,1)',fill:'forwards'};
      const enter=incoming.animate([
        {clipPath:`circle(0px at ${cx}px ${cy}px)`,transform:'scale(1.07)'},
        {clipPath:`circle(${radius}px at ${cx}px ${cy}px)`,transform:'scale(1)'}
      ],options);
      await enter.finished;
    }
    photo.src=incoming.src;photo.alt=alt;
    photo.getAnimations().forEach(animation=>animation.cancel());
    incoming.remove();homeSlideIndex=nextIndex;
    document.querySelectorAll('[data-home-slide]').forEach(button=>{
      const active=Number(button.dataset.homeSlide)===nextIndex;
      button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));
    });
    const count=document.getElementById('homeCarouselCount');
    if(count)count.textContent=`${String(homeSlideIndex+1).padStart(2,'0')} / ${String(homeSlides.length).padStart(2,'0')}`;
  } catch {incoming.remove();photo.getAnimations().forEach(animation=>animation.cancel());}
  finally {homeSlideChanging=false;}
}
function updateImagePlayback(){
  clearInterval(homePhotoTimer);if(!document.getElementById('homeCarouselPhoto'))return;
  const stopped=introActive||imagesPaused||motionPaused||mediaMotion.matches||document.hidden;
  if(pauseImages){
    pauseImages.setAttribute('aria-pressed',String(stopped));
    pauseImages.innerHTML=stopped?'PLAY IMAGES <span>â–·</span>':'PAUSE IMAGES <span>â…¡</span>';
    pauseImages.setAttribute('aria-label',stopped?'Play hero photographs':'Pause hero photographs');
  }
  if(!stopped)homePhotoTimer=setInterval(()=>showHomeSlide(homeSlideIndex+1),6000);
}
if(document.getElementById('homeCarouselPhoto'))homeSlides.forEach(([number])=>{const image=new Image();image.src=`assets/images/homepage-gallery/photo${number}.webp`;});
document.getElementById('homeCarouselPrev')?.addEventListener('click',()=>{showHomeSlide(homeSlideIndex-1);updateImagePlayback();});
document.getElementById('homeCarouselNext')?.addEventListener('click',()=>{showHomeSlide(homeSlideIndex+1);updateImagePlayback();});
pauseImages?.addEventListener('click',()=>{imagesPaused=!(imagesPaused||motionPaused);if(!imagesPaused&&motionPaused){motionPaused=false;updateMotion();}updateImagePlayback();});
document.querySelectorAll('[data-home-slide]').forEach(button=>button.addEventListener('click',()=>{showHomeSlide(Number(button.dataset.homeSlide));updateImagePlayback();}));
const driftElements=[...document.querySelectorAll('[data-drift]')];
let scheduled=false;
function paintDrift() {
  scheduled=false;
  const feelTrack=document.querySelector('.feel-gallery');
  if(feelTrack){
    const rect=feelTrack.getBoundingClientRect();
    const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height-innerHeight)));
    const still=motionPaused||mediaMotion.matches;
    const zoom=still?0:Math.max(0,Math.min(1,(progress-.62)/.38));
    const copy=feelTrack.querySelector('.feel-center');
    copy.style.opacity=still?1:Math.max(0,1-progress*2.8);
    copy.style.visibility=!still&&progress>.4?'hidden':'visible';
    feelTrack.querySelectorAll('.tile').forEach((photo,index)=>{
      // Reveal each photograph only after scrolling into the pinned scene.
      const revealStart=index===8?.48:.015+(index%4)*.025;
      const revealProgress=Math.max(0,Math.min(1,(progress-revealStart)/.09));
      const reveal=still?1:revealProgress*revealProgress*(3-2*revealProgress);
      if(index===8){
        photo.style.width=`${30+70*zoom}%`;
        photo.style.height=`${46+54*zoom}%`;
        photo.style.left=`${35*(1-zoom)}%`;
        photo.style.top=`${(still?72:112-progress*95)*(1-zoom)}%`;
        photo.style.transform='none';
        photo.style.opacity=reveal;
      }else{
        photo.style.transform=still?'none':`translate3d(0,${-progress*innerHeight*(1.25+(index%3)*.35)+(1-reveal)*60}px,0)`;
        photo.style.opacity=reveal*(1-zoom);
      }
    });
  }
  driftElements.forEach(el=>{
    if(el.closest('.feel-gallery'))return;
    if (motionPaused || mediaMotion.matches) {el.style.transform='';return;}
    if (el.classList.contains('tile')) {
      const track=document.querySelector('.experience-track').getBoundingClientRect();
      const progress=Math.max(0,Math.min(1,-track.top/Math.max(1,track.height-innerHeight)));
      const speed=2.5;
      el.style.transform=`translate3d(0,${(-progress)*innerHeight*speed}px,0)`;
      return;
    }
    const rect=el.parentElement.getBoundingClientRect();
    if(rect.bottom<0 || rect.top>innerHeight)return;
    const progress=(innerHeight-rect.top)/(innerHeight+rect.height)-.5;
    el.style.transform=`translate3d(0,${progress*Number(el.dataset.drift)*2}px,0)`;
  });
}
function scheduleDrift(){if(!scheduled){scheduled=true;requestAnimationFrame(paintDrift);}}
function updateMotion(){document.body.classList.toggle('motion-paused',motionPaused);if(pauseMotion){pauseMotion.textContent=motionPaused?'PLAY MOTION':'PAUSE MOTION';pauseMotion.setAttribute('aria-pressed',String(motionPaused));}paintDrift();updateImagePlayback();}
pauseMotion?.addEventListener('click',()=>{motionPaused=!motionPaused;updateMotion();});
mediaMotion.addEventListener('change',()=>{motionPaused=mediaMotion.matches;imagesPaused=mediaMotion.matches;updateMotion();});
window.addEventListener('scroll',scheduleDrift,{passive:true});
window.addEventListener('resize',scheduleDrift,{passive:true});
document.addEventListener('visibilitychange',updateImagePlayback);
function openLinkedStory(){const target=document.getElementById(location.hash.slice(1));if(target instanceof HTMLDetailsElement){target.open=true;requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));}}
window.addEventListener('hashchange',openLinkedStory);
openLinkedStory();updateMotion();document.getElementById('year').textContent=new Date().getFullYear();

// Turn the keepsake over after the visitor has had time to see the photograph.
const testimonialCard = document.getElementById('testimonialCard');
const testimonialTurn = document.getElementById('testimonialTurn');
const testimonialFront = document.getElementById('testimonialFront');
const testimonialBack = document.getElementById('testimonialBack');
let testimonialTimer;
let testimonialVisible = false;
function turnTestimonial(showNote) {
  testimonialCard.classList.toggle('is-flipped',showNote);
  testimonialCard.setAttribute('aria-pressed',String(showNote));
  testimonialCard.setAttribute('aria-label',showNote?'Turn note over to see the photograph':'Turn photograph over to read the testimonial');
  testimonialFront.setAttribute('aria-hidden',String(showNote));
  testimonialBack.setAttribute('aria-hidden',String(!showNote));
  testimonialTurn.textContent=showNote?'SEE THE PHOTOGRAPH AGAIN â†—':'TURN PHOTO TO READ THE NOTE â†—';
}
function scheduleTestimonial() {
  clearTimeout(testimonialTimer);
  if(testimonialVisible && !document.hidden && !motionPaused && !mediaMotion.matches && testimonialCard && !testimonialCard.classList.contains('is-flipped')) {
    testimonialTimer=setTimeout(()=>turnTestimonial(true),4000);
  }
}
function toggleTestimonial() {
  turnTestimonial(testimonialCard && !testimonialCard.classList.contains('is-flipped'));
  scheduleTestimonial();
}
testimonialCard?.addEventListener('click',toggleTestimonial);
testimonialTurn?.addEventListener('click',toggleTestimonial);
if(testimonialCard && 'IntersectionObserver' in window) {
  new IntersectionObserver(entries=>{testimonialVisible=entries[0].isIntersecting;scheduleTestimonial();},{threshold:.6}).observe(testimonialCard);
} else if(testimonialCard) {testimonialVisible=true;scheduleTestimonial();}
document.addEventListener('visibilitychange',scheduleTestimonial);
pauseMotion?.addEventListener('click',scheduleTestimonial);
mediaMotion.addEventListener('change',scheduleTestimonial);

// Each archive folder opens only the photographs assigned to that couple.
const coupleAlbums = {
  'swati-kiran': {name:'Swati & Kiran',photos:[9,2]},
  'preksha-akshay': {name:'Preksha & Akshay',photos:[12,4,5,7]},
  'apurva-pulkit': {name:'Apurva & Pulkit',photos:[11,6]},
  'fatima-zafir': {name:'Fatima & Zafir',photos:[8,3,10,13,14]}
};
const coupleGallery=document.getElementById('coupleGallery');
let activeFolder;
document.querySelectorAll('[data-couple]').forEach(folder=>folder.addEventListener('click',()=>{
  const album=coupleAlbums[folder.dataset.couple];
  if(!album)return;
  activeFolder=folder;
  document.getElementById('coupleGalleryTitle').textContent=album.name;
  const photos=document.getElementById('coupleGalleryPhotos');
  photos.replaceChildren();
  album.photos.forEach((number,index)=>{
    const figure=document.createElement('figure');
    const img=document.createElement('img');
    img.src=`assets/images/homepage-gallery/photo${number}.webp`;
    img.alt=`${album.name} â€” photograph ${index+1}`;
    img.loading=index<2?'eager':'lazy';
    const caption=document.createElement('figcaption');
    caption.textContent=`${album.name.toUpperCase()} / ${String(index+1).padStart(2,'0')}`;
    figure.append(img,caption);photos.append(figure);
  });
  coupleGallery.showModal();coupleGallery.scrollTop=0;
  document.body.classList.add('gallery-open');
}));
document.getElementById('closeCoupleGallery')?.addEventListener('click',()=>coupleGallery.close());
coupleGallery?.addEventListener('click',event=>{
  if(event.target!==coupleGallery)return;
  const rect=coupleGallery.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)coupleGallery.close();
});
coupleGallery?.addEventListener('close',()=>{document.body.classList.remove('gallery-open');activeFolder?.focus({preventScroll:true});});


// Client reviews supplied in the testimonial reference screenshots.
const clientReviews = [
  {name:'Zafer & Fatima',photo:14,placeholder:false,paragraphs:[
    "What is fascinating is that from the word go, Hitesh was exceptionally patient and understanding, taking the time to truly grasp our expectations, including the unsaid. Beyond the skill of storytelling, what sets him apart is his compassionate approach that led to an unforgettable wedding experience.",
    "Every special moment was impressively captured. Every family member felt included and engaged. This is nothing else but truly unique. Our wedding film is a treasure, a cherished keepsake that will be close to our hearts for a lifetime."
  ]},
  {name:'Vivek & Mehul',photo:3,placeholder:true,paragraphs:[
    "We were very anxious and nervous during our wedding, but the photographs and the film convey the happiness that we were feeling at a deeper level. What felt chaotic then, has now become a beautiful memory.",
    "Hitesh and his team seem to have an enormous passion and a rare balance between going with the flow and capturing some premeditated shots. This is very impressive, considering the many wedding films and photographs we've seen of others in the past. There is not one, but many moments that will stay with us forever."
  ]},
  {name:'Neha & Uthsav',photo:11,placeholder:true,paragraphs:[
    "As a bride & groom, our anxiety was flying high with so much going on. It is only later, when we saw the photographs and the film, we deeply felt the different facets of our emotions and this is what will stay with us beyond life.",
    "Nothing less than some magic, Hitesh organically transformed from being a professional visual storyteller into someone who is like a friend at your wedding. This special quality along with a presence of mind and his attention to detail, makes him stand apart to deliver an experience as per the expectations of the bride and groom."
  ]}
];
function selectClientReview(index) {
  if(!testimonialCard)return;
  const review=clientReviews[index];
  clearTimeout(testimonialTimer);
  // Reset without rotating the previous couple's note through the new photo.
  const rotator=testimonialCard.querySelector('.keepsake-rotator');
  rotator.style.transition='none';turnTestimonial(false);
  const photo=testimonialFront.querySelector('img');
  photo.src=`assets/images/homepage-gallery/photo${review.photo}.webp`;
  photo.alt=review.placeholder?'Temporary gallery photograph; matching couple image to be supplied':review.name+' wedding portrait';
  testimonialFront.querySelector('.photo-inscription').textContent=review.placeholder?'couple photograph to follow':review.name;
  const quote=testimonialBack.querySelector('.handwritten-quote');
  quote.replaceChildren();
  review.paragraphs.forEach(text=>{const paragraph=document.createElement('span');paragraph.className='review-paragraph';paragraph.textContent='\u201c'+text+'\u201d';quote.append(paragraph);});
  testimonialBack.querySelector('.note-signature').textContent=review.name;
  testimonialBack.querySelector('.note-sample').textContent='WORDS FROM OUR COUPLES';
  document.getElementById('testimonialImageNote').textContent=review.placeholder?'Temporary gallery image. Matching photograph for '+review.name+' to be added.':'';
  document.querySelectorAll('[data-review]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.review)===index)));
  requestAnimationFrame(()=>{requestAnimationFrame(()=>{rotator.style.transition='';scheduleTestimonial();});});
}
function revealClientReview(button){
  // Keep the photograph visible for the normal four-second viewing period.
  selectClientReview(Number(button.dataset.review));
}

document.querySelectorAll('[data-review]').forEach(button=>{
  button.addEventListener('click',()=>revealClientReview(button));
  button.addEventListener('mouseenter',()=>{
    if(matchMedia('(hover: hover)').matches && button.getAttribute('aria-pressed')!=='true')revealClientReview(button);
  });
  button.addEventListener('focus',()=>{
    if(button.getAttribute('aria-pressed')!=='true')revealClientReview(button);
  });
});
selectClientReview(0);


// Translucent paper and a tilted brand card peel away to reveal the homepage.
const cinemaIntro=document.getElementById('cinemaIntro');
const introPage=[document.querySelector('.site-header'),document.querySelector('main'),document.querySelector('footer')];
let cinemaTimer;
function finishCinemaIntro(skipped=false){
  clearTimeout(cinemaTimer);introActive=false;
  cinemaIntro.classList.add('intro-finished');cinemaIntro.inert=true;
  document.body.classList.remove('intro-playing');
  introPage.forEach(element=>element.inert=false);
  updateImagePlayback();
  if(skipped)document.querySelector('.wordmark').focus({preventScroll:true});
}
document.getElementById('cinemaSkip')?.addEventListener('click',()=>finishCinemaIntro(true));
// Start only once the page is ready, even when reloading a section URL.
function startCinemaIntro(){
  introPage.forEach(element=>element.inert=true);
  window.scrollTo({top:0,behavior:'instant'});
  cinemaIntro.classList.toggle('intro-reduced',mediaMotion.matches);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    cinemaIntro.classList.add('is-running');
    cinemaTimer=setTimeout(()=>{finishCinemaIntro();window.scrollTo({top:0,behavior:'instant'});},mediaMotion.matches?700:2850);
  }));
}
if(cinemaIntro){
  if(document.readyState==='complete')startCinemaIntro();
  else window.addEventListener('load',startCinemaIntro,{once:true});
}
mediaMotion.addEventListener('change',()=>{if(mediaMotion.matches&&introActive)finishCinemaIntro();});

// Keep the navigation clear over the hero, then switch to the paper palette.
const editorialHeader=document.getElementById('header');
function updateHeaderPalette(){
  const hero=document.getElementById('home');
  editorialHeader.classList.toggle('is-solid',!hero || hero.getBoundingClientRect().bottom<=editorialHeader.offsetHeight);
}
window.addEventListener('scroll',updateHeaderPalette,{passive:true});
window.addEventListener('resize',updateHeaderPalette,{passive:true});
updateHeaderPalette();

// A gentle settle as each emotional chapter enters the visual journey.
if('IntersectionObserver' in window){
  const emotionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-in-view');emotionObserver.unobserve(entry.target);}}),{threshold:.15});
  document.querySelectorAll('.emotion-chapter').forEach(chapter=>emotionObserver.observe(chapter));
}

// Compose a wedding enquiry in the visitor's email app.
const enquiryForm=document.getElementById('enquiryForm');
enquiryForm?.addEventListener('submit',event=>{
  event.preventDefault();
  if(!enquiryForm.reportValidity())return;
  const data=new FormData(enquiryForm);
  const body=['Name: '+data.get('name'),'Email: '+data.get('email'),'Phone: '+data.get('phone'),'Wedding date: '+data.get('date'),'Estimated guest count: '+data.get('guests'),'Venue / city: '+data.get('venue'),'Interested in: '+data.get('service'),'','Their story:',''+data.get('message')].join('\n');
  const recipient='hello@beyondlifeproductions.com';
  const subject='Wedding enquiry â€” '+data.get('name');
  const mailto='mailto:'+recipient+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  document.getElementById('enquiryMailLink').href=mailto;
  document.getElementById('enquiryGmailLink').href='https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(recipient)+'&su='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  document.getElementById('enquiryDraft').value='To: '+recipient+'\nSubject: '+subject+'\n\n'+body;
  document.getElementById('enquiryCopyStatus').textContent='';
  document.getElementById('enquiryDelivery').hidden=false;
  window.location.href=mailto;
});
document.getElementById('enquiryCopy')?.addEventListener('click',async()=>{
  const draft=document.getElementById('enquiryDraft');
  const status=document.getElementById('enquiryCopyStatus');
  try{
    await navigator.clipboard.writeText(draft.value);
    status.textContent='Copied. Paste into your email and send when ready.';
  }catch{
    draft.focus();draft.select();
    status.textContent='Select and copy the enquiry text, then paste it into your email.';
  }
});

