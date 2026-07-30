import{j as e}from"./jsx-runtime-u17CrQMm.js";import{c as d}from"./index-CqkPUm8v.js";import{a as p}from"./utils-WKja2AN6.js";import{c as u}from"./createLucideIcon-BuDZyYUQ.js";import"./iframe-BaZKYzSC.js";import"./preload-helper-PPVm8Dsz.js";const b=[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]],r=u("upload",b),m=d("inline-flex items-center justify-center rounded-full bg-bg-neutral-weak text-fg-neutral-bold shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)] transition-colors disabled:pointer-events-none disabled:bg-bg-neutral-weak-disabled disabled:text-fg-neutral-bold-disabled",{variants:{variant:{icon:"size-[42px] [&_svg]:size-6",label:"h-[42px] gap-1 px-3 text-h8 [&_svg]:size-5"}},defaultVariants:{variant:"icon"}});function a({variant:s,className:i,type:l="button",...c}){return e.jsx("button",{type:l,className:p(m({variant:s}),i),...c})}a.__docgenInfo={description:`ButtonIcon (Figma Button - Icon v1.0.0).

지도 위 등에 떠 있는 흰색 아이콘 버튼. variant: icon(원형 단독)·label(아이콘+라벨 pill).
아이콘은 children으로 주입. icon 단독 사용 시 \`aria-label\` 필수.`,methods:[],displayName:"ButtonIcon",props:{type:{defaultValue:{value:'"button"',computed:!1},required:!1}}};const j={component:a,tags:["autodocs"],parameters:{docs:{description:{component:"ButtonIcon (Figma Button - Icon v1.0.0). 흰 배경 · shadow 아이콘 버튼. variant: icon(원형 42px, 아이콘 24)·label(아이콘 20 + H8 라벨 pill). disabled 시 weak-disabled 토큰. icon 단독 사용 시 aria-label 필수."}}},argTypes:{variant:{control:"radio",options:["icon","label"]}}},n={render:()=>e.jsx(a,{"aria-label":"공유",children:e.jsx(r,{})})},t={render:()=>e.jsxs(a,{variant:"label",children:[e.jsx(r,{}),"label"]})},o={render:()=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(a,{disabled:!0,"aria-label":"공유",children:e.jsx(r,{})}),e.jsxs(a,{variant:"label",disabled:!0,children:[e.jsx(r,{}),"label"]})]})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonIcon aria-label="공유">
      <UploadIcon />
    </ButtonIcon>
}`,...n.parameters?.docs?.source},description:{story:"아이콘 단독 원형 (Default).",...n.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonIcon variant="label">
      <UploadIcon />
      label
    </ButtonIcon>
}`,...t.parameters?.docs?.source},description:{story:"아이콘 + 라벨 pill.",...t.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">
      <ButtonIcon disabled aria-label="공유">
        <UploadIcon />
      </ButtonIcon>
      <ButtonIcon variant="label" disabled>
        <UploadIcon />
        label
      </ButtonIcon>
    </div>
}`,...o.parameters?.docs?.source},description:{story:"Disabled — 두 variant 공통.",...o.parameters?.docs?.description}}};const B=["Default","WithLabel","Disabled"];export{n as Default,o as Disabled,t as WithLabel,B as __namedExportsOrder,j as default};
