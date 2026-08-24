import{j as e}from"./jsx-runtime-u17CrQMm.js";import{a as s,P as c}from"./profile-CQoMW7De.js";import"./icon-camera-add-DkuJsCcd.js";import"./utils-WKja2AN6.js";const u={component:s,tags:["autodocs"],argTypes:{size:{control:"inline-radio",options:["xs","sm","md","lg","xl"]},type:{control:"inline-radio",options:["default","selected","add-image"]},src:{control:"text"}},args:{size:"lg",type:"default"},parameters:{layout:"centered",docs:{description:{component:"Figma Profile v1.0.0. 원형 아바타 — size xs(16)/sm(24)/md(32)/lg(60)/xl(120), type default·selected·add-image."}}}},i={},l=["xs","sm","md","lg","xl"],a={render:()=>e.jsx("div",{className:"flex items-end gap-4",children:l.map(r=>e.jsx(s,{size:r},r))})},t={render:()=>e.jsxs("div",{className:"flex items-center gap-6",children:[e.jsx(s,{size:"lg",type:"default"}),e.jsx(s,{size:"lg",type:"selected"}),e.jsx(s,{size:"lg",type:"add-image"})]})},o={render:()=>e.jsx("div",{className:"flex items-center gap-4",children:c.map((r,d)=>e.jsx(s,{size:"lg",type:d===0?"selected":"default",src:r},r))})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:"{}",...i.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-end gap-4">
      {SIZES.map(size => <Profile key={size} size={size} />)}
    </div>
}`,...a.parameters?.docs?.source},description:{story:"사이즈별 (Default).",...a.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-6">
      <Profile size="lg" type="default" />
      <Profile size="lg" type="selected" />
      <Profile size="lg" type="add-image" />
    </div>
}`,...t.parameters?.docs?.source},description:{story:"타입별 (lg 기준).",...t.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">
      {PRESET_AVATARS.map((src, i) => <Profile key={src} size="lg" type={i === 0 ? "selected" : "default"} src={src} />)}
    </div>
}`,...o.parameters?.docs?.source},description:{story:"기본 아바타 프리셋 4종 — 강아지·고양이·구름·햄스터 (서버 프리셋 번호 1~4).",...o.parameters?.docs?.description}}};const x=["Playground","Sizes","Types","PresetAvatars"];export{i as Playground,o as PresetAvatars,a as Sizes,t as Types,x as __namedExportsOrder,u as default};
