import{j as e}from"./jsx-runtime-u17CrQMm.js";import{H as d}from"./header-B_2gNzou.js";import{a as p}from"./utils-WKja2AN6.js";import"./x-apWRtnbw.js";import"./createLucideIcon-BOg8YWQI.js";import"./iframe-Db-6hAeg.js";import"./preload-helper-PPVm8Dsz.js";import"./arrow-left-yYrTlYK_.js";function r({children:s,className:n,...i}){return e.jsx("div",{className:p("mx-auto min-h-dvh w-full max-w-md bg-background shadow-[0px_0px_80px_0px_rgba(142,150,169,0.35)] ring-1 ring-neutral-900/5",n),...i,children:s})}r.__docgenInfo={description:"",methods:[],displayName:"MobileLayout"};const f={component:r,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:["모든 페이지를 감싸는 모바일 영역 컨테이너.","","- **기준 크기 375×812** (iPhone X). 이 크기에서 시안과 1:1로 보입니다.","- 더 작은 폰(360 등)은 자동으로 줄어듭니다. (min 없음)","- 더 큰 화면은 **최대 448px**(`max-w-md`)에서 멈추고 가운데 정렬됩니다.","- 좌우 여백(거터)은 브랜드 틴트 aurora 그라디언트 배경이 균등하게 남고, 프레임은 앰비언트 섀도로 떠 보입니다.","","👉 상단 툴바의 **Viewport**를 바꿔가며 기기별로 확인하세요."].join(`
`)}},viewport:{options:{galaxyS:{name:"Galaxy S (360×800)",styles:{width:"360px",height:"800px"}},iphoneX:{name:"기준 · iPhone X (375×812)",styles:{width:"375px",height:"812px"}},proMax:{name:"iPhone Pro Max (430×932)",styles:{width:"430px",height:"932px"}},desktop:{name:"데스크탑 (1280×900)",styles:{width:"1280px",height:"900px"}}}}}},l=[{id:1,title:"제주 3박 4일",desc:"성산일출봉 · 우도 · 협재",days:"4일"},{id:2,title:"도쿄 미식 투어",desc:"츠키지 · 시부야 · 신주쿠",days:"3일"},{id:3,title:"다낭 휴양",desc:"미케 비치 · 바나힐",days:"5일"}];function a(){return e.jsxs(e.Fragment,{children:[e.jsx(d,{icon:!1,title:"우두머리",className:"sticky top-0 z-10 border-b"}),e.jsx("main",{className:"flex flex-col gap-3 p-4",children:l.map(s=>e.jsxs("article",{className:"flex gap-3 rounded-lg border bg-card p-3",children:[e.jsx("div",{className:"size-16 shrink-0 rounded-md bg-muted"}),e.jsxs("div",{className:"flex min-w-0 flex-col",children:[e.jsx("span",{className:"truncate font-medium",children:s.title}),e.jsx("span",{className:"truncate text-sm text-muted-foreground",children:s.desc}),e.jsx("span",{className:"mt-auto text-xs text-muted-foreground",children:s.days})]})]},s.id))})]})}const o={globals:{viewport:{value:"iphoneX"}},render:()=>e.jsx(r,{children:e.jsx(a,{})})},t={globals:{viewport:{value:"desktop"}},render:()=>e.jsx(r,{children:e.jsx(a,{})})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  globals: {
    viewport: {
      value: "iphoneX"
    }
  },
  render: () => <MobileLayout>
      <DemoContent />
    </MobileLayout>
}`,...o.parameters?.docs?.source},description:{story:"기준 크기(375×812). 시안과 1:1로 보이는 상태입니다.",...o.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  globals: {
    viewport: {
      value: "desktop"
    }
  },
  render: () => <MobileLayout>
      <DemoContent />
    </MobileLayout>
}`,...t.parameters?.docs?.source},description:{story:`데스크탑/넓은 화면. 컨테이너는 448px에서 멈추고 가운데 정렬되며,
좌우 거터에 브랜드 틴트 aurora 배경이 깔리고 프레임은 섀도로 떠 보입니다. (웹에서 보이는 모습)`,...t.parameters?.docs?.description}}};const j=["기준_모바일","웹_거터"];export{j as __namedExportsOrder,f as default,o as 기준_모바일,t as 웹_거터};
