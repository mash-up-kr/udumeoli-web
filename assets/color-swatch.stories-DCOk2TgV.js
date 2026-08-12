import{j as e}from"./jsx-runtime-u17CrQMm.js";import{c as b}from"./index-CqkPUm8v.js";import{a as g}from"./utils-WKja2AN6.js";import{P as v}from"./plus-Bas4hSjN.js";import"./createLucideIcon-q8nv50ZW.js";import"./iframe-BWr5xtJk.js";import"./preload-helper-PPVm8Dsz.js";const f=b("relative inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px]",{variants:{variant:{empty:"bg-bg-neutral-weak",add:"bg-bg-neutral-weak",color:""},selected:{true:"border-4 border-stroke-neutral-bold",false:"border border-fg-neutral-subtle"}},defaultVariants:{variant:"empty",selected:!1}});function r({variant:c="empty",selected:d=!1,color:i,className:p,style:n,type:u="button",...m}){return e.jsxs("button",{type:u,"aria-pressed":d===!0,className:g(f({variant:c,selected:d}),p),style:c==="color"?{backgroundColor:i,...n}:n,...m,children:[c==="empty"?e.jsx("svg",{"aria-hidden":"true",viewBox:"0 0 48 48",fill:"none",preserveAspectRatio:"none",className:"absolute inset-0 size-full text-fg-danger-solid",children:e.jsx("path",{d:"M48 0L0 48",stroke:"currentColor",strokeWidth:"2",vectorEffect:"non-scaling-stroke"})}):null,c==="add"?e.jsx(v,{"aria-hidden":"true",className:"size-6 text-fg-neutral-subtle",strokeWidth:3.75}):null]})}r.__docgenInfo={description:"Color Swatch (Design System v1.0.0 · Figma Color Swatch).\n\n48px 정사각 스와치 버튼. `selected` 시 `stroke-neutral-bold` 4px 테두리,\n미선택 시 `fg-neutral-subtle` 1px 테두리.\n- `empty`: 색상 없음 — `fg-danger-solid` 대각선 표시\n- `add`: 색상 추가 — + 아이콘 표시\n- `color`: `color` 값으로 채워진 스와치\n\n아이콘 전용 버튼이므로 사용처에서 `aria-label`을 전달한다.",methods:[],displayName:"ColorSwatch",props:{color:{required:!1,tsType:{name:'CSSProperties["backgroundColor"]',raw:'CSSProperties["backgroundColor"]'},description:'`variant="color"`일 때 채울 색상 값. 토큰 var() 사용 권장.'},variant:{defaultValue:{value:'"empty"',computed:!1},required:!1},selected:{defaultValue:{value:"false",computed:!1},required:!1},type:{defaultValue:{value:'"button"',computed:!1},required:!1}}};const k={component:r,tags:["autodocs"],args:{variant:"empty",selected:!1,"aria-label":"색상 없음"},argTypes:{variant:{control:"radio",options:["empty","add","color"],description:"empty: 색상 없음(대각선) · add: 색상 추가(+) · color: color 값으로 채움."},selected:{control:"boolean",description:"선택 시 stroke-neutral-bold 4px 테두리."},color:{control:"text",description:'variant가 "color"일 때 채울 색상 값. 토큰 var() 사용 권장.'}},parameters:{layout:"centered",docs:{description:{component:"Color Swatch (Figma Color Swatch v1.0.0). 48px 스와치 버튼 · 미선택 fg-neutral-subtle 1px, 선택 stroke-neutral-bold 4px 테두리. 아이콘 전용 버튼이므로 aria-label을 함께 전달합니다."}}}},a={},o={args:{variant:"add","aria-label":"색상 추가"}},t={args:{variant:"color",color:"var(--color-red-100)","aria-label":"빨강"}},s={args:{selected:!0}},l={render:()=>e.jsxs("div",{className:"grid grid-cols-3 gap-4",children:[e.jsx(r,{"aria-label":"색상 없음"}),e.jsx(r,{variant:"add","aria-label":"색상 추가"}),e.jsx(r,{variant:"color",color:"var(--color-red-100)","aria-label":"빨강"}),e.jsx(r,{selected:!0,"aria-label":"색상 없음"}),e.jsx(r,{variant:"add",selected:!0,"aria-label":"색상 추가"}),e.jsx(r,{variant:"color",color:"var(--color-red-100)",selected:!0,"aria-label":"빨강"})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source},description:{story:"색상 없음.",...a.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "add",
    "aria-label": "색상 추가"
  }
}`,...o.parameters?.docs?.source},description:{story:"색상 추가.",...o.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "color",
    color: "var(--color-red-100)",
    "aria-label": "빨강"
  }
}`,...t.parameters?.docs?.source},description:{story:"색상 채움.",...t.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    selected: true
  }
}`,...s.parameters?.docs?.source},description:{story:"선택 상태.",...s.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid grid-cols-3 gap-4">
      <ColorSwatch aria-label="색상 없음" />
      <ColorSwatch variant="add" aria-label="색상 추가" />
      <ColorSwatch variant="color" color="var(--color-red-100)" aria-label="빨강" />
      <ColorSwatch selected aria-label="색상 없음" />
      <ColorSwatch variant="add" selected aria-label="색상 추가" />
      <ColorSwatch variant="color" color="var(--color-red-100)" selected aria-label="빨강" />
    </div>
}`,...l.parameters?.docs?.source},description:{story:"시안 6종 비교 (Unselected / Selected × empty / add / color).",...l.parameters?.docs?.description}}};const V=["Empty","Add","Color","Selected","Variants"];export{o as Add,t as Color,a as Empty,s as Selected,l as Variants,V as __namedExportsOrder,k as default};
