import{j as e}from"./jsx-runtime-u17CrQMm.js";import{K as d}from"./index-CNbSqIkC.js";import{B as a}from"./button-B3Sd4Jlx.js";import{s as c}from"./toast-Bi7GEkmh.js";import"./iframe-P1L4vLpH.js";import"./preload-helper-PPVm8Dsz.js";import"./index-CqkPUm8v.js";import"./utils-WKja2AN6.js";import"./index-B3FmZpPo.js";const B={tags:["autodocs"],decorators:[i=>e.jsx(d,{children:e.jsx("div",{className:"relative h-32",children:e.jsx(i,{})})})],parameters:{docs:{description:{component:"화면 하단에 잠깐 표시되는 알림 (Figma Toast v1.0.0). `showToast()` 명령형 호출, 기본 3초 후 자동 dismiss. 흰 pill · bg-neutral-weak · 라벨 fg-neutral-bold, 선택적 아이콘 — alert(빨간 !)/alert-neutral(검정 !)/check(파란 ✓)."},story:{inline:!1,height:"200px"}}}},r={render:()=>e.jsx(a,{onClick:()=>c({message:"초대코드를 복사했어요"}),children:"토스트 표시"})},s={render:()=>e.jsx(a,{onClick:()=>c({message:"입력값을 다시 확인해 주세요",icon:"alert"}),children:"에러 토스트"})},o={render:()=>e.jsx(a,{onClick:()=>c({message:"로그아웃이 완료됐어요.",icon:"alert-neutral"}),children:"안내 토스트"})},t={render:()=>e.jsx(a,{onClick:()=>c({message:"프로필 수정이 완료됐어요.",icon:"check"}),children:"완료 토스트"})},n={render:()=>e.jsx(a,{onClick:()=>c({message:"5초 동안 표시됩니다.",duration:5e3}),children:"5초 토스트"})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => showToast({
    message: "초대코드를 복사했어요"
  })}>
      토스트 표시
    </Button>
}`,...r.parameters?.docs?.source},description:{story:"기본 (아이콘 없음).",...r.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => showToast({
    message: "입력값을 다시 확인해 주세요",
    icon: "alert"
  })}>
      에러 토스트
    </Button>
}`,...s.parameters?.docs?.source},description:{story:"에러 알림 아이콘 (빨간 !).",...s.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => showToast({
    message: "로그아웃이 완료됐어요.",
    icon: "alert-neutral"
  })}>
      안내 토스트
    </Button>
}`,...o.parameters?.docs?.source},description:{story:"안내 알림 아이콘 (검정 !) — 로그아웃 완료 등.",...o.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => showToast({
    message: "프로필 수정이 완료됐어요.",
    icon: "check"
  })}>
      완료 토스트
    </Button>
}`,...t.parameters?.docs?.source},description:{story:"완료 체크 아이콘 (파란 ✓) — 프로필 수정 완료 등.",...t.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => showToast({
    message: "5초 동안 표시됩니다.",
    duration: 5000
  })}>
      5초 토스트
    </Button>
}`,...n.parameters?.docs?.source},description:{story:"duration 조절. 기본 3초, 여기선 5초.",...n.parameters?.docs?.description}}};const j=["Default","WithAlertIcon","WithNeutralAlertIcon","WithCheckIcon","CustomDuration"];export{n as CustomDuration,r as Default,s as WithAlertIcon,t as WithCheckIcon,o as WithNeutralAlertIcon,j as __namedExportsOrder,B as default};
