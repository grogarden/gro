import{a as o,x as k,t as u,c as d,r as v,f as h,s as t,y as W}from"../chunks/disclose-version.Co2svW8Z.js";import{p as O,t as f,k as Q,f as i,x as E,e as X,s as Y}from"../chunks/runtime.YS-gNbUI.js";import{s as j,d as Z}from"../chunks/render.ig7KG2v7.js";import{i as c}from"../chunks/props.CwKo13Su.js";import{s as q,a as J,f as $,t as aa,p as ea,G as ra,L as ta,b as oa,c as sa,d as K,P as va,e as N}from"../chunks/package.C_h_eIT0.js";import{b as _a}from"../chunks/entry.BlTyVQNL.js";import{s as P}from"../chunks/snippet.DR7TLxAa.js";import{s as la,a as na,p as ia}from"../chunks/stores.iHuO64Fo.js";var da=u('<div class="repo_name svelte-1widkfd"> </div>'),ca=u("<img>"),ga=u("<blockquote> </blockquote>"),ma=u('<p class="text_align_center"> <!></p>'),ua=u('<div class="homepage_url svelte-1widkfd"><a class="chip svelte-1widkfd"> </a></div>'),ha=u('<a class="chip svelte-1widkfd">repo</a>'),ka=u('<a class="chip svelte-1widkfd" title="version"> </a>'),fa=u('<a class="chip svelte-1widkfd">npm</a>'),pa=u('<blockquote class="npm_url svelte-1widkfd"> </blockquote>'),ba=u('<div class="package_summary svelte-1widkfd"><header class="box svelte-1widkfd"><!> <!></header> <!> <!> <!> <!> <div class="links svelte-1widkfd"><!> <!> <!></div> <!></div>');function xa(L,a){O(a,!0);const x=la(),w=()=>na(ia,"$page",x),D=E(()=>a.pkg),S=E(()=>{let{package_json:s}=i(D);return[s]}),g=E(()=>i(S)[0]);var F=ba(),z=d(F),T=d(z);c(T,()=>a.repo_name,s=>{var r=k(),m=h(r);P(m,()=>a.repo_name,()=>a.pkg.repo_name),o(s,r)},s=>{var r=da(),m=d(r);v(r),f(()=>j(m,a.pkg.repo_name)),o(s,r)});var V=t(T,!0);V.nodeValue="  ";var G=t(V);c(G,()=>a.pkg.logo_url,s=>{var r=k(),m=h(r);c(m,()=>a.logo,n=>{var e=k(),_=h(e);P(_,()=>a.logo,()=>a.pkg.logo_url,()=>a.pkg.logo_alt),o(n,e)},n=>{var e=ca();f(()=>{q(e,"src",a.pkg.logo_url),q(e,"alt",a.pkg.logo_alt),J(e,"width","var(--size, var(--icon_size_xl2))"),J(e,"height","var(--size, var(--icon_size_xl2))")}),o(n,e)}),o(s,r)}),v(z);var y=t(t(z,!0));c(y,()=>i(g).motto,s=>{var r=k(),m=h(r);c(m,()=>a.motto,n=>{var e=k(),_=h(e);P(_,()=>a.motto,()=>i(g).motto,()=>i(g).glyph),o(n,e)},n=>{var e=ga(),_=d(e);v(e),f(()=>j(_,`${i(g).motto??""}
				${i(g).glyph??""}`)),o(n,e)}),o(s,r)});var A=t(t(y,!0));c(A,()=>i(g).description,s=>{var r=k(),m=h(r);c(m,()=>a.description,n=>{var e=k(),_=h(e);P(_,()=>a.description,()=>i(g).description,()=>i(g).glyph),o(n,e)},n=>{var e=ma(),_=d(e),C=t(_);c(C,()=>!i(g).motto,U=>{var I=W();f(()=>j(I,i(g).glyph)),o(U,I)}),v(e),f(()=>j(_,`${i(g).description??""} `)),o(n,e)}),o(s,r)});var B=t(t(A,!0));c(B,()=>a.children,s=>{var r=k(),m=h(r);P(m,()=>a.children),o(s,r)});var M=t(t(B,!0));c(M,()=>a.pkg.homepage_url,s=>{var r=k(),m=h(r);c(m,()=>a.homepage_url,n=>{var e=k(),_=h(e);P(_,()=>a.homepage_url,()=>a.pkg.homepage_url),o(n,e)},n=>{var e=ua(),_=d(e),C=d(_);f(()=>j(C,$(a.pkg.homepage_url))),v(_),v(e),f(()=>{q(_,"href",a.pkg.homepage_url),aa(_,"selected",a.pkg.homepage_url===w().url.href)}),o(n,e)}),o(s,r)});var H=t(t(M,!0)),p=d(H);c(p,()=>a.pkg.repo_url,s=>{var r=ha();f(()=>q(r,"href",a.pkg.repo_url)),o(s,r)});var l=t(t(p,!0));c(l,()=>a.pkg.changelog_url,s=>{var r=ka(),m=d(r);v(r),f(()=>{q(r,"href",a.pkg.changelog_url),j(m,i(g).version)}),o(s,r)});var b=t(t(l,!0));c(b,()=>a.pkg.npm_url,s=>{var r=fa();f(()=>q(r,"href",a.pkg.npm_url)),o(s,r)}),v(H);var R=t(t(H,!0));c(R,()=>a.pkg.npm_url,s=>{var r=k(),m=h(r);c(m,()=>a.npm_url,n=>{var e=k(),_=h(e);P(_,()=>a.npm_url,()=>a.pkg.npm_url),o(n,e)},n=>{var e=pa(),_=d(e);v(e),f(()=>j(_,`npm i -D ${i(g).name??""}`)),o(n,e)}),o(s,r)}),v(F),o(L,F),Q()}var wa=u('<div hidden>@ryanatkn@hci.social on <a rel="me" href="https://hci.social/@ryanatkn">Mastodon</a></div> <div hidden>@webdevladder@mastodon.social on <a rel="me" href="https://mastodon.social/@webdevladder">Mastodon</a></div>',1);function ya(L){var a=wa(),x=h(a);v(x);var w=t(t(x,!0));v(w),o(L,a)}var qa=(L,a)=>X(a,!i(a)),za=u("🪜",1),ja=u("🔨",1),Pa=u('<div class="box w_100"><!></div>'),La=u('<div class="box"><!></div>'),Da=u('<a class="mb_xs">about</a>'),Fa=u('<main class="box w_100 svelte-1mls9ls"><div class="box width_md"><section class="box svelte-1mls9ls"><h1>gro</h1> <a class="panel p_md box mb_xl3" title="source repo" href="https://github.com/ryanatkn/gro"><!></a> <aside>This website is a work in progress!<br> For now, docs are in <a href="https://github.com/ryanatkn/gro">the source repo</a></aside></section> <section class="panel mb_lg p_md w_100 relative svelte-1mls9ls"><button type="button" class="toggle icon_button svelte-1mls9ls"><!></button> <!></section> <section class="svelte-1mls9ls"><!></section></div></main>');function Ca(L,a){O(a,!0);const x=ea(sa,oa);let w=Y(!1);var D=Fa(),S=d(D),g=d(S),F=d(g),z=t(t(F,!0)),T=d(z);ra(T,{size:"var(--icon_size_lg)"}),v(z);var V=t(t(z,!0));v(V),v(g);var G=t(t(g,!0)),y=d(G);y.__click=[qa,w];var A=d(y);c(A,()=>i(w),p=>{var l=za();o(p,l)},p=>{var l=ja();o(p,l)}),v(y);var B=t(t(y,!0));c(B,()=>i(w),p=>{var l=Pa();K(3,l,()=>N);var b=d(l);va(b,{pkg:x}),v(l),o(p,l)},p=>{var l=La();K(3,l,()=>N);var b=d(l);xa(b,{pkg:x}),v(l),o(p,l)}),v(G);var M=t(t(G,!0)),H=d(M);ta(H,{pkg:x,logo_header:l=>{var b=Da();q(b,"href",`${_a??""}/about`),o(l,b)},children:(l,b)=>{ya(l)},$$slots:{default:!0}}),v(M),v(S),v(D),f(()=>q(y,"title",i(w)?"show package summary":"show package detail")),o(L,D),Q()}Z(["click"]);export{Ca as component};
