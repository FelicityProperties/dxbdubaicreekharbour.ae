/**
 * Self-repair, an inline script in every page's head (src/routes/__root.tsx): it runs before the site's own build
 * files, so it works when they don't.
 *
 * A browser can be left holding a bad saved copy of a build file (/assets/…): a "not found" kept from the minute a
 * deployment went live, or an old copy in the service worker's store. Then the page shows (it comes from the server)
 * but its scripts never start: videos stay still, buttons and FelicityBot do nothing (the owner's Chrome, 27 Nov 2026,
 * until a hard reload). Or the styles are missing and the logo fills the screen.
 *
 * When a build file the page asked for fails to load (its script or link reports an error, or the browser's own
 * timing record shows an error answer), or the design is missing (the logo is wider than it can be with styles on),
 * the script removes the service worker and its saved copies, fetches every build file the page uses again past
 * the browser's saved copies (which replaces them), and reloads once. A flag for the tab stops it ever looping, and
 * offline it does nothing (the service worker's saved pages are all there is then).
 *
 * Plain old JavaScript on purpose: it must run in any browser that can show the page.
 */
export const SELF_REPAIR_SCRIPT = [
  "(function(){",
  "var FLAG='dxbch-healed',busy=false;",
  // The address of one of this site's build files, or null.
  "function own(u){try{var p=new URL(u,location.href);return p.origin===location.origin&&p.pathname.indexOf('/assets/')===0?p.href:null}catch(e){return null}}",
  "function heal(){",
  "if(busy||navigator.onLine===false)return;",
  "try{if(sessionStorage.getItem(FLAG))return;sessionStorage.setItem(FLAG,'1')}catch(e){return}",
  "busy=true;",
  "var urls=[],i,els=document.querySelectorAll('script[src],link[href]');",
  "function add(x){x=own(x);if(x&&urls.indexOf(x)<0)urls.push(x)}",
  "for(i=0;i<els.length;i++)add(els[i].src||els[i].href);",
  "try{var r=performance.getEntriesByType('resource');for(i=0;i<r.length;i++)add(r[i].name)}catch(e){}",
  "var go=function(){location.reload()};",
  "Promise.all([",
  "navigator.serviceWorker?navigator.serviceWorker.getRegistrations().then(function(s){return Promise.all(s.map(function(x){return x.unregister()}))}):0,",
  "window.caches?caches.keys().then(function(k){return Promise.all(k.map(function(n){return caches.delete(n)}))}):0",
  "]).then(function(){return Promise.all(urls.map(function(u){return fetch(u,{cache:'reload',credentials:'same-origin'}).catch(function(){})}))}).then(go,go)",
  "}",
  // A script or stylesheet of the page failed: load errors don't bubble, so listen while they travel down.
  "addEventListener('error',function(e){var t=e.target;if(t&&(t.tagName==='SCRIPT'||t.tagName==='LINK')&&own(t.src||t.href))heal()},true);",
  // Errors that came before this script ran, and styles that never applied.
  "addEventListener('load',function(){try{",
  "var m=document.querySelector('.dxbch-mark'),bad=!!m&&m.getBoundingClientRect().width>60,",
  "r=performance.getEntriesByType?performance.getEntriesByType('resource'):[];",
  "for(var i=0;i<r.length;i++)if(r[i].responseStatus>=400&&own(r[i].name))bad=true;",
  "if(bad)heal()",
  "}catch(e){}})",
  "})()",
].join("");
