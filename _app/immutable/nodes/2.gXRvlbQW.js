import{a as r,p as f,t as g,c as v,f as k,s as t,q as Z}from"../chunks/disclose-version.Bt4mYUEc.js";import{p as U,t as h,g as i,a as W,k as B,h as $,F as aa}from"../chunks/runtime.DApEsr3h.js";import{s as x,d as ea}from"../chunks/render.bMqFZulk.js";import{i as d}from"../chunks/props.C8DLPOwn.js";import{s as w,a as p}from"../chunks/attributes.NPGlmVZK.js";import{t as K,s as C,f as ra,p as ta,a as N,L as oa,b as sa,c as O,P as ia,d as Q}from"../chunks/package.C4uUQuNH.js";import{b as R}from"../chunks/entry.gZDNkXOQ.js";import{u as va,s as _a}from"../chunks/store.BItgqo1V.js";import{p as na}from"../chunks/stores.XoNx_69g.js";var la=g('<div class="repo_name svelte-1widkfd"> </div>'),da=g("<img>"),ca=g("<blockquote> </blockquote>"),ga=g('<p class="text_align_center"> <!></p>'),ma=g('<div class="homepage_url svelte-1widkfd"><a class="chip svelte-1widkfd"> </a></div>'),ua=g('<a class="chip svelte-1widkfd">repo</a>'),ha=g('<a class="chip svelte-1widkfd" title="version"> </a>'),fa=g('<a class="chip svelte-1widkfd">npm</a>'),ka=g('<blockquote class="npm_url svelte-1widkfd"> </blockquote>'),pa=g('<div class="package_summary svelte-1widkfd"><header class="box svelte-1widkfd"><!> <!></header> <!> <!> <!> <!> <div class="links svelte-1widkfd"><!> <!> <!></div> <!></div>');function ba(P,e){U(e,!0);const y={};va(y);const q=()=>_a(na,"$page",y),D=B(()=>e.pkg),E=B(()=>{let{package_json:o}=i(D);return[o]}),c=B(()=>i(E)[0]),L=B(()=>e.pkg.homepage_url+"/favicon.png");var M=pa(),z=v(M),F=v(z);d(F,()=>e.repo_name,o=>{var a=f(),l=k(a);w(l,()=>e.repo_name,()=>e.pkg.repo_name),r(o,a)},o=>{var a=la(),l=v(a);h(()=>x(l,e.pkg.repo_name)),r(o,a)});var b=t(F,!0);b.nodeValue="  ";var G=t(b);d(G,()=>e.logo,o=>{var a=f(),l=k(a);w(l,()=>e.logo,()=>i(L)),r(o,a)},o=>{var a=da();h(()=>{p(a,"src",i(L)),p(a,"alt",`logo for ${e.pkg.repo_name??""}`),K(a,"pixelated",e.pixelated_logo),C(a,"width","var(--size, var(--icon_size_xl2))"),C(a,"height","var(--size, var(--icon_size_xl2))")}),r(o,a)});var S=t(t(z,!0));d(S,()=>i(c).motto,o=>{var a=f(),l=k(a);d(l,()=>e.motto,m=>{var s=f(),_=k(s);w(_,()=>e.motto,()=>i(c).motto,()=>i(c).glyph),r(m,s)},m=>{var s=ca(),_=v(s);h(()=>x(_,`${i(c).motto??""}
				${i(c).glyph??""}`)),r(m,s)}),r(o,a)});var T=t(t(S,!0));d(T,()=>i(c).description,o=>{var a=f(),l=k(a);d(l,()=>e.description,m=>{var s=f(),_=k(s);w(_,()=>e.description,()=>i(c).description,()=>i(c).glyph),r(m,s)},m=>{var s=ga(),_=v(s),H=t(_);d(H,()=>!i(c).motto,I=>{var J=Z(I);h(()=>x(J,i(c).glyph)),r(I,J)}),h(()=>x(_,`${i(c).description??""} `)),r(m,s)}),r(o,a)});var V=t(t(T,!0));d(V,()=>e.children,o=>{var a=f(),l=k(a);w(l,()=>e.children),r(o,a)});var A=t(t(V,!0));d(A,()=>e.pkg.homepage_url,o=>{var a=f(),l=k(a);d(l,()=>e.homepage_url,m=>{var s=f(),_=k(s);w(_,()=>e.homepage_url,()=>e.pkg.homepage_url),r(m,s)},m=>{var s=ma(),_=v(s),H=v(_);h(()=>x(H,ra(e.pkg.homepage_url))),h(()=>{p(_,"href",e.pkg.homepage_url),K(_,"selected",e.pkg.homepage_url===q().url.href)}),r(m,s)}),r(o,a)});var u=t(t(A,!0)),n=v(u);d(n,()=>e.pkg.repo_url,o=>{var a=ua();h(()=>p(a,"href",e.pkg.repo_url)),r(o,a)});var j=t(t(n,!0));d(j,()=>e.pkg.changelog_url,o=>{var a=ha(),l=v(a);h(()=>{p(a,"href",e.pkg.changelog_url),x(l,i(c).version)}),r(o,a)});var X=t(t(j,!0));d(X,()=>e.pkg.npm_url,o=>{var a=fa();h(()=>p(a,"href",e.pkg.npm_url)),r(o,a)});var Y=t(t(u,!0));d(Y,()=>e.pkg.npm_url,o=>{var a=f(),l=k(a);d(l,()=>e.npm_url,m=>{var s=f(),_=k(s);w(_,()=>e.npm_url,()=>e.pkg.npm_url),r(m,s)},m=>{var s=ka(),_=v(s);h(()=>x(_,`npm i -D ${i(c).name??""}`)),r(m,s)}),r(o,a)}),r(P,M),W()}var xa=(P,e)=>$(e,!i(e)),wa=g("🪜",1),ya=g("🔨",1),qa=g('<div class="box w_100"><!></div>'),za=g('<div class="box"><!></div>'),ja=g('<a class="mb_xs">about</a>'),Fa=g('<main class="box w_100 svelte-1mls9ls"><div class="box width_md"><section class="box svelte-1mls9ls"><h1>gro</h1> <a class="panel p_md box mb_xl3" title="source repo" href="https://github.com/ryanatkn/gro"><img alt="a pixelated green oak acorn with a glint of sun"></a> <aside>This website is a work in progress!<br> For now, docs are in <a href="https://github.com/ryanatkn/gro">the source repo</a></aside></section> <section class="panel mb_lg p_md w_100 relative svelte-1mls9ls"><button class="toggle icon_button svelte-1mls9ls"><!></button> <!></section> <section class="svelte-1mls9ls"><!></section></div> <div hidden>Mastodon verification: <a rel="me" href="https://hci.social/@ryanatkn">@ryanatkn@hci.social</a></div></main>');function Ca(P,e){U(e,!0);const y=ta(N.homepage,N,sa);let q=aa(!1);var D=Fa(),E=v(D),c=v(E),L=v(c),M=t(t(L,!0)),z=v(M);p(z,"src",`${R??""}/favicon.png`),C(z,"width","var(--icon_size_lg)"),C(z,"height","var(--icon_size_lg)");var F=t(t(c,!0)),b=v(F);b.__click=[xa,q];var G=v(b);d(G,()=>i(q),u=>{var n=wa();r(u,n)},u=>{var n=ya();r(u,n)});var S=t(t(b,!0));d(S,()=>i(q),u=>{var n=qa();O(3,n,()=>Q);var j=v(n);ia(j,{pkg:y}),r(u,n)},u=>{var n=za();O(3,n,()=>Q);var j=v(n);ba(j,{pkg:y}),r(u,n)});var T=t(t(F,!0)),V=v(T);{var A=u=>{var n=ja();p(n,"href",`${R??""}/about`),r(u,n)};oa(V,{pkg:y,logo_header:A})}h(()=>p(b,"title",i(q)?"show package summary":"show package detail")),r(P,D),W()}ea(["click"]);export{Ca as component};
