import{j as e}from"./jsx-runtime-u17CrQMm.js";import{B as o}from"./button-D3LLc5_T.js";import{a as p}from"./utils-WKja2AN6.js";import{C as u}from"./chevron-right-KUx6LBVt.js";import"./index-CqkPUm8v.js";import"./index-Dk3vHXGW.js";import"./iframe-BsDJskvX.js";import"./preload-helper-PPVm8Dsz.js";import"./createLucideIcon-DTdvrVA6.js";function s({items:a,className:i}){return e.jsx("ul",{className:p("w-full",i),children:a.map((n,l)=>n.type==="header"?e.jsx("li",{className:"px-5 py-1",children:e.jsx("span",{className:"text-[12px] leading-normal font-semibold tracking-[-0.24px] text-foreground",children:n.label})},l):n.type==="info"?e.jsxs("li",{className:"flex w-full items-center justify-between px-5 py-4",children:[e.jsx("span",{className:"text-h8-1 text-foreground",children:n.label}),e.jsx("span",{className:"text-h8-1 text-foreground",children:n.value})]},l):e.jsx("li",{children:e.jsxs(o,{variant:"text",onClick:n.onClick,className:"h-auto w-full justify-between px-5 py-4",children:[e.jsx("span",{className:"text-h8-1 text-foreground",children:n.label}),e.jsx(u,{className:"size-5 shrink-0 text-foreground"})]})},l))})}s.__docgenInfo={description:"",methods:[],displayName:"LinkList",props:{items:{required:!0,tsType:{name:"Array",elements:[{name:"union",raw:`| { type: "header"; label: string }
| { type: "link"; label: string; onClick: () => void }
| { type: "info"; label: string; value: string }`,elements:[{name:"signature",type:"object",raw:'{ type: "header"; label: string }',signature:{properties:[{key:"type",value:{name:"literal",value:'"header"',required:!0}},{key:"label",value:{name:"string",required:!0}}]}},{name:"signature",type:"object",raw:'{ type: "link"; label: string; onClick: () => void }',signature:{properties:[{key:"type",value:{name:"literal",value:'"link"',required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"onClick",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!0}}]}},{name:"signature",type:"object",raw:'{ type: "info"; label: string; value: string }',signature:{properties:[{key:"type",value:{name:"literal",value:'"info"',required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"value",value:{name:"string",required:!0}}]}}]}],raw:"Array<LinkListItem>"},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};const v={component:s,tags:["autodocs"],decorators:[a=>e.jsx("div",{className:"w-[375px]",children:e.jsx(a,{})})],parameters:{docs:{description:{component:"섹션 헤더·링크 아이템·정보 행 3가지 타입을 조합하는 리스트. 설정·마이 페이지 메뉴에 사용."}}}},r={args:{items:[{type:"header",label:"정보"},{type:"link",label:"1:1 문의",onClick:()=>{}},{type:"link",label:"이용약관",onClick:()=>{}},{type:"link",label:"개인정보처리방침",onClick:()=>{}},{type:"info",label:"버전 정보",value:"v 1.0.0"}]}},t={args:{items:[{type:"link",label:"이용약관",onClick:()=>{}},{type:"link",label:"개인정보처리방침",onClick:()=>{}}]}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      type: "header",
      label: "정보"
    }, {
      type: "link",
      label: "1:1 문의",
      onClick: () => {}
    }, {
      type: "link",
      label: "이용약관",
      onClick: () => {}
    }, {
      type: "link",
      label: "개인정보처리방침",
      onClick: () => {}
    }, {
      type: "info",
      label: "버전 정보",
      value: "v 1.0.0"
    }]
  }
}`,...r.parameters?.docs?.source},description:{story:"피그마 '정보' 섹션 전체 구성.",...r.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      type: "link",
      label: "이용약관",
      onClick: () => {}
    }, {
      type: "link",
      label: "개인정보처리방침",
      onClick: () => {}
    }]
  }
}`,...t.parameters?.docs?.source},description:{story:"링크 아이템만.",...t.parameters?.docs?.description}}};const h=["Default","LinksOnly"];export{r as Default,t as LinksOnly,h as __namedExportsOrder,v as default};
