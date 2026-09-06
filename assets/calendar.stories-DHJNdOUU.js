import{j as o}from"./jsx-runtime-u17CrQMm.js";import{H as d}from"./iframe-BsDJskvX.js";import{C as n}from"./calendar-BJA6W_W-.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-WKja2AN6.js";import"./createLucideIcon-DTdvrVA6.js";import"./chevron-right-KUx6LBVt.js";const S={component:n,parameters:{layout:"centered",docs:{description:{component:"react-day-picker 기반 날짜 선택 캘린더 (Figma Date Picker v1.0.0). 한국어·월요일 시작, 오늘은 무채색 원·선택만 브랜드 컬러 원. 항상 6주 고정 렌더(fixedWeeks)로 달 이동 시 높이가 흔들리지 않는다."}}}},r={render:()=>{const[e,t]=d.useState();return o.jsx(n,{mode:"single",selected:e,onSelect:t})}},s={render:()=>{const[e,t]=d.useState(new Date(2026,6,9));return o.jsx(n,{mode:"single",month:new Date(2026,6,1),selected:e,onSelect:t})}},a={render:()=>{const[e,t]=d.useState();return o.jsx(n,{mode:"single",selected:e,onSelect:t,disabled:{after:new Date}})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [date, setDate] = React.useState<Date>();
    return <Calendar mode="single" selected={date} onSelect={setDate} />;
  }
}`,...r.parameters?.docs?.source},description:{story:"단일 날짜 선택.",...r.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 6, 9));
    return <Calendar mode="single" month={new Date(2026, 6, 1)} selected={date} onSelect={setDate} />;
  }
}`,...s.parameters?.docs?.source},description:{story:"특정 날짜가 선택된 상태.",...s.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [date, setDate] = React.useState<Date>();
    return <Calendar mode="single" selected={date} onSelect={setDate} disabled={{
      after: new Date()
    }} />;
  }
}`,...a.parameters?.docs?.source},description:{story:"다녀온 날짜 선택 — 오늘 이후는 비활성화 (여행 기록·사진 업로드 플로우).",...a.parameters?.docs?.description}}};const g=["Single","Preselected","PastOnly"];export{a as PastOnly,s as Preselected,r as Single,g as __namedExportsOrder,S as default};
