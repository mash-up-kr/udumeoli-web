import{j as e}from"./jsx-runtime-u17CrQMm.js";import{I as r}from"./image-card-DI_oBAM7.js";import{s as o}from"./sample-CUnWKzeG.js";import"./utils-WKja2AN6.js";const l={component:r,tags:["autodocs"],parameters:{docs:{description:{component:"피그마 #940-2992 — 흰 테두리 + 상단 틴트 그라디언트 이미지 위에 지역명·기간을 표시하는 태그 모양 카드."}}},argTypes:{size:{control:"inline-radio",options:["lg","sm"],description:"lg(160×192) · sm(120×144)"},tint:{control:"inline-radio",options:["blue","orange","indigo"],description:"이미지 상단 그라디언트 색."},src:{control:"text",description:"배경 이미지 URL."},title:{control:"text",description:"지역명."},subtitle:{control:"text",description:"기간."}},args:{src:o,title:"강릉",subtitle:"3days",size:"lg",tint:"blue"}},i={},t={render:s=>e.jsxs("div",{className:"flex items-end gap-4",children:[e.jsx(r,{...s,size:"lg"}),e.jsx(r,{...s,size:"sm"})]})},a={render:s=>e.jsxs("div",{className:"flex items-end gap-4",children:[e.jsx(r,{...s,tint:"blue"}),e.jsx(r,{...s,tint:"orange",title:"강릉"}),e.jsx(r,{...s,tint:"indigo",title:"대전"})]})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:"{}",...i.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: args => <div className="flex items-end gap-4">
      <ImageCard {...args} size="lg" />
      <ImageCard {...args} size="sm" />
    </div>
}`,...t.parameters?.docs?.source},description:{story:"Large · Small 두 사이즈.",...t.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: args => <div className="flex items-end gap-4">
      <ImageCard {...args} tint="blue" />
      <ImageCard {...args} tint="orange" title="강릉" />
      <ImageCard {...args} tint="indigo" title="대전" />
    </div>
}`,...a.parameters?.docs?.source},description:{story:"틴트 3종.",...a.parameters?.docs?.description}}};const p=["Default","Sizes","Tints"];export{i as Default,t as Sizes,a as Tints,p as __namedExportsOrder,l as default};
