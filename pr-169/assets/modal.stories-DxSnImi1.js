import{j as e}from"./jsx-runtime-u17CrQMm.js";import{K as p}from"./index-BxxLgsK4.js";import{H as d}from"./iframe-BC0asWHy.js";import{B as a}from"./button-v9GzEKo4.js";import{B as i}from"./button-cta-CrBpRd8F.js";import{j as x}from"./dialog-uAiqZcXo.js";import{o as u,a as c,b as f}from"./modal-HkseEYxf.js";import{i as g}from"./icon-close-BoAod3vu.js";import{i as h}from"./icon-camera-BBFO_Kum.js";import"./preload-helper-PPVm8Dsz.js";import"./index-CqkPUm8v.js";import"./utils-WKja2AN6.js";import"./index-B_6mlFoT.js";import"./portal-container-BwKwLlH1.js";import"./index-s67oTPxk.js";import"./index-gN7gx6wY.js";import"./index-CPumtIYp.js";import"./x-G33ftGZN.js";import"./createLucideIcon-CAsqfNTH.js";const K={tags:["autodocs"],decorators:[t=>e.jsx(p,{children:e.jsx(t,{})})],parameters:{docs:{description:{component:"overlay-kit 기반 명령형 모달 헬퍼 — openAlert / openConfirm / openModal. 어디서든 함수 호출로 열고 promise로 결과를 받음. 텍스트는 예시 placeholder."},story:{inline:!1,height:"400px"}}}},s={render:()=>e.jsx(a,{onClick:()=>u({title:e.jsxs(e.Fragment,{children:["{닉네임}님",e.jsx("br",{}),"회원가입이 완료됐어요!"]}),description:"원하는 지역을 클릭해서 사진을 넣으라고 하기"}),children:"Alert 열기"})};function C(){const[t,l]=d.useState("");return e.jsxs("div",{className:"flex flex-col items-start gap-2",children:[e.jsx(a,{onClick:async()=>{const m=await c({title:"로그아웃하시겠습니까?",confirmText:"로그아웃"});l(m?"로그아웃 확인됨":"취소됨")},children:"Confirm 열기"}),t?e.jsxs("span",{className:"text-b6 text-muted-foreground",children:["결과: ",t]}):null]})}const r={render:()=>e.jsx(C,{})},n={render:()=>e.jsx(a,{variant:"destructive",onClick:()=>c({title:"계정을 영구적으로 삭제하시겠습니까?",description:"복구할 수 없습니다.",confirmText:"삭제",destructive:!0}),children:"계정 삭제 모달 열기"})},o={render:()=>e.jsx(a,{onClick:()=>f(({close:t})=>e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button","aria-label":"닫기",className:"absolute top-2 right-2 flex size-11 items-center justify-center",onClick:t,children:e.jsx("img",{src:g,alt:"",className:"size-5"})}),e.jsxs(x,{className:"py-2 text-center text-h5-1 text-fg-neutral-bold",children:["서비스 이용을 위해",e.jsx("br",{}),"접근 권한을 허용해 주세요."]}),e.jsx("div",{className:"flex h-[100px] items-center rounded-[12px] bg-bg-neutral-subtle p-5",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("img",{src:h,alt:"",className:"size-9 shrink-0"}),e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsx("span",{className:"text-h6-1 text-fg-neutral-bold",children:"앨범"}),e.jsx("span",{className:"text-b8 text-fg-neutral-subtle",children:"이미지 저장 및 업로드"})]})]})}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx(i,{variant:"secondary",className:"w-25 shrink-0",onClick:t,children:"취소"}),e.jsx(i,{className:"flex-1",onClick:t,children:"확인"})]})]}),{className:"w-[343px] max-w-[calc(100%-2rem)] gap-4 rounded-[32px] p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",showCloseButton:!1,onOpenAutoFocus:t=>{t.preventDefault(),t.target instanceof HTMLElement&&t.target.focus()}}),children:"권한 모달 열기"})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source},description:{story:"시안 #25 — 안내 알림(버튼 1개).",...s.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <ConfirmDemo />
}`,...r.parameters?.docs?.source},description:{story:"시안 #30 — 확인/취소(버튼 2개). promise로 boolean 결과.",...r.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Button variant="destructive" onClick={() => openConfirm({
    title: "계정을 영구적으로 삭제하시겠습니까?",
    description: "복구할 수 없습니다.",
    confirmText: "삭제",
    destructive: true
  })}>
      계정 삭제 모달 열기
    </Button>
}`,...n.parameters?.docs?.source},description:{story:"계정 삭제 — destructive(빨강 확인 버튼) + 설명 구분선.",...n.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => openModal(({
    close
  }) => <>
              <button type="button" aria-label="닫기" className="absolute top-2 right-2 flex size-11 items-center justify-center" onClick={close}>
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
    showCloseButton: false,
    onOpenAutoFocus: event => {
      event.preventDefault();
      if (event.target instanceof HTMLElement) event.target.focus();
    }
  })}>
      권한 모달 열기
    </Button>
}`,...o.parameters?.docs?.source},description:{story:"커스텀 내용 모달(권한 팝업, Figma Bottom Sheet v1.0.0). openModal 옵션으로 스타일·닫기 버튼 제어.",...o.parameters?.docs?.description}}};const L=["Alert","Confirm","DestructiveConfirm","PermissionContent"];export{s as Alert,r as Confirm,n as DestructiveConfirm,o as PermissionContent,L as __namedExportsOrder,K as default};
