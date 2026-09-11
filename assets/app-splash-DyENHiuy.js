import{j as t}from"./jsx-runtime-u17CrQMm.js";import{H as r}from"./iframe-CPUeHlmo.js";import{M as p}from"./mobile-layout-Cogd4OYc.js";const o=""+new URL("sky-background-D8L1ChWs.png",import.meta.url).href;function d({children:i,onMotionEnd:e}){const s=r.useRef(null),[l,u]=r.useState(!1),a=r.useRef(!1);return r.useEffect(()=>{a.current||(a.current=!0,s.current?.play().catch(()=>{u(!0),e?.()}))},[e]),t.jsxs(p,{className:"relative flex h-[var(--app-vh)] flex-col items-center justify-center overflow-hidden bg-bg-neutral-subtle",children:[l?t.jsx("img",{src:o,alt:"","aria-hidden":"true",className:"absolute inset-0 size-full object-cover"}):t.jsx("video",{ref:s,src:"/splash.mp4",poster:o,autoPlay:!0,muted:!0,playsInline:!0,preload:"auto","aria-hidden":"true",className:"absolute inset-0 size-full object-cover",onEnded:e,onError:e,onTimeUpdate:c=>{const n=c.currentTarget;n.duration-n.currentTime<=2&&e?.()}}),i]})}d.__docgenInfo={description:`라우트 진입 판정 중(세션·팟 persist 복원, me/myParties 응답 대기, 리다이렉트 직전)에
쓰는 전체 화면 대기 상태. 이 구간을 null로 두면 흰 화면만 남는다 —
목 모드에선 한 틱이라 안 보이지만 실서버에선 네트워크 왕복만큼 지속된다.

스플래시 모션 영상(Video_Splash_5_FIN, 4초 1회 재생 후 마지막 프레임 유지).
영상 로드 전엔 poster(하늘 배경)가 정적 스플래시 역할을 한다.
sw.js가 /splash.mp4를 프리캐시해 PWA·재방문에선 즉시 재생된다.

랜딩(LandingPage)은 children으로 CTA를 얹어 같은 화면을 공유한다.`,methods:[],displayName:"AppSplash",props:{children:{required:!1,tsType:{name:"ReactNode"},description:""},onMotionEnd:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"스플래시 모션 종료 시점에 호출 — 랜딩이 CTA 노출 시점으로 쓴다. 중복 호출될 수 있다"}}};export{d as A};
