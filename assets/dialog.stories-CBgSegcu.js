import{j as e}from"./jsx-runtime-u17CrQMm.js";import{K as x,P as j}from"./index-6v2lbX69.js";import{B as o}from"./button-BvPZ-71i.js";import{b as s,k as m,c as t,f as l,j as c,d,e as p}from"./dialog-CVMZQvgm.js";import"./iframe-C3-lbO0s.js";import"./preload-helper-PPVm8Dsz.js";import"./index-CqkPUm8v.js";import"./utils-WKja2AN6.js";import"./index-dJDB2dTu.js";import"./x-CCSNeKQ9.js";import"./createLucideIcon-tj5_fvXP.js";import"./index-6IV2g8nb.js";import"./index-BemIvQBq.js";import"./index-Bqlx2dHF.js";const P={component:s,tags:["autodocs"],parameters:{docs:{description:{component:"화면 위에 떠오르는 팝업. 안내 메시지, 권한 요청, 완료 알림 등에 사용."}}}},r={render:()=>e.jsxs(s,{children:[e.jsx(m,{asChild:!0,children:e.jsx(o,{children:"다이얼로그 열기"})}),e.jsxs(t,{children:[e.jsxs(l,{children:[e.jsx(c,{children:"제목"}),e.jsx(d,{children:"내용이 여기 들어갑니다."})]}),e.jsx(p,{children:e.jsx(o,{className:"w-full",children:"확인"})})]})]})},n={render:()=>e.jsxs(s,{children:[e.jsx(m,{asChild:!0,children:e.jsx(o,{children:"닫기 버튼 포함"})}),e.jsxs(t,{showCloseButton:!0,children:[e.jsxs(l,{children:[e.jsx(c,{children:"접근 권한 확인"}),e.jsx(d,{children:"편리한 앱 이용을 위해 접근 권한을 허용해주세요."})]}),e.jsx(p,{children:e.jsx(o,{className:"w-full",children:"확인"})})]})]})};function f(){function a(){j.open(({isOpen:D,close:g,unmount:h})=>e.jsx(s,{open:D,onOpenChange:u=>!u&&g(),children:e.jsxs(t,{onCloseAutoFocus:()=>h(),children:[e.jsxs(l,{children:[e.jsx(c,{children:"overlay.open() 방식"}),e.jsx(d,{children:"overlay-kit을 사용한 명령형 다이얼로그입니다."})]}),e.jsx(p,{children:e.jsx(o,{className:"w-full",onClick:g,children:"확인"})})]})}))}return e.jsx(o,{onClick:a,children:"overlay.open()으로 열기"})}const i={decorators:[a=>e.jsx(x,{children:e.jsx(a,{})})],parameters:{docs:{story:{inline:!1,height:"400px"}}},render:()=>e.jsx(f,{})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog>
      <DialogTrigger asChild>
        <Button>다이얼로그 열기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>제목</DialogTitle>
          <DialogDescription>내용이 여기 들어갑니다.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="w-full">확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog>
      <DialogTrigger asChild>
        <Button>닫기 버튼 포함</Button>
      </DialogTrigger>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>접근 권한 확인</DialogTitle>
          <DialogDescription>
            편리한 앱 이용을 위해 접근 권한을 허용해주세요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="w-full">확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  decorators: [Story => <OverlayProvider>
        <Story />
      </OverlayProvider>],
  parameters: {
    docs: {
      story: {
        inline: false,
        height: "400px"
      }
    }
  },
  render: () => <ImperativeExample />
}`,...i.parameters?.docs?.source}}};const K=["Default","WithCloseButton","Imperative"];export{r as Default,i as Imperative,n as WithCloseButton,K as __namedExportsOrder,P as default};
