import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import LightRays from './backgrounds/LightRays/LightRays';
import LetterGlitch from './backgrounds/LetterGlitch/LetterGlitch';
import './portfolio-background.css';

function PortfolioBackground() {
 const [light,setLight]=useState(document.body.classList.contains('light-mode'));
 const [reduced,setReduced]=useState(matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [hidden,setHidden]=useState(document.hidden);
 const [supported,setSupported]=useState(false);
 useEffect(()=>{
  // Leave the original static theme intact when WebGL2 is unavailable.
  const probe=document.createElement('canvas');
  const gl=probe.getContext('webgl2');
  setSupported(Boolean(gl));
  gl?.getExtension('WEBGL_lose_context')?.loseContext();
  const onContextLost=event=>{if(event.target.closest?.('#portfolio-background'))setSupported(false);};
  document.addEventListener('webglcontextlost',onContextLost,true);
  const observer=new MutationObserver(()=>setLight(document.body.classList.contains('light-mode')));
  observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const motion=()=>setReduced(media.matches);
  const visibility=()=>setHidden(document.hidden);
  media.addEventListener('change',motion);
  document.addEventListener('visibilitychange',visibility);
  return ()=>{document.removeEventListener('webglcontextlost',onContextLost,true);observer.disconnect();media.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 const active=supported&&!reduced&&!hidden;
 useEffect(()=>{
  document.body.dataset.portfolioBackground=active?'animated':'static';
  return ()=>{delete document.body.dataset.portfolioBackground;};
 },[active]);
 return <div id="portfolio-background" aria-hidden="true" data-active={active}>
  {active&&<>
   <LetterGlitch style={{opacity:0.656}} speed={0.5} interactive={false} clickEffect="none" characters="01" lightMode={light} glitchColors={light?['#24516c','#65457a']:['#94bbcc','#a299c9']} baseOpacity={0.10} density={0.75} dpr={1} />
   <LightRays className="binary-rays-overlay" lightMode={light} raysColor={light?'#356a85':'#acd7ed'} intensity={0.85} rayLength={12} fadeDistance={3} followMouse={false} mouseInfluence={0} cursorShadow={false} clickPulse={false} maxDevicePixelRatio={1} />
  </>}
 </div>;
}
const host=document.createElement('div');
host.id='portfolio-background-root';
document.body.append(host);
createRoot(host).render(<PortfolioBackground/>);
