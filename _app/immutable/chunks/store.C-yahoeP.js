import{aa as _,b as h,ac as g,h as i,a4 as y,i as l,J as o,k as f,g as b,l as p,n as t,N as v,ad as T,_ as w,y as x,w as A}from"./runtime.CvEgegzC.js";let u;function C(){u=void 0}function D(n){let s=null,a=i;var e;if(i){for(s=b,u===void 0&&(u=p(document.head));u!==null&&(u.nodeType!==8||u.data!==y);)u=l(u);u===null?o(!1):u=f(l(u))}i||(e=document.head.appendChild(_()));try{h(()=>n(e),g)}finally{a&&(o(!0),u=b,f(s))}}function E(n,s,a){if(n==null)return s(void 0),t;const e=v(()=>n.subscribe(s,a));return e.unsubscribe?()=>e.unsubscribe():e}let r=!1;function F(n,s,a){const e=a[s]??(a[s]={store:null,source:w(void 0),unsubscribe:t});if(e.store!==n)if(e.unsubscribe(),e.store=n??null,n==null)e.source.v=void 0,e.unsubscribe=t;else{var d=!0;e.unsubscribe=E(n,c=>{d?e.source.v=c:A(e.source,c)}),d=!1}return x(e.source)}function H(){const n={};return T(()=>{for(var s in n)n[s].unsubscribe()}),n}function N(n){var s=r;try{return r=!1,[n(),r]}finally{r=s}}export{F as a,N as c,D as h,C as r,H as s};
