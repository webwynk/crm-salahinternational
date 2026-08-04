import{r as a,j as b}from"./app-kXNaKseS.js";/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=(...t)=>t.filter((e,r,o)=>!!e&&e.trim()!==""&&o.indexOf(e)===r).join(" ").trim();/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,o)=>o?o.toUpperCase():r.toLowerCase());/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=t=>{const e=k(t);return e.charAt(0).toUpperCase()+e.slice(1)};/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var h={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1},A=a.createContext({}),$=()=>a.useContext(A),L=a.forwardRef(({color:t,size:e,strokeWidth:r,absoluteStrokeWidth:o,className:s="",children:n,iconNode:u,...c},d)=>{const{size:i=24,strokeWidth:l=2,absoluteStrokeWidth:g=!1,color:f="currentColor",className:m=""}=$()??{},w=o??g?Number(r??l)*24/Number(e??i):r??l;return a.createElement("svg",{ref:d,...h,width:e??i??h.width,height:e??i??h.height,stroke:t??f,strokeWidth:w,className:p("lucide",m,s),...!n&&!j(c)&&{"aria-hidden":"true"},...c},[...u.map(([C,v])=>a.createElement(C,v)),...Array.isArray(n)?n:[n]])});/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=(t,e)=>{const r=a.forwardRef(({className:o,...s},n)=>a.createElement(L,{ref:n,iconNode:e,className:p(`lucide-${y(x(t))}`,`lucide-${t}`,o),...s}));return r.displayName=x(t),r};/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],B=W("loader-circle",S);function N({children:t,variant:e="primary",size:r="md",isLoading:o=!1,disabled:s=!1,className:n="",type:u="button",...c}){const d="inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none",i={primary:"bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-xs focus:ring-brand-500",secondary:"bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 focus:ring-neutral-400",outline:"border border-neutral-300 bg-neutral-0 hover:bg-neutral-50 active:bg-neutral-100 text-neutral-700 shadow-xs focus:ring-brand-500",ghost:"bg-transparent hover:bg-neutral-100 active:bg-neutral-200 text-neutral-700 focus:ring-neutral-400",danger:"bg-danger-500 hover:bg-danger-600 active:bg-danger-700 text-white shadow-xs focus:ring-danger-500",link:"bg-transparent text-brand-600 hover:text-brand-700 hover:underline p-0 focus:ring-0 shadow-none"},l={sm:"text-xs px-2.5 py-1.5 gap-1.5 h-8",md:"text-sm px-4 py-2 gap-2 h-10",lg:"text-base px-5 py-2.5 gap-2.5 h-12"},g=s||o;return b.jsxs("button",{type:u,disabled:g,className:`${d} ${i[e]} ${l[r]} ${n}`,...c,children:[o&&b.jsx(B,{className:"w-4 h-4 animate-spin shrink-0"}),b.jsx("span",{children:t})]})}export{N as B,W as c};
