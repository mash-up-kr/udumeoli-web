import{j as n}from"./jsx-runtime-u17CrQMm.js";import{H as o}from"./iframe-NrRGWjPt.js";import{C as a}from"./calendar-Qv2N7TK_.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-WKja2AN6.js";import"./createLucideIcon-BS2-p1dg.js";import"./chevron-right--7JPUDQa.js";const D={component:a,parameters:{layout:"centered",docs:{description:{component:"react-day-picker 기반 날짜 선택 캘린더 (Figma Date Picker v1.0.0). 한국어·월요일 시작, 오늘/선택 상태 브랜드 컬러."}}}},e={render:()=>{const[r,s]=o.useState();return n.jsx(a,{mode:"single",selected:r,onSelect:s})}},t={render:()=>{const[r,s]=o.useState(new Date(2026,6,9));return n.jsx(a,{mode:"single",month:new Date(2026,6,1),selected:r,onSelect:s})}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [date, setDate] = React.useState<Date>();
    return <Calendar mode="single" selected={date} onSelect={setDate} />;
  }
}`,...e.parameters?.docs?.source},description:{story:"단일 날짜 선택.",...e.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 6, 9));
    return <Calendar mode="single" month={new Date(2026, 6, 1)} selected={date} onSelect={setDate} />;
  }
}`,...t.parameters?.docs?.source},description:{story:"특정 날짜가 선택된 상태.",...t.parameters?.docs?.description}}};const S=["Single","Preselected"];export{t as Preselected,e as Single,S as __namedExportsOrder,D as default};
