import{j as e}from"./jsx-runtime-u17CrQMm.js";import{B as s}from"./button-CEy4Hm6f.js";import{P as p}from"./plus-B4F5QvF_.js";import{A as c}from"./arrow-left-B8aSyaEV.js";import"./index-CqkPUm8v.js";import"./utils-WKja2AN6.js";import"./index-CSdShfiU.js";import"./iframe-BYY62mei.js";import"./preload-helper-PPVm8Dsz.js";import"./createLucideIcon-CNxOcTM4.js";const z={component:s,tags:["autodocs"],args:{children:"버튼"},parameters:{docs:{description:{component:["재사용 버튼. 배경(variant) · 테두리 굴곡(radius) · 그림자(shadow) · 크기(size)를 조합해 시안의 모든 버튼을 표현합니다.","","- `variant`: `solid`(배경O·다크) · `surface`(흰 배경) · `text`(배경X·글자/아이콘만) + 보조(outline/secondary/destructive/link/kakao)","- `radius`: `md`(12) · `lg`(24) · `full`(완전 둥금)","- `shadow`: `none` · `sm` · `lg`","- 풀폭 CTA는 `w-full` + 부모 좌우 패딩으로 반응형 처리."].join(`
`)}}},argTypes:{variant:{control:"select",options:["solid","surface","text","outline","secondary","destructive","link","kakao"],description:"배경 스타일."},size:{control:"select",options:["default","sm","lg","xl","cta","icon","icon-sm","icon-lg"],description:"크기. cta는 풀폭 CTA(h61)용, icon* 은 정사각 아이콘 버튼."},radius:{control:"inline-radio",options:["md","lg","full"],description:"테두리 굴곡."},shadow:{control:"inline-radio",options:["none","sm","lg"],description:"그림자."},disabled:{control:"boolean",description:"클릭 불가 상태."}}},t={},i={render:()=>e.jsxs("div",{className:"flex flex-wrap items-center gap-3",children:[e.jsx(s,{variant:"solid",children:"solid"}),e.jsx(s,{variant:"surface",shadow:"sm",children:"surface"}),e.jsx(s,{variant:"text",children:"text"}),e.jsx(s,{variant:"outline",children:"outline"}),e.jsx(s,{variant:"secondary",children:"secondary"}),e.jsx(s,{variant:"destructive",children:"destructive"}),e.jsx(s,{variant:"kakao",children:"kakao"})]})},l={render:()=>e.jsxs("div",{className:"flex flex-wrap items-center gap-3",children:[e.jsx(s,{radius:"md",children:"md · 12"}),e.jsx(s,{radius:"lg",children:"lg · 24"}),e.jsx(s,{radius:"full",children:"full"})]})},o={render:()=>e.jsxs("div",{className:"flex flex-wrap items-center gap-3",children:[e.jsx(s,{shadow:"none",children:"none"}),e.jsx(s,{shadow:"sm",children:"sm"}),e.jsx(s,{shadow:"lg",children:"lg"})]})},d={render:()=>e.jsxs("div",{className:"flex flex-wrap items-center gap-3",children:[e.jsx(s,{children:"기본"}),e.jsx(s,{disabled:!0,children:"비활성화"})]})},r={render:()=>e.jsx("div",{className:"w-[375px] bg-muted px-5 py-4",children:e.jsx(s,{size:"cta",radius:"md",className:"w-full",children:"카카오로 시작하기"})})},n={render:()=>e.jsxs("div",{className:"flex flex-col gap-6",children:[e.jsx(a,{label:"#6 풀폭 CTA · solid / radius=md",children:e.jsx("div",{className:"w-[335px]",children:e.jsx(s,{size:"cta",radius:"md",className:"w-full",children:"카카오로 시작하기"})})}),e.jsx(a,{label:"#10 pill · solid / radius=full / shadow=lg",children:e.jsx(s,{radius:"full",shadow:"lg",className:"h-[61px] w-[227px]",children:"여행 사진 추가하기"})}),e.jsx(a,{label:"#8 아이콘(배경O) · solid / radius=lg",children:e.jsx(s,{size:"icon",radius:"lg",className:"size-[52px]","aria-label":"추가",children:e.jsx(p,{className:"size-6"})})}),e.jsx(a,{label:"#12 아이콘(흰 배경) · surface / radius=full / shadow=sm",children:e.jsx(s,{variant:"surface",size:"icon",radius:"full",shadow:"sm",className:"size-[42px]","aria-label":"뒤로 가기",children:e.jsx(c,{className:"size-5"})})}),e.jsx(a,{label:"텍스트 버튼 · text",children:e.jsx(s,{variant:"text",children:"완료"})}),e.jsx(a,{label:"아이콘(배경X) · text",children:e.jsx(s,{variant:"text",size:"icon","aria-label":"뒤로 가기",children:e.jsx(c,{className:"size-5"})})})]})};function a({label:u,children:m}){return e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("span",{className:"text-xs text-muted-foreground",children:u}),m]})}t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap items-center gap-3">
      <Button variant="solid">solid</Button>
      <Button variant="surface" shadow="sm">
        surface
      </Button>
      <Button variant="text">text</Button>
      <Button variant="outline">outline</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="destructive">destructive</Button>
      <Button variant="kakao">kakao</Button>
    </div>
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap items-center gap-3">
      <Button radius="md">md · 12</Button>
      <Button radius="lg">lg · 24</Button>
      <Button radius="full">full</Button>
    </div>
}`,...l.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap items-center gap-3">
      <Button shadow="none">none</Button>
      <Button shadow="sm">sm</Button>
      <Button shadow="lg">lg</Button>
    </div>
}`,...o.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap items-center gap-3">
      <Button>기본</Button>
      <Button disabled>비활성화</Button>
    </div>
}`,...d.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[375px] bg-muted px-5 py-4">
      <Button size="cta" radius="md" className="w-full">
        카카오로 시작하기
      </Button>
    </div>
}`,...r.parameters?.docs?.source},description:{story:"풀폭 CTA(#6). 버튼은 `w-full`, 좌우 20px 여백은 부모 `px-5`가 담당 → 화면 폭에 맞춰 반응형.",...r.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-6">
      <Figure label="#6 풀폭 CTA · solid / radius=md">
        <div className="w-[335px]">
          <Button size="cta" radius="md" className="w-full">
            카카오로 시작하기
          </Button>
        </div>
      </Figure>

      <Figure label="#10 pill · solid / radius=full / shadow=lg">
        <Button radius="full" shadow="lg" className="h-[61px] w-[227px]">
          여행 사진 추가하기
        </Button>
      </Figure>

      <Figure label="#8 아이콘(배경O) · solid / radius=lg">
        <Button size="icon" radius="lg" className="size-[52px]" aria-label="추가">
          <Plus className="size-6" />
        </Button>
      </Figure>

      <Figure label="#12 아이콘(흰 배경) · surface / radius=full / shadow=sm">
        <Button variant="surface" size="icon" radius="full" shadow="sm" className="size-[42px]" aria-label="뒤로 가기">
          <ArrowLeft className="size-5" />
        </Button>
      </Figure>

      <Figure label="텍스트 버튼 · text">
        <Button variant="text">완료</Button>
      </Figure>

      <Figure label="아이콘(배경X) · text">
        <Button variant="text" size="icon" aria-label="뒤로 가기">
          <ArrowLeft className="size-5" />
        </Button>
      </Figure>
    </div>
}`,...n.parameters?.docs?.source},description:{story:"시안 4종을 하나의 Button 조합으로 재현.",...n.parameters?.docs?.description}}};const F=["Playground","Variants","Radius","Shadow","States","FullWidthCTA","시안_버튼들"];export{r as FullWidthCTA,t as Playground,l as Radius,o as Shadow,d as States,i as Variants,F as __namedExportsOrder,z as default,n as 시안_버튼들};
