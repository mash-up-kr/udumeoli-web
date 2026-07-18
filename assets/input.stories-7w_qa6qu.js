import{j as e}from"./jsx-runtime-u17CrQMm.js";import{I as s}from"./input-DdcOFEXY.js";import"./utils-WKja2AN6.js";const n={component:s,tags:["autodocs"],args:{placeholder:"닉네임을 입력해 주세요"},argTypes:{disabled:{control:"boolean",description:"입력 불가 상태."},"aria-invalid":{control:"boolean",description:"오류 상태. 잘못된 입력값일 때 사용."},type:{control:"select",options:["text","email","password","number","tel"],description:"입력 형식."},placeholder:{description:"입력 전 힌트 텍스트."}}},a={},l={render:()=>e.jsxs("div",{className:"flex w-72 flex-col gap-4",children:[e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("span",{className:"text-xs text-muted-foreground",children:"기본"}),e.jsx(s,{placeholder:"닉네임을 입력해 주세요"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("span",{className:"text-xs text-muted-foreground",children:"입력됨"}),e.jsx(s,{defaultValue:"우두머리"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("span",{className:"text-xs text-muted-foreground",children:"비활성화"}),e.jsx(s,{placeholder:"닉네임을 입력해 주세요",disabled:!0})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("span",{className:"text-xs text-muted-foreground",children:"오류"}),e.jsx(s,{placeholder:"닉네임을 입력해 주세요","aria-invalid":!0})]})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex w-72 flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">기본</span>
        <Input placeholder="닉네임을 입력해 주세요" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">입력됨</span>
        <Input defaultValue="우두머리" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">비활성화</span>
        <Input placeholder="닉네임을 입력해 주세요" disabled />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">오류</span>
        <Input placeholder="닉네임을 입력해 주세요" aria-invalid />
      </div>
    </div>
}`,...l.parameters?.docs?.source}}};const d=["Default","States"];export{a as Default,l as States,d as __namedExportsOrder,n as default};
