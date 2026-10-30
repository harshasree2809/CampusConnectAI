import { useEffect,useRef } from 'react';
export default function DialogAccessibility({handlers}:{handlers:Record<string,()=>void>}) {
 const callbacks=useRef(handlers);callbacks.current=handlers;
 useEffect(()=>{
  let active:HTMLElement|null=null,restore:HTMLElement|null=null;
  const candidates=()=>Array.from(document.querySelectorAll<HTMLElement>('[data-dialog]')).filter(e=>e.getClientRects().length);
  const focusable=(e:HTMLElement)=>Array.from(e.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')).filter(el=>el.getClientRects().length);
  const update=()=>{const dialogs=candidates(),next=dialogs.at(-1)||null;if(next===active)return;if(next){if(!active)restore=document.activeElement as HTMLElement;active=next;const title=next.querySelector('h2,h3');if(title&&!next.getAttribute('aria-label')){title.id ||= `dialog-title-${next.dataset.dialog}`;next.setAttribute('aria-labelledby',title.id);}next.setAttribute('role','dialog');next.setAttribute('aria-modal','true');next.tabIndex=-1;(focusable(next)[0]||next).focus();document.body.style.overflow='hidden';}else{active=null;document.body.style.overflow='';if(restore?.isConnected)restore.focus();}};
  const key=(e:KeyboardEvent)=>{if(!active)return;if(e.key==='Escape'){e.preventDefault();callbacks.current[active.dataset.dialog||'']?.();}if(e.key==='Tab'){const items=focusable(active);if(!items.length){e.preventDefault();active.focus();return;}const first=items[0],last=items.at(-1)!;if(e.shiftKey&&(document.activeElement===first||!active.contains(document.activeElement))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||!active.contains(document.activeElement))){e.preventDefault();first.focus();}}};
  const observer=new MutationObserver(update);observer.observe(document.body,{childList:true,subtree:true});document.addEventListener('keydown',key);update();return()=>{observer.disconnect();document.removeEventListener('keydown',key);document.body.style.overflow='';};
 },[]);return null;
}
