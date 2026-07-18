import{j as a}from"./jsx-runtime-u17CrQMm.js";import{B as o}from"./button-cta-CrBpRd8F.js";import"./index-CqkPUm8v.js";import"./utils-WKja2AN6.js";const l={component:o,tags:["autodocs"],args:{children:"Label",variant:"primary"},argTypes:{variant:{control:"inline-radio",options:["primary","secondary","danger"]},disabled:{control:"boolean"}},parameters:{layout:"padded",docs:{description:{component:"Figma Button - CTA v1.0.0. 풀폭 pill 주요 액션 버튼. variant primary·secondary·danger, default/disabled."}}},decorators:[r=>a.jsx("div",{className:"w-[343px]",children:a.jsx(r,{})})]},s={},e={render:()=>a.jsx("div",{className:"flex flex-col gap-3",children:["primary","secondary","danger"].map(r=>a.jsxs("div",{className:"flex flex-col gap-2",children:[a.jsx(o,{variant:r,children:"Label"}),a.jsx(o,{variant:r,disabled:!0,children:"Label"})]},r))})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-3">
      {(["primary", "secondary", "danger"] as const).map(variant => <div key={variant} className="flex flex-col gap-2">
          <ButtonCta variant={variant}>Label</ButtonCta>
          <ButtonCta variant={variant} disabled>
            Label
          </ButtonCta>
        </div>)}
    </div>
}`,...e.parameters?.docs?.source},description:{story:"variant × 상태.",...e.parameters?.docs?.description}}};const c=["Playground","AllVariants"];export{e as AllVariants,s as Playground,c as __namedExportsOrder,l as default};
