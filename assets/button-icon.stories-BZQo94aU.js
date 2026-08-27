import{j as e}from"./jsx-runtime-u17CrQMm.js";import{B as n}from"./button-icon-B8ldTGCF.js";import{c as s}from"./createLucideIcon-CNxOcTM4.js";import"./index-CqkPUm8v.js";import"./utils-WKja2AN6.js";import"./iframe-BYY62mei.js";import"./preload-helper-PPVm8Dsz.js";const c=[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]],t=s("upload",c),x={component:n,tags:["autodocs"],parameters:{docs:{description:{component:"ButtonIcon (Figma Button - Icon v1.0.0). 흰 배경 · shadow 아이콘 버튼. variant: icon(원형 42px, 아이콘 24)·label(아이콘 20 + H8 라벨 pill). disabled 시 weak-disabled 토큰. icon 단독 사용 시 aria-label 필수."}}},argTypes:{variant:{control:"radio",options:["icon","label"]}}},a={render:()=>e.jsx(n,{"aria-label":"공유",children:e.jsx(t,{})})},r={render:()=>e.jsxs(n,{variant:"label",children:[e.jsx(t,{}),"label"]})},o={render:()=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(n,{disabled:!0,"aria-label":"공유",children:e.jsx(t,{})}),e.jsxs(n,{variant:"label",disabled:!0,children:[e.jsx(t,{}),"label"]})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonIcon aria-label="공유">
      <UploadIcon />
    </ButtonIcon>
}`,...a.parameters?.docs?.source},description:{story:"아이콘 단독 원형 (Default).",...a.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonIcon variant="label">
      <UploadIcon />
      label
    </ButtonIcon>
}`,...r.parameters?.docs?.source},description:{story:"아이콘 + 라벨 pill.",...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">
      <ButtonIcon disabled aria-label="공유">
        <UploadIcon />
      </ButtonIcon>
      <ButtonIcon variant="label" disabled>
        <UploadIcon />
        label
      </ButtonIcon>
    </div>
}`,...o.parameters?.docs?.source},description:{story:"Disabled — 두 variant 공통.",...o.parameters?.docs?.description}}};const I=["Default","WithLabel","Disabled"];export{a as Default,o as Disabled,r as WithLabel,I as __namedExportsOrder,x as default};
