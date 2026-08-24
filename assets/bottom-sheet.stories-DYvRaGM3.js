import{j as e}from"./jsx-runtime-u17CrQMm.js";import{P as D,K as _}from"./index-DVNV82A7.js";import{c as A}from"./index-CqkPUm8v.js";import{B as a}from"./button-tIyzdFmh.js";import{b as F,h as H,g as I,a as L,C as E,T as N,D as G,j as k,i as q}from"./dialog-Ct8hbyYt.js";import{a as l}from"./utils-WKja2AN6.js";import{X as y}from"./x-BElEhl3H.js";import{A as z}from"./arrow-left-4ZLsOmes.js";import{B as o}from"./button-cta-CrBpRd8F.js";import"./iframe-q9j1nkKU.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DGBgq71y.js";import"./index-CXXRf1yv.js";import"./index-Df-AMMJI.js";import"./index-D7rqPKg4.js";import"./createLucideIcon-rPzPdXF6.js";const O=A("fixed bottom-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col bg-background text-foreground duration-200 outline-none data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom",{variants:{variant:{default:"gap-6 rounded-t-[40px] px-5 py-[22px]",floating:"bottom-4 w-[calc(100%-2rem)] max-w-[343px] gap-4 rounded-[32px] bg-bg-neutral-weak p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",full:"h-[calc(100dvh-54px)] gap-4 rounded-t-[32px] pt-4"}},defaultVariants:{variant:"default"}});function w({className:t,children:n,variant:s,showCloseButton:i=!0,showOverlay:p=!0,...v}){return e.jsxs(H,{children:[p?e.jsx(I,{}):null,e.jsxs(L,{"data-slot":"bottom-sheet-content",className:l(O({variant:s}),t),...v,children:[i?e.jsx(E,{asChild:!0,children:e.jsxs(a,{variant:"text",size:"icon-sm",className:s==="floating"?"absolute top-3.5 right-3.5":"-ml-1.5 self-start",children:[e.jsx(y,{}),e.jsx("span",{className:"sr-only",children:"닫기"})]})}):null,n]})]})}function T({icon:t="close",title:n,onIconClick:s,className:i}){const p=t==="close"?y:z;return e.jsxs("header",{className:l("flex w-full items-center gap-6 px-4 py-3",i),children:[e.jsx("button",{type:"button","aria-label":t==="close"?"닫기":"뒤로 가기",onClick:s,className:"flex size-6 shrink-0 items-center justify-center text-fg-neutral-bold",children:e.jsx(p,{className:"size-6"})}),e.jsx(N,{"data-slot":"bottom-sheet-screen-title",className:"min-w-0 flex-1 truncate text-h5-1 text-fg-neutral-bold",children:n})]})}function c({className:t,...n}){return e.jsx("div",{"data-slot":"bottom-sheet-header",className:l("flex w-full flex-col items-center gap-2.5 py-2 text-center",t),...n})}function d({className:t,...n}){return e.jsx(N,{"data-slot":"bottom-sheet-title",className:l("text-h5-1 text-fg-neutral-bold",t),...n})}function S({className:t,...n}){return e.jsx(G,{"data-slot":"bottom-sheet-description",className:l("text-b6 whitespace-pre-line text-fg-neutral-subtle",t),...n})}function b({className:t,...n}){return e.jsx("div",{"data-slot":"bottom-sheet-graphic-slot",className:l("w-full rounded-[12px] bg-bg-neutral-subtle",t),...n})}function m({className:t,...n}){return e.jsx("div",{"data-slot":"bottom-sheet-actions",className:l("flex w-full gap-3",t),...n})}function r(t,n){D.open(({isOpen:s,close:i,unmount:p})=>e.jsx(F,{open:s,onOpenChange:v=>!v&&i(),children:e.jsx(w,{variant:n?.variant,showCloseButton:n?.showCloseButton,showOverlay:n?.showOverlay,className:n?.className,onCloseAutoFocus:()=>p(),"aria-describedby":void 0,children:t({close:i})})}))}w.__docgenInfo={description:"",methods:[],displayName:"BottomSheetContent",props:{showCloseButton:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},showOverlay:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}}}};T.__docgenInfo={description:"full variant 상단 헤더 — 좌측 아이콘(뒤로 ←/닫기 ✕) + 타이틀 (Figma Modal Header).",methods:[],displayName:"BottomSheetScreenHeader",props:{icon:{required:!1,tsType:{name:"union",raw:'"back" | "close"',elements:[{name:"literal",value:'"back"'},{name:"literal",value:'"close"'}]},description:"",defaultValue:{value:'"close"',computed:!1}},title:{required:!0,tsType:{name:"ReactNode"},description:""},onIconClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};c.__docgenInfo={description:"타이틀 + 설명을 감싸는 텍스트 영역.",methods:[],displayName:"BottomSheetHeader"};d.__docgenInfo={description:"",methods:[],displayName:"BottomSheetTitle"};S.__docgenInfo={description:"줄바꿈(\\n) 유지.",methods:[],displayName:"BottomSheetDescription"};b.__docgenInfo={description:"이미지·일러스트 등 자유 콘텐츠 슬롯. 높이는 콘텐츠 또는 className으로 지정.",methods:[],displayName:"BottomSheetGraphicSlot"};m.__docgenInfo={description:"ButtonCta 나열 영역. 보조 버튼은 `w-25 shrink-0`으로 고정 폭.",methods:[],displayName:"BottomSheetActions"};const oe={tags:["autodocs"],decorators:[t=>e.jsx(_,{children:e.jsx(t,{})})],parameters:{docs:{description:{component:"overlay-kit 기반 하단 슬라이드업 시트. floating=Figma Bottom Sheet v1.0.0 카드(Header·Title·Description·GraphicSlot·Actions 조합), default=풀폭 상단둥금(date picker·갤러리류). 텍스트는 예시 placeholder."},story:{inline:!1,height:"480px"}}}},h={render:()=>e.jsx(a,{onClick:()=>r(({close:t})=>e.jsxs(e.Fragment,{children:[e.jsxs(c,{children:[e.jsx(d,{children:"여행팟 정보를 확인해 주세요."}),e.jsx(S,{children:`{닉네임}님
회원가입이 완료됐어요!`})]}),e.jsxs(m,{children:[e.jsx(o,{variant:"secondary",className:"w-25 shrink-0",onClick:t,children:"Label"}),e.jsx(o,{onClick:t,children:"Label"})]})]}),{variant:"floating"}),children:"Default"})},u={render:()=>e.jsx(a,{onClick:()=>r(({close:t})=>e.jsxs(e.Fragment,{children:[e.jsxs(c,{children:[e.jsx(d,{children:"여행팟 정보를 확인해 주세요."}),e.jsx(S,{children:`{닉네임}님
회원가입이 완료됐어요!`})]}),e.jsx(b,{className:"h-30"}),e.jsxs(m,{children:[e.jsx(o,{variant:"secondary",className:"w-25 shrink-0",onClick:t,children:"Label"}),e.jsx(o,{onClick:t,children:"Label"})]})]}),{variant:"floating"}),children:"Information slot"})},x={render:()=>e.jsx(a,{onClick:()=>r(({close:t})=>e.jsxs(e.Fragment,{children:[e.jsx(b,{className:"h-30"}),e.jsxs(c,{children:[e.jsx(d,{children:"여행팟 정보를 확인해 주세요."}),e.jsx(S,{children:`{닉네임}님
회원가입이 완료됐어요!`})]}),e.jsxs(m,{children:[e.jsx(o,{variant:"secondary",className:"w-25 shrink-0",onClick:t,children:"Label"}),e.jsx(o,{onClick:t,children:"Label"})]})]}),{variant:"floating"}),children:"Graphic slot"})},f={render:()=>e.jsx(a,{onClick:()=>r(({close:t})=>e.jsxs(e.Fragment,{children:[e.jsxs(c,{children:[e.jsx(d,{children:"진짜 탈퇴하시게요?"}),e.jsx(S,{children:"즐거운 여행을 위해서 열심히 놀길 바랍니다."})]}),e.jsxs(m,{children:[e.jsx(o,{variant:"secondary",className:"w-25 shrink-0",onClick:t,children:"취소"}),e.jsx(o,{variant:"danger",onClick:t,children:"탈퇴하기"})]})]}),{variant:"floating"}),children:"탈퇴 확인"})},B={render:()=>e.jsx(a,{onClick:()=>r(({close:t})=>e.jsxs(e.Fragment,{children:[e.jsx(c,{children:e.jsx(d,{children:`서비스 이용을 위해
권한을 달라!`})}),e.jsx(b,{className:"h-30"}),e.jsxs(m,{children:[e.jsx(o,{variant:"secondary",className:"w-25 shrink-0",onClick:t,children:"싫어요"}),e.jsx(o,{onClick:t,children:"알겠어요~"})]})]}),{variant:"floating"}),children:"권한 요청"})},g={render:()=>e.jsx(a,{onClick:()=>r(({close:t})=>e.jsxs(e.Fragment,{children:[e.jsx(k,{className:"sr-only",children:"프로필 사진 옵션"}),e.jsxs("div",{className:"flex w-full flex-col",children:[e.jsx("button",{className:"py-3 text-left text-b3",onClick:t,children:"갤러리에서 선택"}),e.jsx(q,{}),e.jsx("button",{className:"py-3 text-left text-b3 text-destructive",onClick:t,children:"프로필 삭제"})]})]}),{variant:"floating",showCloseButton:!1}),children:"커스텀 콘텐츠"})},j={render:()=>e.jsx(a,{onClick:()=>r(({close:t})=>e.jsxs(e.Fragment,{children:[e.jsx(T,{icon:"back",title:"여행팟 생성",onIconClick:t}),e.jsx("div",{className:"flex w-full flex-1 flex-col px-4 text-b5",children:"콘텐츠 영역"}),e.jsx("div",{className:"w-full px-4 pb-[34px]",children:e.jsx(o,{disabled:!0,children:"다음"})})]}),{variant:"full",showCloseButton:!1}),children:"풀높이 화면형 시트"})},C={render:()=>e.jsx(a,{onClick:()=>r(({close:t})=>e.jsxs(e.Fragment,{children:[e.jsx(k,{children:"여행팟 정보를 확인해 주세요"}),e.jsxs("div",{className:"flex w-full flex-col gap-3 rounded-2xl bg-secondary p-4",children:[e.jsxs("p",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"text-h5",children:"{여행팟 이름}"}),e.jsx("span",{className:"text-b6 text-muted-foreground",children:"5명 참여 중"})]}),e.jsx("div",{className:"grid grid-cols-3 gap-y-3",children:Array.from({length:5}).map((n,s)=>e.jsxs("span",{className:"flex items-center gap-1.5 text-b6",children:[e.jsx("span",{className:"size-5 rounded-full bg-neutral-300"}),"{닉네임}"]},s))})]}),e.jsxs("div",{className:"flex w-full flex-col items-center gap-3",children:[e.jsx(a,{className:"w-full",onClick:t,children:"맞아요"}),e.jsx("button",{className:"text-b6 text-muted-foreground",onClick:t,children:"참여하지 않고 홈으로 이동"})]})]})),children:"풀폭 시트 (기존)"})};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => openBottomSheet(({
    close
  }) => <>
              <BottomSheetHeader>
                <BottomSheetTitle>
                  여행팟 정보를 확인해 주세요.
                </BottomSheetTitle>
                <BottomSheetDescription>
                  {"{닉네임}님\\n회원가입이 완료됐어요!"}
                </BottomSheetDescription>
              </BottomSheetHeader>
              <BottomSheetActions>
                <ButtonCta variant="secondary" className="w-25 shrink-0" onClick={close}>
                  Label
                </ButtonCta>
                <ButtonCta onClick={close}>Label</ButtonCta>
              </BottomSheetActions>
            </>, {
    variant: "floating"
  })}>
      Default
    </Button>
}`,...h.parameters?.docs?.source},description:{story:"Figma default — 타이틀+설명+버튼.",...h.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => openBottomSheet(({
    close
  }) => <>
              <BottomSheetHeader>
                <BottomSheetTitle>
                  여행팟 정보를 확인해 주세요.
                </BottomSheetTitle>
                <BottomSheetDescription>
                  {"{닉네임}님\\n회원가입이 완료됐어요!"}
                </BottomSheetDescription>
              </BottomSheetHeader>
              <BottomSheetGraphicSlot className="h-30" />
              <BottomSheetActions>
                <ButtonCta variant="secondary" className="w-25 shrink-0" onClick={close}>
                  Label
                </ButtonCta>
                <ButtonCta onClick={close}>Label</ButtonCta>
              </BottomSheetActions>
            </>, {
    variant: "floating"
  })}>
      Information slot
    </Button>
}`,...u.parameters?.docs?.source},description:{story:"Figma information slot — 타이틀+설명 아래 그래픽 슬롯.",...u.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => openBottomSheet(({
    close
  }) => <>
              <BottomSheetGraphicSlot className="h-30" />
              <BottomSheetHeader>
                <BottomSheetTitle>
                  여행팟 정보를 확인해 주세요.
                </BottomSheetTitle>
                <BottomSheetDescription>
                  {"{닉네임}님\\n회원가입이 완료됐어요!"}
                </BottomSheetDescription>
              </BottomSheetHeader>
              <BottomSheetActions>
                <ButtonCta variant="secondary" className="w-25 shrink-0" onClick={close}>
                  Label
                </ButtonCta>
                <ButtonCta onClick={close}>Label</ButtonCta>
              </BottomSheetActions>
            </>, {
    variant: "floating"
  })}>
      Graphic slot
    </Button>
}`,...x.parameters?.docs?.source},description:{story:"Figma graphic slot — 그래픽 슬롯이 상단.",...x.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => openBottomSheet(({
    close
  }) => <>
              <BottomSheetHeader>
                <BottomSheetTitle>진짜 탈퇴하시게요?</BottomSheetTitle>
                <BottomSheetDescription>
                  즐거운 여행을 위해서 열심히 놀길 바랍니다.
                </BottomSheetDescription>
              </BottomSheetHeader>
              <BottomSheetActions>
                <ButtonCta variant="secondary" className="w-25 shrink-0" onClick={close}>
                  취소
                </ButtonCta>
                <ButtonCta variant="danger" onClick={close}>
                  탈퇴하기
                </ButtonCta>
              </BottomSheetActions>
            </>, {
    variant: "floating"
  })}>
      탈퇴 확인
    </Button>
}`,...f.parameters?.docs?.source},description:{story:"Example — 탈퇴 확인(danger CTA).",...f.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => openBottomSheet(({
    close
  }) => <>
              <BottomSheetHeader>
                <BottomSheetTitle>
                  {"서비스 이용을 위해\\n권한을 달라!"}
                </BottomSheetTitle>
              </BottomSheetHeader>
              <BottomSheetGraphicSlot className="h-30" />
              <BottomSheetActions>
                <ButtonCta variant="secondary" className="w-25 shrink-0" onClick={close}>
                  싫어요
                </ButtonCta>
                <ButtonCta onClick={close}>알겠어요~</ButtonCta>
              </BottomSheetActions>
            </>, {
    variant: "floating"
  })}>
      권한 요청
    </Button>
}`,...B.parameters?.docs?.source},description:{story:"Example — 설명 없이 타이틀(2줄)+그래픽.",...B.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => openBottomSheet(({
    close
  }) => <>
              <DialogTitle className="sr-only">프로필 사진 옵션</DialogTitle>
              <div className="flex w-full flex-col">
                <button className="py-3 text-left text-b3" onClick={close}>
                  갤러리에서 선택
                </button>
                <DialogSeparator />
                <button className="py-3 text-left text-b3 text-destructive" onClick={close}>
                  프로필 삭제
                </button>
              </div>
            </>, {
    variant: "floating",
    showCloseButton: false
  })}>
      커스텀 콘텐츠
    </Button>
}`,...g.parameters?.docs?.source},description:{story:"floating에 자유 콘텐츠 주입(프로필 사진 액션 시트류).",...g.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => openBottomSheet(({
    close
  }) => <>
              <BottomSheetScreenHeader icon="back" title="여행팟 생성" onIconClick={close} />
              <div className="flex w-full flex-1 flex-col px-4 text-b5">
                콘텐츠 영역
              </div>
              <div className="w-full px-4 pb-[34px]">
                <ButtonCta disabled>다음</ButtonCta>
              </div>
            </>, {
    variant: "full",
    showCloseButton: false
  })}>
      풀높이 화면형 시트
    </Button>
}`,...j.parameters?.docs?.source},description:{story:"Figma Modal — full variant: 상단 라운드 32 풀높이 화면형 시트 (여행팟 생성·참여).",...j.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => openBottomSheet(({
    close
  }) => <>
            <DialogTitle>여행팟 정보를 확인해 주세요</DialogTitle>
            <div className="flex w-full flex-col gap-3 rounded-2xl bg-secondary p-4">
              <p className="flex items-baseline gap-2">
                <span className="text-h5">{"{여행팟 이름}"}</span>
                <span className="text-b6 text-muted-foreground">
                  5명 참여 중
                </span>
              </p>
              <div className="grid grid-cols-3 gap-y-3">
                {Array.from({
          length: 5
        }).map((_, i) => <span key={i} className="flex items-center gap-1.5 text-b6">
                    <span className="size-5 rounded-full bg-neutral-300" />
                    {"{닉네임}"}
                  </span>)}
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-3">
              <Button className="w-full" onClick={close}>
                맞아요
              </Button>
              <button className="text-b6 text-muted-foreground" onClick={close}>
                참여하지 않고 홈으로 이동
              </button>
            </div>
          </>)}>
      풀폭 시트 (기존)
    </Button>
}`,...C.parameters?.docs?.source},description:{story:"기존 풀폭 상단둥금 시트(date picker·갤러리류) — 이번 Figma 컴포넌트 범위 밖, 유지.",...C.parameters?.docs?.description}}};const ae=["Default","InformationSlot","GraphicSlot","WithdrawExample","PermissionExample","CustomContent","FullScreen","EdgeToEdge"];export{g as CustomContent,h as Default,C as EdgeToEdge,j as FullScreen,x as GraphicSlot,u as InformationSlot,B as PermissionExample,f as WithdrawExample,ae as __namedExportsOrder,oe as default};
