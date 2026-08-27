import{j as e}from"./jsx-runtime-u17CrQMm.js";import{P as u,K as y}from"./index-DbBabBnP.js";import{H as B}from"./iframe-BkbDGDP7.js";import{B as p}from"./button-BXxs3aFK.js";import{B as x}from"./button-cta-CrBpRd8F.js";import{b as h,c as f,f as C,j as g,i as w,d as j,e as b}from"./dialog-CGVmsM5E.js";import{a as D,i as _}from"./icon-close-C8gXVLiZ.js";import"./preload-helper-PPVm8Dsz.js";import"./index-CqkPUm8v.js";import"./utils-WKja2AN6.js";import"./index-yqPqzITt.js";import"./x-B3UP4STK.js";import"./createLucideIcon-CApEsLdA.js";import"./index-DGFu-If_.js";import"./index-Ccc0k0Ur.js";import"./index-CTxe-5Hs.js";function A({title:s,description:t,confirmText:n="확인"}){return u.openAsync(({isOpen:r,close:a,unmount:o})=>e.jsx(h,{open:r,onOpenChange:i=>!i&&a(),children:e.jsxs(f,{showCloseButton:!1,onCloseAutoFocus:()=>o(),children:[e.jsxs(C,{children:[e.jsx(g,{children:s}),e.jsxs(e.Fragment,{children:[e.jsx(w,{className:"my-1"}),e.jsx(j,{children:t})]})]}),e.jsx(b,{children:e.jsx(p,{className:"w-full",onClick:()=>a(),children:n})})]})}))}function N({title:s,description:t,confirmText:n="확인",cancelText:r="취소",destructive:a=!1}){return u.openAsync(({isOpen:o,close:i,unmount:v})=>e.jsx(h,{open:o,onOpenChange:k=>!k&&i(!1),children:e.jsxs(f,{showCloseButton:!1,onCloseAutoFocus:()=>v(),className:"w-[343px] max-w-[calc(100%-2rem)] gap-2 rounded-[32px] p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",...t?{}:{"aria-describedby":void 0},children:[e.jsxs(C,{className:"items-center gap-1 py-3 text-center",children:[e.jsx(g,{className:"text-h5-1 text-fg-neutral-bold",children:s}),t?e.jsx(j,{className:"text-b6 text-fg-neutral-subtle",children:t}):null]}),e.jsxs(b,{className:"gap-3",children:[e.jsx(x,{variant:"secondary",className:"w-25 shrink-0",onClick:()=>i(!1),children:r}),e.jsx(x,{variant:a?"danger":"primary",className:"flex-1",onClick:()=>i(!0),children:n})]})]})}))}function S(s,t){u.open(({isOpen:n,close:r,unmount:a})=>e.jsx(h,{open:n,onOpenChange:o=>!o&&r(),children:e.jsx(f,{className:t?.className,showCloseButton:t?.showCloseButton,onCloseAutoFocus:()=>a(),"aria-describedby":void 0,children:s({close:r})})}))}const V={tags:["autodocs"],decorators:[s=>e.jsx(y,{children:e.jsx(s,{})})],parameters:{docs:{description:{component:"overlay-kit 기반 명령형 모달 헬퍼 — openAlert / openConfirm / openModal. 어디서든 함수 호출로 열고 promise로 결과를 받음. 텍스트는 예시 placeholder."},story:{inline:!1,height:"400px"}}}},l={render:()=>e.jsx(p,{onClick:()=>A({title:e.jsxs(e.Fragment,{children:["{닉네임}님",e.jsx("br",{}),"회원가입이 완료됐어요!"]}),description:"원하는 지역을 클릭해서 사진을 넣으라고 하기"}),children:"Alert 열기"})};function F(){const[s,t]=B.useState("");return e.jsxs("div",{className:"flex flex-col items-start gap-2",children:[e.jsx(p,{onClick:async()=>{const n=await N({title:"로그아웃하시겠습니까?",confirmText:"로그아웃"});t(n?"로그아웃 확인됨":"취소됨")},children:"Confirm 열기"}),s?e.jsxs("span",{className:"text-b6 text-muted-foreground",children:["결과: ",s]}):null]})}const c={render:()=>e.jsx(F,{})},m={render:()=>e.jsx(p,{variant:"destructive",onClick:()=>N({title:"계정을 영구적으로 삭제하시겠습니까?",description:"복구할 수 없습니다.",confirmText:"삭제",destructive:!0}),children:"계정 삭제 모달 열기"})},d={render:()=>e.jsx(p,{onClick:()=>S(({close:s})=>e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button","aria-label":"닫기",className:"absolute top-4 right-4 flex size-7 items-center justify-center",onClick:s,children:e.jsx("img",{src:D,alt:"",className:"size-5"})}),e.jsxs(g,{className:"py-2 text-center text-h5-1 text-fg-neutral-bold",children:["서비스 이용을 위해",e.jsx("br",{}),"접근 권한을 허용해 주세요."]}),e.jsx("div",{className:"flex h-[100px] items-center rounded-[12px] bg-bg-neutral-subtle p-5",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("img",{src:_,alt:"",className:"size-9 shrink-0"}),e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsx("span",{className:"text-h6-1 text-fg-neutral-bold",children:"앨범"}),e.jsx("span",{className:"text-b8 text-fg-neutral-subtle",children:"이미지 저장 및 업로드"})]})]})}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx(x,{variant:"secondary",className:"w-25 shrink-0",onClick:s,children:"취소"}),e.jsx(x,{className:"flex-1",onClick:s,children:"확인"})]})]}),{className:"w-[343px] max-w-[calc(100%-2rem)] gap-4 rounded-[32px] p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",showCloseButton:!1}),children:"권한 모달 열기"})};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => openAlert({
    title: <>
              {"{닉네임}님"}
              <br />
              회원가입이 완료됐어요!
            </>,
    description: "원하는 지역을 클릭해서 사진을 넣으라고 하기"
  })}>
      Alert 열기
    </Button>
}`,...l.parameters?.docs?.source},description:{story:"시안 #25 — 안내 알림(버튼 1개).",...l.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <ConfirmDemo />
}`,...c.parameters?.docs?.source},description:{story:"시안 #30 — 확인/취소(버튼 2개). promise로 boolean 결과.",...c.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Button variant="destructive" onClick={() => openConfirm({
    title: "계정을 영구적으로 삭제하시겠습니까?",
    description: "복구할 수 없습니다.",
    confirmText: "삭제",
    destructive: true
  })}>
      계정 삭제 모달 열기
    </Button>
}`,...m.parameters?.docs?.source},description:{story:"계정 삭제 — destructive(빨강 확인 버튼) + 설명 구분선.",...m.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => openModal(({
    close
  }) => <>
              <button type="button" aria-label="닫기" className="absolute top-4 right-4 flex size-7 items-center justify-center" onClick={close}>
                <img src={iconCloseSrc} alt="" className="size-5" />
              </button>
              <DialogTitle className="py-2 text-center text-h5-1 text-fg-neutral-bold">
                서비스 이용을 위해
                <br />
                접근 권한을 허용해 주세요.
              </DialogTitle>
              <div className="flex h-[100px] items-center rounded-[12px] bg-bg-neutral-subtle p-5">
                <div className="flex items-center gap-3">
                  <img src={iconCameraSrc} alt="" className="size-9 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="text-h6-1 text-fg-neutral-bold">앨범</span>
                    <span className="text-b8 text-fg-neutral-subtle">
                      이미지 저장 및 업로드
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <ButtonCta variant="secondary" className="w-25 shrink-0" onClick={close}>
                  취소
                </ButtonCta>
                <ButtonCta className="flex-1" onClick={close}>
                  확인
                </ButtonCta>
              </div>
            </>, {
    className: "w-[343px] max-w-[calc(100%-2rem)] gap-4 rounded-[32px] p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",
    showCloseButton: false
  })}>
      권한 모달 열기
    </Button>
}`,...d.parameters?.docs?.source},description:{story:"커스텀 내용 모달(권한 팝업, Figma Bottom Sheet v1.0.0). openModal 옵션으로 스타일·닫기 버튼 제어.",...d.parameters?.docs?.description}}};const W=["Alert","Confirm","DestructiveConfirm","PermissionContent"];export{l as Alert,c as Confirm,m as DestructiveConfirm,d as PermissionContent,W as __namedExportsOrder,V as default};
