import{j as e}from"./jsx-runtime-u17CrQMm.js";import{P as a}from"./profile-BK7bfXYC.js";import"./icon-camera-add-DkuJsCcd.js";import"./profile-default-C2Docrna.js";import"./utils-WKja2AN6.js";const m={component:a,tags:["autodocs"],argTypes:{size:{control:"inline-radio",options:["xs","sm","md","lg","xl"]},type:{control:"inline-radio",options:["default","selected","add-image"]},src:{control:"text"}},args:{size:"lg",type:"default"},parameters:{layout:"centered",docs:{description:{component:"Figma Profile v1.0.0. 원형 아바타 — size xs(16)/sm(24)/md(32)/lg(60)/xl(120), type default·selected·add-image."}}}},t={},i=["xs","sm","md","lg","xl"],s={render:()=>e.jsx("div",{className:"flex items-end gap-4",children:i.map(o=>e.jsx(a,{size:o},o))})},r={render:()=>e.jsxs("div",{className:"flex items-center gap-6",children:[e.jsx(a,{size:"lg",type:"default"}),e.jsx(a,{size:"lg",type:"selected"}),e.jsx(a,{size:"lg",type:"add-image"})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-end gap-4">
      {SIZES.map(size => <Profile key={size} size={size} />)}
    </div>
}`,...s.parameters?.docs?.source},description:{story:"사이즈별 (Default).",...s.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-6">
      <Profile size="lg" type="default" />
      <Profile size="lg" type="selected" />
      <Profile size="lg" type="add-image" />
    </div>
}`,...r.parameters?.docs?.source},description:{story:"타입별 (lg 기준).",...r.parameters?.docs?.description}}};const g=["Playground","Sizes","Types"];export{t as Playground,s as Sizes,r as Types,g as __namedExportsOrder,m as default};
