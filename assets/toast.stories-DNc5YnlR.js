import{j as e}from"./jsx-runtime-u17CrQMm.js";import{K as m}from"./index-CrwOfdtF.js";import{B as r}from"./button-D3LLc5_T.js";import{s}from"./toast-DYEJc0W4.js";import"./iframe-BsDJskvX.js";import"./preload-helper-PPVm8Dsz.js";import"./index-CqkPUm8v.js";import"./utils-WKja2AN6.js";import"./index-Dk3vHXGW.js";const j={tags:["autodocs"],decorators:[d=>e.jsx(m,{children:e.jsx("div",{className:"relative h-32",children:e.jsx(d,{})})})],parameters:{docs:{description:{component:"화면 하단에 잠깐 표시되는 알림 (Figma Toast v1.0.0). `showToast()` 명령형 호출, 기본 3초 후 자동 dismiss. 흰 pill · bg-neutral-weak · 라벨 fg-neutral-bold, 선택적 아이콘 — alert(빨간 !)/alert-neutral(검정 !)/check(파란 ✓)/check-neutral(검정 ✓)."},story:{inline:!1,height:"200px"}}}},o={render:()=>e.jsx(r,{onClick:()=>s({message:"초대코드를 복사했어요"}),children:"토스트 표시"})},t={render:()=>e.jsx(r,{onClick:()=>s({message:"입력값을 다시 확인해 주세요",icon:"alert"}),children:"에러 토스트"})},n={render:()=>e.jsx(r,{onClick:()=>s({message:"이미 참여중인 여행팟이에요",icon:"alert-neutral"}),children:"안내 토스트"})},a={render:()=>e.jsx(r,{onClick:()=>s({message:"프로필 수정이 완료됐어요.",icon:"check"}),children:"완료 토스트"})},c={render:()=>e.jsx(r,{onClick:()=>s({message:"로그아웃이 완료됐어요.",icon:"check-neutral"}),children:"완료 안내 토스트"})},i={render:()=>e.jsx(r,{onClick:()=>s({message:"5초 동안 표시됩니다.",duration:5e3}),children:"5초 토스트"})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => showToast({
    message: "초대코드를 복사했어요"
  })}>
      토스트 표시
    </Button>
}`,...o.parameters?.docs?.source},description:{story:"기본 (아이콘 없음).",...o.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => showToast({
    message: "입력값을 다시 확인해 주세요",
    icon: "alert"
  })}>
      에러 토스트
    </Button>
}`,...t.parameters?.docs?.source},description:{story:"에러 알림 아이콘 (빨간 !).",...t.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => showToast({
    message: "이미 참여중인 여행팟이에요",
    icon: "alert-neutral"
  })}>
      안내 토스트
    </Button>
}`,...n.parameters?.docs?.source},description:{story:"안내 알림 아이콘 (검정 !) — 이미 참여중인 팟 안내 등.",...n.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => showToast({
    message: "프로필 수정이 완료됐어요.",
    icon: "check"
  })}>
      완료 토스트
    </Button>
}`,...a.parameters?.docs?.source},description:{story:"완료 체크 아이콘 (파란 ✓) — 프로필 수정 완료 등.",...a.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => showToast({
    message: "로그아웃이 완료됐어요.",
    icon: "check-neutral"
  })}>
      완료 안내 토스트
    </Button>
}`,...c.parameters?.docs?.source},description:{story:"완료 안내 체크 아이콘 (검정 ✓) — 로그아웃·계정 삭제 완료 등 스플래시 위 토스트.",...c.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => showToast({
    message: "5초 동안 표시됩니다.",
    duration: 5000
  })}>
      5초 토스트
    </Button>
}`,...i.parameters?.docs?.source},description:{story:"duration 조절. 기본 3초, 여기선 5초.",...i.parameters?.docs?.description}}};const f=["Default","WithAlertIcon","WithNeutralAlertIcon","WithCheckIcon","WithNeutralCheckIcon","CustomDuration"];export{i as CustomDuration,o as Default,t as WithAlertIcon,a as WithCheckIcon,n as WithNeutralAlertIcon,c as WithNeutralCheckIcon,f as __namedExportsOrder,j as default};
