import{j as e}from"./jsx-runtime-u17CrQMm.js";import{a}from"./utils-WKja2AN6.js";function n({className:s,children:i,direction:c="top",...p}){return e.jsxs("div",{role:"tooltip",className:a("relative inline-flex h-8 items-center justify-center rounded-full bg-bg-neutral-inverse px-4 py-1 drop-shadow-[0px_0px_10px_rgba(142,150,169,0.12)]",s),...p,children:[e.jsx("svg",{"aria-hidden":!0,viewBox:"80 12 18 12",className:a("absolute left-1/2 h-3 w-4.5 -translate-x-1/2",c==="top"?"-top-2":"-bottom-2 rotate-180"),children:e.jsx("path",{d:"M87.4883 13.7461C88.2858 12.8252 89.7142 12.8252 90.5117 13.7461L96.5264 20.6904C97.6481 21.9857 96.7281 23.9999 95.0146 24H82.9854C81.2719 23.9999 80.3519 21.9857 81.4736 20.6904L87.4883 13.7461Z",className:"fill-bg-neutral-inverse"})}),e.jsx("p",{className:"text-center text-b6 whitespace-nowrap text-fg-neutral-inverse",children:i})]})}n.__docgenInfo={description:`Tooltip (Figma Tooltip v1.0.0).

중앙 화살표가 달린 어두운 말풍선 (direction: top·bottom).
표시/위치 제어는 사용하는 쪽에서 담당.`,methods:[],displayName:"Tooltip",props:{direction:{required:!1,tsType:{name:"union",raw:'"top" | "bottom"',elements:[{name:"literal",value:'"top"'},{name:"literal",value:'"bottom"'}]},description:"화살표 방향 — top(기본): 위쪽 중앙 / bottom: 아래쪽 중앙",defaultValue:{value:'"top"',computed:!1}}}};const m={component:n,tags:["autodocs"],parameters:{docs:{description:{component:"피그마 #1066-7440 — 중앙 화살표가 달린 어두운 말풍선 (direction: top·bottom). 표시/위치 제어는 사용하는 쪽에서 담당."}}},args:{children:"사진을 올려주세요!"},decorators:[s=>e.jsx("div",{className:"p-6",children:e.jsx(s,{})})]},r={},t={args:{children:"이미지는 최대 5장까지 올릴 수 있어요!"}},o={args:{direction:"bottom",children:"최대 6명까지 함께할 수 있어요. (1/6)"}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    children: "이미지는 최대 5장까지 올릴 수 있어요!"
  }
}`,...t.parameters?.docs?.source},description:{story:"텍스트 길이에 따라 폭이 늘어난다.",...t.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    direction: "bottom",
    children: "최대 6명까지 함께할 수 있어요. (1/6)"
  }
}`,...o.parameters?.docs?.source},description:{story:"아래쪽 화살표 — 대상 위에 띄울 때 (초대코드 발급 CTA 안내).",...o.parameters?.docs?.description}}};const u=["Default","LongText","BottomArrow"];export{o as BottomArrow,r as Default,t as LongText,u as __namedExportsOrder,m as default};
