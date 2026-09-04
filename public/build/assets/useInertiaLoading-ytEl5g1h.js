import{c,B as m}from"./Button-CaWQoTev.js";import{j as e,r as o,c as i}from"./app-BzmfwiFk.js";/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["path",{d:"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",key:"usdka0"}]],h=c("folder-open",f);/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=[["path",{d:"M5 22h14",key:"ehvnwv"}],["path",{d:"M5 2h14",key:"pdyrp9"}],["path",{d:"M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22",key:"1d314k"}],["path",{d:"M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2",key:"1vvvr6"}]],x=c("hourglass",p);/**
 * @license lucide-react v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],y=c("refresh-cw",k);function g({icon:r=h,title:l="No records found",description:a="Get started by creating your first entry.",actionLabel:n,onAction:s,className:t=""}){return e.jsxs("div",{className:`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-neutral-200 rounded-md shadow-xs ${t}`,children:[e.jsx("div",{className:"w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4",children:e.jsx(r,{className:"w-6 h-6"})}),e.jsx("h3",{className:"text-md font-semibold text-neutral-900 mb-1",children:l}),e.jsx("p",{className:"text-sm text-neutral-500 max-w-sm mb-6",children:a}),n&&s&&e.jsx(m,{variant:"primary",onClick:s,children:n})]})}function N({visible:r}){return r?e.jsxs("div",{className:"fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-neutral-900/90 backdrop-blur-sm text-white text-[12px] font-medium px-4 py-2.5 rounded-full shadow-lg animate-pulse pointer-events-none",children:[e.jsx(x,{className:"w-3.5 h-3.5 text-brand-400 shrink-0"}),"Still loading� taking longer than usual"]}):null}function b(r=3e3){const[l,a]=o.useState(!1),[n,s]=o.useState(!1),t=o.useRef(null);return o.useEffect(()=>{const u=i.on("start",()=>{a(!0),s(!1),t.current=setTimeout(()=>s(!0),r)}),d=i.on("finish",()=>{a(!1),s(!1),t.current&&clearTimeout(t.current)});return()=>{u(),d(),t.current&&clearTimeout(t.current)}},[r]),{isLoading:l,slowNetwork:n}}export{g as E,y as R,N as S,b as u};
