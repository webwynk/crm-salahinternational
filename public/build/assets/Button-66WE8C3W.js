import{r as o,j as h}from"./app-vWd4bw84.js";/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=(...t)=>t.filter((e,r,n)=>!!e&&e.trim()!==""&&n.indexOf(e)===r).join(" ").trim();/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,n)=>n?n.toUpperCase():r.toLowerCase());/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=t=>{const e=y(t);return e.charAt(0).toUpperCase()+e.slice(1)};/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var p={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1},A=o.createContext({}),$=()=>o.useContext(A),L=o.forwardRef(({color:t,size:e,strokeWidth:r,absoluteStrokeWidth:n,className:s="",children:a,iconNode:u,...c},d)=>{const{size:i=24,strokeWidth:l=2,absoluteStrokeWidth:g=!1,color:f="currentColor",className:m=""}=$()??{},w=n??g?Number(r??l)*24/Number(e??i):r??l;return o.createElement("svg",{ref:d,...p,width:e??i??p.width,height:e??i??p.height,stroke:t??f,strokeWidth:w,className:x("lucide",m,s),...!a&&!j(c)&&{"aria-hidden":"true"},...c},[...u.map(([C,v])=>o.createElement(C,v)),...Array.isArray(a)?a:[a]])});/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=(t,e)=>{const r=o.forwardRef(({className:n,...s},a)=>o.createElement(L,{ref:a,iconNode:e,className:x(`lucide-${k(b(t))}`,`lucide-${t}`,n),...s}));return r.displayName=b(t),r};/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],S=W("loader-circle",N);function E({children:t,variant:e="primary",size:r="md",isLoading:n=!1,disabled:s=!1,className:a="",type:u="button",...c}){const d="inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none whitespace-nowrap flex-nowrap shrink-0",i={primary:"bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-xs focus:ring-brand-500",secondary:"bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 focus:ring-neutral-400",outline:"border border-neutral-300 bg-neutral-0 hover:bg-neutral-50 active:bg-neutral-100 text-neutral-700 shadow-xs focus:ring-brand-500",ghost:"bg-transparent hover:bg-neutral-100 active:bg-neutral-200 text-neutral-700 focus:ring-neutral-400",danger:"bg-danger-600 hover:bg-danger-700 active:bg-danger-800 text-white shadow-xs focus:ring-danger-500",link:"bg-transparent text-brand-600 hover:text-brand-700 hover:underline p-0 focus:ring-0 shadow-none"},l={sm:"text-xs px-3 py-1.5 gap-1.5 h-8",md:"text-sm px-4 py-2 gap-2 h-10",lg:"text-base px-5 py-2.5 gap-2.5 h-12"},g=s||n;return h.jsxs("button",{type:u,disabled:g,className:`${d} ${i[e]} ${l[r]} ${a}`,...c,children:[n?h.jsx(S,{className:"w-4 h-4 animate-spin shrink-0"}):null,h.jsx("span",{className:"inline-flex items-center gap-1.5 whitespace-nowrap",children:t})]})}export{E as B,W as c};
