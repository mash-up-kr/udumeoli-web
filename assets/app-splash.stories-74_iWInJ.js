import{j as s}from"./jsx-runtime-u17CrQMm.js";import{M as o}from"./mobile-layout-NqJ6JoMc.js";import"./utils-WKja2AN6.js";const a=""+new URL("sky-background-D8L1ChWs.png",import.meta.url).href;function r({children:t}){return s.jsxs(o,{className:"relative flex h-dvh flex-col items-center justify-center overflow-hidden bg-bg-neutral-subtle",children:[s.jsx("video",{src:"/splash.mp4",poster:a,autoPlay:!0,muted:!0,playsInline:!0,preload:"auto","aria-hidden":"true",className:"absolute inset-0 size-full object-cover"}),t]})}r.__docgenInfo={description:`라우트 진입 판정 중(세션·팟 persist 복원, me/myParties 응답 대기, 리다이렉트 직전)에
쓰는 전체 화면 대기 상태. 이 구간을 null로 두면 흰 화면만 남는다 —
목 모드에선 한 틱이라 안 보이지만 실서버에선 네트워크 왕복만큼 지속된다.

스플래시 모션 영상(Video_Splash_5_FIN, 4초 1회 재생 후 마지막 프레임 유지).
영상 로드 전엔 poster(하늘 배경)가 정적 스플래시 역할을 한다.
sw.js가 /splash.mp4를 프리캐시해 PWA·재방문에선 즉시 재생된다.

랜딩(LandingPage)은 children으로 CTA를 얹어 같은 화면을 공유한다.`,methods:[],displayName:"AppSplash",props:{children:{required:!1,tsType:{name:"ReactNode"},description:""}}};const c={component:r,parameters:{layout:"fullscreen",docs:{description:{component:"라우트 진입 판정 중 전체 화면 대기 상태. 스플래시 모션 영상 1회 재생(로드 전엔 하늘 배경 poster). 랜딩은 children으로 CTA를 얹어 공유."}}}},e={};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};const i=["Default"];export{e as Default,i as __namedExportsOrder,c as default};
