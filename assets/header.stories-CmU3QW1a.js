import{j as e}from"./jsx-runtime-u17CrQMm.js";import{H as o}from"./header-COqV2uEz.js";import"./utils-WKja2AN6.js";import"./x-Bw7en_r6.js";import"./createLucideIcon-B9kTDGnl.js";import"./iframe-VM_qygMe.js";import"./preload-helper-PPVm8Dsz.js";import"./arrow-left-C3Do-QA1.js";const v={component:o,tags:["autodocs"],args:{type:"screen-info",direction:"left",icon:!0,title:"프로필 선택"},argTypes:{type:{control:"inline-radio",options:["screen-info","close"],description:"screen-info(뒤로가기 ←) · close(닫기 ✕)"},direction:{control:"inline-radio",options:["left","center"],description:"타이틀 정렬. center에서 아이콘은 screen-info=좌 / close=우."},icon:{control:"boolean",description:"아이콘 노출 여부."},title:{control:"text"},onIconClick:{action:"iconClick"}},parameters:{layout:"fullscreen",docs:{description:{component:"화면 상단 헤더 (Figma Header v1.0.0). type(screen-info/close) × direction(left/center) × icon 조합. padding 16/12 · gap 24, 타이틀 text-h5-1 · fg-neutral-bold, 상단 safe-area 반영."}}},decorators:[r=>e.jsx("div",{className:"w-[375px] border border-border",children:e.jsx(r,{})})]},i={},s={render:r=>e.jsxs("div",{className:"flex flex-col divide-y divide-border",children:[e.jsx(o,{...r,type:"screen-info",direction:"left"}),e.jsx(o,{...r,type:"screen-info",direction:"center"})]})},n={render:r=>e.jsxs("div",{className:"flex flex-col divide-y divide-border",children:[e.jsx(o,{...r,type:"close",direction:"left"}),e.jsx(o,{...r,type:"close",direction:"center"})]})},t={render:r=>e.jsxs("div",{className:"flex flex-col divide-y divide-border",children:[e.jsx(o,{...r,icon:!1,direction:"left"}),e.jsx(o,{...r,icon:!1,direction:"center"})]})},c={render:r=>e.jsxs("div",{className:"flex flex-col divide-y divide-border",children:[e.jsx(o,{...r,type:"screen-info",direction:"left"}),e.jsx(o,{...r,type:"screen-info",direction:"center"}),e.jsx(o,{...r,type:"close",direction:"left"}),e.jsx(o,{...r,type:"close",direction:"center"}),e.jsx(o,{...r,icon:!1,direction:"left"}),e.jsx(o,{...r,icon:!1,direction:"center"})]})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:"{}",...i.parameters?.docs?.source},description:{story:"조합을 컨트롤에서 바꿔보며 확인.",...i.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: args => <div className="flex flex-col divide-y divide-border">
      <Header {...args} type="screen-info" direction="left" />
      <Header {...args} type="screen-info" direction="center" />
    </div>
}`,...s.parameters?.docs?.source},description:{story:"Screen Info(뒤로가기 ←) — Left / Center.",...s.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: args => <div className="flex flex-col divide-y divide-border">
      <Header {...args} type="close" direction="left" />
      <Header {...args} type="close" direction="center" />
    </div>
}`,...n.parameters?.docs?.source},description:{story:"Close(닫기 ✕) — Left / Center(우측 ✕).",...n.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: args => <div className="flex flex-col divide-y divide-border">
      <Header {...args} icon={false} direction="left" />
      <Header {...args} icon={false} direction="center" />
    </div>
}`,...t.parameters?.docs?.source},description:{story:"아이콘 없이 타이틀만 (Left / Center).",...t.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: args => <div className="flex flex-col divide-y divide-border">
      <Header {...args} type="screen-info" direction="left" />
      <Header {...args} type="screen-info" direction="center" />
      <Header {...args} type="close" direction="left" />
      <Header {...args} type="close" direction="center" />
      <Header {...args} icon={false} direction="left" />
      <Header {...args} icon={false} direction="center" />
    </div>
}`,...c.parameters?.docs?.source},description:{story:"전체 변형 매트릭스.",...c.parameters?.docs?.description}}};const u=["Playground","ScreenInfo","Close","TitleOnly","AllVariants"];export{c as AllVariants,n as Close,i as Playground,s as ScreenInfo,t as TitleOnly,u as __namedExportsOrder,v as default};
