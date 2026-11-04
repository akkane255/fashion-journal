import { useState, useRef, useEffect } from "react";

const C = {
  bg:"#f7f2ec",card:"#ffffff",gold:"#c8a060",goldLight:"#f5ead8",
  dark:"#1c1810",text:"#2a2218",sub:"#9a8868",border:"#e8ddd0",
  success:"#5a9060",fail:"#c06050",pink:"#d898a0",purple:"#8878b8",
};

const TODAY = new Date().toISOString().split("T")[0];
const YESTERDAY = new Date(Date.now()-86400000).toISOString().split("T")[0];
const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const numFmt = n => n>=10000?`¥${(n/10000).toFixed(1)}万`:`¥${Number(n).toLocaleString()}`;

const INIT_RECORDS = [
  {id:1,date:TODAY,period:"午班",weather:"☀️",temp:"22°C",flow:"多",language:"中文客",gender:"女性",age:"20代後半",style:["韓系","高級感"],customer_type:"B",mood:"猶豫",result:"success",amount:12000,items:[{name:"米色針織外套",price:8000},{name:"高腰寬褲",price:4000}],item_count:2,key_sentence:"這個版型讓腰線高很多，上班約會都能穿",buy_reason:"我的推薦",products:"米色針織外套 + 高腰寬褲",self_state:"精神飽滿",sell_desire:"強烈",opening_line:"這款剛到，很多人問",built_rapport:true},
  {id:2,date:TODAY,period:"午班",weather:"☀️",temp:"22°C",flow:"多",language:"日文客",gender:"女性",age:"30代",style:["OL"],customer_type:"C",mood:"防備",result:"fail",amount:0,items:[],item_count:0,key_sentence:"",buy_reason:"",no_buy_reason:"價格",redo:"應該先問她預算再推",products:"黑色西裝外套",self_state:"精神飽滿",sell_desire:"強烈",opening_line:"",built_rapport:false},
  {id:3,date:YESTERDAY,period:"晚班",weather:"☀️",temp:"21°C",flow:"普通",language:"中文客",gender:"女性",age:"20代前半",style:["韓系"],customer_type:"A",mood:"開放友善",result:"success",amount:8500,items:[{name:"格紋長裙",price:5000},{name:"針織背心",price:3500}],item_count:2,key_sentence:"這套穿起來比你想的更日常，不會太正式",buy_reason:"場景說服",products:"格紋長裙 + 針織背心",self_state:"精神飽滿",sell_desire:"強烈",opening_line:"這個搭配最近很多人問",built_rapport:true},
];

const INIT_TASKS = {date:TODAY,tasks:["","",""],done:[false,false,false]};
const INIT_WARDROBE = [
  {id:1,name:"米色針織外套",category:"外套",soldCount:5,pairsWith:["高腰寬褲","格紋長裙"],imgColor:"#e8d8c0",imgEmoji:"🧥",imgUrl:null},
  {id:2,name:"高腰寬褲",category:"下身",soldCount:4,pairsWith:["米色針織外套","針織背心"],imgColor:"#d0d8e8",imgEmoji:"👖",imgUrl:null},
  {id:3,name:"格紋長裙",category:"下身",soldCount:3,pairsWith:["針織背心"],imgColor:"#e8d0d8",imgEmoji:"👗",imgUrl:null},
];

// ── ATOMS ─────────────────────────────────────────────────────────────────────
const Tag=({label,active,onClick,color})=>(
  <button onClick={onClick} style={{padding:"5px 12px",border:`1.5px solid ${active?(color||C.dark):C.border}`,background:active?(color||C.dark):"transparent",color:active?"#fff":C.sub,borderRadius:"20px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",transition:"all .15s"}}>{label}</button>
);
const TagGroup=({options,value,onChange,multi,color})=>{
  const selected=Array.isArray(value)?value:(value?[value]:[]);
  const toggle=o=>multi?onChange(selected.includes(o)?selected.filter(v=>v!==o):[...selected,o]):onChange(value===o?"":o);
  return <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>{options.map(o=><Tag key={o} label={o} active={multi?selected.includes(o):value===o} onClick={()=>toggle(o)} color={color}/>)}</div>;
};
const Fld=({label,hint,children})=>(
  <div style={{marginBottom:"13px"}}>
    {label&&<div style={{fontSize:"11px",color:C.sub,marginBottom:"5px",letterSpacing:"0.05em"}}>{label}{hint&&<span style={{color:"#c0b8a8",marginLeft:"6px",fontSize:"10px"}}>{hint}</span>}</div>}
    {children}
  </div>
);
const Inp=({value,onChange,placeholder,multi,style={}})=>{
  const s={width:"100%",padding:"9px 11px",border:`1px solid ${C.border}`,borderRadius:"8px",fontFamily:"inherit",fontSize:"13px",color:C.text,background:C.bg,outline:"none",boxSizing:"border-box",resize:multi?"vertical":"none",minHeight:multi?"66px":undefined,lineHeight:"1.6",...style};
  return multi?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s}/>:<input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s}/>;
};
const Tog=({label,value,onChange,accent=C.gold})=>(
  <label onClick={()=>onChange(!value)} style={{display:"flex",alignItems:"center",gap:"8px",cursor:"pointer",fontSize:"12.5px",color:C.text}}>
    <div style={{width:"34px",height:"18px",borderRadius:"9px",background:value?accent:C.border,position:"relative",transition:"background .2s",flexShrink:0}}>
      <div style={{width:"14px",height:"14px",borderRadius:"50%",background:"white",position:"absolute",top:"2px",left:value?"18px":"2px",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
    </div>
    {label}
  </label>
);
const Card=({children,accent,mb=10})=>(
  <div style={{background:C.card,borderRadius:"14px",padding:"15px 16px",marginBottom:mb,border:`1px solid ${C.border}`,borderTop:accent?`3px solid ${accent}`:undefined}}>{children}</div>
);
const SectionLabel=({label,accent=C.gold})=>(
  <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"13px"}}>
    <div style={{width:"3px",height:"14px",background:accent,borderRadius:"2px"}}/>
    <span style={{fontSize:"10px",letterSpacing:"0.16em",color:C.sub,fontWeight:700}}>{label}</span>
  </div>
);
const GoalRing=({pct,size=76,stroke=7,color,label,sub})=>{
  const r=(size-stroke)/2,circ=2*Math.PI*r,dash=Math.min(pct/100,1)*circ;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)",position:"absolute"}}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:"15px",fontWeight:700,color}}>{pct}%</span>
        </div>
      </div>
      <div style={{marginTop:"5px",textAlign:"center"}}>
        <div style={{fontSize:"10px",color:C.sub,letterSpacing:"0.06em"}}>{label}</div>
        <div style={{fontSize:"11px",color:C.text,marginTop:"1px"}}>{sub}</div>
      </div>
    </div>
  );
};


// ── DAILY ENVIRONMENT & STATE ─────────────────────────────────────────────────
function DailyEnvironment({profile,onChange}){
  const weatherOptions=[{value:"晴",emoji:"☀️"},{value:"陰天",emoji:"☁️"},{value:"下雨",emoji:"🌧️"}];
  const stateOptions=[{value:"還好",emoji:"😐"},{value:"很累",emoji:"😴"},{value:"有幹勁",emoji:"⚡"}];
  const field=(key,value)=>onChange({...profile,[key]:value});
  return(
    <Card mb={10}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
        <div style={{fontSize:"12px",fontWeight:700,color:C.text}}>今日環境與狀態</div>
        <div style={{fontSize:"10px",color:C.sub}}>每日設定</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"7px"}}>
        <span style={{fontSize:"10px",color:C.sub,width:"48px",flexShrink:0}}>天氣</span>
        <div style={{display:"flex",gap:"6px",flex:1}}>
          {weatherOptions.map(w=><button key={w.value} onClick={()=>field("weather",w.value)} style={{flex:1,padding:"6px 4px",border:`1px solid ${profile.weather===w.value?C.gold:C.border}`,background:profile.weather===w.value?C.goldLight:"transparent",color:profile.weather===w.value?C.text:C.sub,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>{w.emoji} {w.value}</button>)}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"10px"}}>
        <span style={{fontSize:"10px",color:C.sub,width:"48px",flexShrink:0}}>氣溫</span>
        <div style={{display:"flex",alignItems:"center",gap:"5px",flex:1}}>
          <input type="number" value={profile.lowTemp} onChange={e=>field("lowTemp",e.target.value)} placeholder="最低" style={{width:"100%",minWidth:0,padding:"6px 7px",border:`1px solid ${C.border}`,borderRadius:"7px",fontSize:"11px",background:C.bg,color:C.text,boxSizing:"border-box"}}/>
          <span style={{fontSize:"11px",color:C.sub}}>～</span>
          <input type="number" value={profile.highTemp} onChange={e=>field("highTemp",e.target.value)} placeholder="最高" style={{width:"100%",minWidth:0,padding:"6px 7px",border:`1px solid ${C.border}`,borderRadius:"7px",fontSize:"11px",background:C.bg,color:C.text,boxSizing:"border-box"}}/>
          <span style={{fontSize:"10px",color:C.sub}}>°C</span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
        <span style={{fontSize:"10px",color:C.sub,width:"48px",flexShrink:0}}>今日狀態</span>
        <div style={{display:"flex",gap:"6px",flex:1}}>
          {stateOptions.map(st=><button key={st.value} onClick={()=>field("status",st.value)} style={{flex:1,padding:"6px 4px",border:`1px solid ${profile.status===st.value?C.purple:C.border}`,background:profile.status===st.value?"#f5f0fa":"transparent",color:profile.status===st.value?C.purple:C.sub,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>{st.emoji} {st.value}</button>)}
        </div>
      </div>
    </Card>
  );
}

// ── TODAY TARGETS ─────────────────────────────────────────────────────────────
function TodayTargets({todayRecs}){
  const [edit,setEdit]=useState(false);
  const [targets,setTargets]=useState({store:"",personal:"",staffCount:"",guestCount:"",dealCount:"",hourlyWage:"",shiftHours:""});
  const [storeActual,setStoreActual]=useState(0);
  const [storeInput,setStoreInput]=useState("");
  const personalTotal=todayRecs.reduce((s,r)=>s+(Number(r.amount)||0),0);
  const pTarget=Number(targets.personal)||0;
  const sTarget=Number(targets.store)||0;
  const guestTarget=Number(targets.guestCount)||0;
  const dealTarget=Number(targets.dealCount)||0;
  const targetATV=dealTarget>0&&pTarget>0?Math.ceil(pTarget/dealTarget):0;
  const targetCloseRate=guestTarget>0&&dealTarget>0?(dealTarget/guestTarget)*100:null;
  const pPct=pTarget?Math.min(Math.round((personalTotal/pTarget)*100),999):0;
  const sPct=sTarget?Math.min(Math.round((storeActual/sTarget)*100),999):0;
  return(
    <Card accent={C.gold}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"13px"}}>
        <SectionLabel label={`今日業績 · ${TODAY.slice(5).replace("-","/")} `} accent={C.gold}/>
        <button onClick={()=>setEdit(!edit)} style={{background:edit?C.dark:"transparent",border:`1px solid ${edit?C.dark:C.border}`,color:edit?"#fff":C.sub,padding:"3px 10px",borderRadius:"12px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>{edit?"完成":"設定目標"}</button>
      </div>
      {edit?(
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{fontSize:"11px",color:C.sub,width:"80px",flexShrink:0}}>今日店舖目標</div>
            <div style={{position:"relative",flex:1}}>
              <span style={{position:"absolute",left:"10px",top:"50%",transform:"translateY(-50%)",fontSize:"12px",color:C.sub}}>¥</span>
              <input type="number" value={targets.store} onChange={e=>setTargets(p=>({...p,store:Number(e.target.value)}))} style={{width:"100%",padding:"8px 10px 8px 24px",border:`1px solid ${C.border}`,borderRadius:"8px",fontFamily:"inherit",fontSize:"13px",color:C.text,background:C.bg,outline:"none",boxSizing:"border-box"}}/>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{fontSize:"11px",color:C.sub,width:"80px",flexShrink:0}}>今日上班人數</div>
            <div style={{display:"flex",alignItems:"center",gap:"8px",flex:1}}>
              <input type="number" value={targets.staffCount} onChange={e=>setTargets(p=>({...p,staffCount:Number(e.target.value)||1}))} min="1" style={{width:"60px",padding:"8px 10px",border:`1px solid ${C.border}`,borderRadius:"8px",fontFamily:"inherit",fontSize:"13px",color:C.text,background:C.bg,outline:"none",textAlign:"center"}}/>
              <span style={{fontSize:"11px",color:C.sub}}>人</span>
              {sTarget>0&&Number(targets.staffCount)>1&&(
                <div style={{flex:1,background:C.goldLight,borderRadius:"8px",padding:"6px 10px",border:`1px solid ${C.gold}`}}>
                  <div style={{fontSize:"10px",color:C.sub,marginBottom:"2px"}}>平均每人應達</div>
                  <div style={{fontSize:"13px",fontWeight:700,color:C.gold}}>{numFmt(Math.round(sTarget/Number(targets.staffCount)))}</div>
                </div>
              )}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{fontSize:"11px",color:C.sub,width:"80px",flexShrink:0}}>今日個人目標</div>
            <div style={{position:"relative",flex:1}}>
              <span style={{position:"absolute",left:"10px",top:"50%",transform:"translateY(-50%)",fontSize:"12px",color:C.sub}}>¥</span>
              <input type="number" value={targets.personal} onChange={e=>setTargets(p=>({...p,personal:Number(e.target.value)}))} style={{width:"100%",padding:"8px 10px 8px 24px",border:`1px solid ${C.border}`,borderRadius:"8px",fontFamily:"inherit",fontSize:"13px",color:C.text,background:C.bg,outline:"none",boxSizing:"border-box"}}/>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{fontSize:"11px",color:C.sub,width:"80px",flexShrink:0}}>目標接客人數</div>
            <div style={{display:"flex",alignItems:"center",gap:"8px",flex:1}}>
              <input type="number" min="0" value={targets.guestCount} onChange={e=>setTargets(p=>({...p,guestCount:e.target.value}))} placeholder="例如 30" style={{width:"100px",padding:"8px 10px",border:`1px solid ${C.border}`,borderRadius:"8px",fontFamily:"inherit",fontSize:"13px",color:C.text,background:C.bg,outline:"none",textAlign:"center"}}/>
              <span style={{fontSize:"11px",color:C.sub}}>人</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{fontSize:"11px",color:C.sub,width:"80px",flexShrink:0}}>目標成交客數</div>
            <div style={{display:"flex",alignItems:"center",gap:"8px",flex:1}}>
              <input type="number" min="0" value={targets.dealCount} onChange={e=>setTargets(p=>({...p,dealCount:e.target.value}))} placeholder="例如 10" style={{width:"100px",padding:"8px 10px",border:`1px solid ${C.border}`,borderRadius:"8px",fontFamily:"inherit",fontSize:"13px",color:C.text,background:C.bg,outline:"none",textAlign:"center"}}/>
              <span style={{fontSize:"11px",color:C.sub}}>筆</span>
            </div>
          </div>
          <div style={{background:C.goldLight,borderRadius:"10px",padding:"11px 12px",border:`1px solid ${C.gold}`}}>
            <div style={{fontSize:"10px",color:C.sub,marginBottom:"4px",letterSpacing:"0.06em"}}>自動試算｜目標平均 ATV</div>
            <div style={{fontSize:"21px",fontWeight:700,color:C.gold}}>{targetATV>0?numFmt(targetATV):"請先輸入個人目標與成交客數"}</div>
            <div style={{fontSize:"10px",color:C.sub,marginTop:"4px"}}>{targetATV>0?`${numFmt(pTarget)} ÷ ${dealTarget} 筆成交` : "個人目標金額 ÷ 目標成交客數"}</div>
            {targetCloseRate!==null&&<div style={{fontSize:"11px",color:C.text,marginTop:"7px",paddingTop:"7px",borderTop:`1px solid ${C.gold}`}}>預估成交率：<b>{targetCloseRate.toFixed(1)}%</b>（{dealTarget} ÷ {guestTarget}）</div>}
            {guestTarget>0&&dealTarget>guestTarget&&<div style={{fontSize:"10px",color:C.fail,marginTop:"5px"}}>提醒：目標成交客數高於目標接客人數，請確認設定。</div>}
          </div>
          {sTarget>0&&Number(targets.staffCount)>1&&(
            <button onClick={()=>setTargets(p=>({...p,personal:String(Math.round(sTarget/Number(p.staffCount)))}))} style={{padding:"7px",background:"transparent",border:`1px dashed ${C.gold}`,color:C.gold,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>← 自動填入（{numFmt(sTarget)} ÷ {targets.staffCount} 人 = {numFmt(Math.round(sTarget/Number(targets.staffCount)))}）</button>
          )}
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:"10px",marginTop:"2px"}}>
            <div style={{fontSize:"10px",color:C.sub,letterSpacing:"0.1em",marginBottom:"8px"}}>時薪換算設定</div>
            <div style={{display:"flex",gap:"8px"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:"10px",color:C.sub,marginBottom:"4px"}}>時薪 ¥</div>
                <input type="number" value={targets.hourlyWage} onChange={e=>setTargets(p=>({...p,hourlyWage:Number(e.target.value)}))} placeholder="1200" style={{width:"100%",padding:"8px 10px",border:`1px solid ${C.border}`,borderRadius:"8px",fontFamily:"inherit",fontSize:"13px",color:C.text,background:C.bg,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:"10px",color:C.sub,marginBottom:"4px"}}>今日班時數</div>
                <input type="number" value={targets.shiftHours} onChange={e=>setTargets(p=>({...p,shiftHours:Number(e.target.value)}))} placeholder="8" style={{width:"100%",padding:"8px 10px",border:`1px solid ${C.border}`,borderRadius:"8px",fontFamily:"inherit",fontSize:"13px",color:C.text,background:C.bg,outline:"none",boxSizing:"border-box"}}/>
              </div>
            </div>
          </div>
        </div>
      ):(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
            <GoalRing pct={sPct} color={sPct>=100?C.success:C.gold} label="店舖目標" sub={`${numFmt(storeActual)} / ${sTarget?numFmt(sTarget):"未設定"}`}/>
            <GoalRing pct={pPct} color={pPct>=100?C.success:C.pink} label="個人目標" sub={`${numFmt(personalTotal)} / ${pTarget?numFmt(pTarget):"未設定"}`}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"7px",marginBottom:"12px"}}>
            <div style={{background:C.bg,borderRadius:"9px",padding:"9px 7px",textAlign:"center"}}>
              <div style={{fontSize:"10px",color:C.sub,marginBottom:"4px"}}>目標接客</div>
              <div style={{fontSize:"17px",fontWeight:700,color:C.text}}>{guestTarget>0?`${guestTarget}人`:"—"}</div>
            </div>
            <div style={{background:C.bg,borderRadius:"9px",padding:"9px 7px",textAlign:"center"}}>
              <div style={{fontSize:"10px",color:C.sub,marginBottom:"4px"}}>目標成交</div>
              <div style={{fontSize:"17px",fontWeight:700,color:C.text}}>{dealTarget>0?`${dealTarget}筆`:"—"}</div>
            </div>
            <div style={{background:C.goldLight,borderRadius:"9px",padding:"9px 7px",textAlign:"center",border:`1px solid ${C.gold}`}}>
              <div style={{fontSize:"10px",color:C.sub,marginBottom:"4px"}}>目標 ATV</div>
              <div style={{fontSize:"17px",fontWeight:700,color:C.gold}}>{targetATV>0?numFmt(targetATV):"—"}</div>
            </div>
          </div>
          {todayRecs.filter(r=>r.amount>0).length>0&&(
            <div style={{background:C.bg,borderRadius:"8px",padding:"9px 12px",marginBottom:"10px"}}>
              {todayRecs.filter(r=>r.amount>0).map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
                  <span style={{fontSize:"11px",color:C.sub}}>{r.period} · {r.items?.[0]?.name||r.products?.split(" ")[0]||"—"}{r.item_count>1?` +${r.item_count-1}`:""}</span>
                  <span style={{fontSize:"12px",fontWeight:600,color:C.gold}}>{numFmt(r.amount)}</span>
                </div>
              ))}
              <div style={{borderTop:`1px solid ${C.border}`,marginTop:"5px",paddingTop:"5px",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:"11px",color:C.sub}}>個人小計</span>
                <span style={{fontSize:"13px",fontWeight:700,color:C.gold}}>{numFmt(personalTotal)}</span>
              </div>
            </div>
          )}
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:"10px"}}>
            <div style={{fontSize:"10px",color:C.sub,letterSpacing:"0.08em",marginBottom:"6px"}}>輸入今日店舖總業績</div>
            <div style={{display:"flex",gap:"6px"}}>
              <div style={{position:"relative",flex:1}}>
                <span style={{position:"absolute",left:"9px",top:"50%",transform:"translateY(-50%)",fontSize:"12px",color:C.sub}}>¥</span>
                <input type="number" value={storeInput} onChange={e=>setStoreInput(e.target.value)} placeholder="0" style={{width:"100%",padding:"8px 8px 8px 22px",border:`1px solid ${C.border}`,borderRadius:"8px",fontFamily:"inherit",fontSize:"13px",color:C.text,background:C.bg,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <button onClick={()=>{const v=Number(storeInput);if(v){setStoreActual(v);setStoreInput("");}}} style={{padding:"8px 14px",background:C.dark,border:"none",color:C.gold,borderRadius:"8px",fontSize:"12px",cursor:"pointer",flexShrink:0}}>更新</button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

// ── PERFORMANCE CARD ──────────────────────────────────────────────────────────
function PerformanceCard({records}){
  const todayRecs=records.filter(r=>r.date===TODAY);
  const total=todayRecs.length;
  const success=todayRecs.filter(r=>r.result==="success");
  const rate=total?(success.length/total)*100:null;
  const avgUnit=success.filter(r=>r.item_count>0).length?success.reduce((s,r)=>s+(r.item_count||1),0)/success.filter(r=>r.item_count>0).length:null;
  const avgOrder=success.filter(r=>r.amount>0).length?success.reduce((s,r)=>s+(Number(r.amount)||0),0)/success.filter(r=>r.amount>0).length:null;
  const past=records.filter(r=>r.date!==TODAY);
  const pastS=past.filter(r=>r.result==="success");
  const pastRate=past.length?(pastS.length/past.length)*100:null;
  const pastAvgOrder=pastS.filter(r=>r.amount>0).length?pastS.reduce((s,r)=>s+(Number(r.amount)||0),0)/pastS.filter(r=>r.amount>0).length:null;
  const pastAvgUnit=pastS.filter(r=>r.item_count>0).length?pastS.reduce((s,r)=>s+(r.item_count||1),0)/pastS.filter(r=>r.item_count>0).length:null;
  const sR=rate===null?null:rate>=70?{score:5,label:"非常強",color:C.success,comment:"10人裡7人以上成交，頂尖水準"}:rate>=50?{score:4,label:"很不錯",color:C.success,comment:"每兩個客人就成交一個以上"}:rate>=35?{score:3,label:"普通",color:C.gold,comment:"有進步空間，繼續累積話術"}:rate>=20?{score:2,label:"偏低",color:"#c09040",comment:"嘗試更早建立對話"}:{score:1,label:"今天難",color:C.fail,comment:"客流或客型影響，別太在意單日"};
  const sU=avgUnit===null?null:avgUnit>=2.5?{score:5,label:"連帶很強",color:C.success,comment:"平均每個客人買超過2.5件"}:avgUnit>=2.0?{score:4,label:"不錯",color:C.success,comment:"套裝思維有在發揮"}:avgUnit>=1.5?{score:3,label:"普通",color:C.gold,comment:"試著在試穿後多推一件"}:{score:2,label:"單件為主",color:"#c09040",comment:"多說完整造型搭配"};
  const sO=avgOrder===null?null:avgOrder>=15000?{score:5,label:"客單很高",color:C.success,comment:"高單價或多件連帶做得好"}:avgOrder>=8000?{score:4,label:"不錯",color:C.success,comment:"高於一般平均水準"}:avgOrder>=4000?{score:3,label:"普通",color:C.gold,comment:"試著往高單價商品推薦"}:{score:2,label:"偏低",color:"#c09040",comment:"注意商品組合的客單設計"};
  const Stars=({score,color})=><div style={{display:"flex",gap:"2px"}}>{[1,2,3,4,5].map(i=><div key={i} style={{fontSize:"14px",color:i<=score?color:C.border,lineHeight:1}}>★</div>)}</div>;
  const Diff=({now,past,fmt})=>{if(now===null||past===null)return null;const d=now-past,up=d>=0;return <span style={{fontSize:"10px",color:up?C.success:C.fail,marginLeft:"4px"}}>{up?"▲":"▼"} {fmt(Math.abs(d))} vs 過去</span>;};
  if(total===0)return <Card><SectionLabel label="今日個人表現" accent={C.gold}/><div style={{textAlign:"center",padding:"16px 0",color:C.sub,fontSize:"13px"}}>今天還沒有記錄</div></Card>;
  return(
    <Card accent={C.gold}>
      <SectionLabel label="今日個人表現" accent={C.gold}/>
      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
        {[
          {label:"成交率",val:rate!==null?`${rate.toFixed(0)}%`:"—",sub:`${success.length} 成交 / ${total} 接客`,sc:sR,diff:<Diff now={rate} past={pastRate} fmt={v=>`${v.toFixed(0)}%`}/>},
          {label:"平均客單價",val:avgOrder!==null?numFmt(Math.round(avgOrder)):"—",sub:`${success.length} 筆成交`,sc:sO,diff:<Diff now={avgOrder} past={pastAvgOrder} fmt={v=>numFmt(Math.round(v))}/>},
          {label:"平均連帶件數",val:avgUnit!==null?`${avgUnit.toFixed(1)} 件`:"—",sub:"每筆成交平均",sc:sU,diff:<Diff now={avgUnit} past={pastAvgUnit} fmt={v=>`${v.toFixed(1)}件`}/>},
        ].map(({label,val,sub,sc,diff})=>(
          <div key={label} style={{background:C.bg,borderRadius:"10px",padding:"12px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
              <div>
                <div style={{fontSize:"11px",color:C.sub,marginBottom:"3px"}}>{label}</div>
                <div style={{fontSize:"26px",fontWeight:700,color:sc?.color||C.text,lineHeight:1}}>{val}</div>
                <div style={{fontSize:"11px",color:C.sub,marginTop:"3px"}}>{sub}{diff}</div>
              </div>
              <div style={{textAlign:"right"}}>
                {sc&&<Stars score={sc.score} color={sc.color}/>}
                {sc&&<div style={{fontSize:"11px",fontWeight:700,color:sc.color,marginTop:"4px"}}>{sc.label}</div>}
              </div>
            </div>
            {sc&&<div style={{fontSize:"11px",color:C.sub,background:"white",borderRadius:"6px",padding:"6px 9px"}}>{sc.comment}</div>}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── TODAY SUMMARY ─────────────────────────────────────────────────────────────
function TodaySummary({todayRecs}){
  const total=todayRecs.length;
  const success=todayRecs.filter(r=>r.result==="success");
  const fail=todayRecs.filter(r=>r.result==="fail");
  const rate=total?Math.round((success.length/total)*100):0;
  const soldItems=success.filter(r=>r.item_count>0);
  const avgItems=soldItems.length?(soldItems.reduce((s,r)=>s+(r.item_count||1),0)/soldItems.length).toFixed(1):"—";
  const upsells=success.filter(r=>r.item_count>=2).length;
  if(total===0)return <Card><SectionLabel label="今日接客總覽" accent={C.purple}/><div style={{textAlign:"center",padding:"20px 0",color:C.sub,fontSize:"13px"}}>今天還沒有記錄</div></Card>;
  return(
    <Card accent={C.purple}>
      <SectionLabel label="今日接客總覽" accent={C.purple}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"6px",marginBottom:"12px"}}>
        {[["接客",total,C.sub],["成交",success.length,C.success],["未成",fail.length,C.fail],["成交率",`${rate}%`,C.purple]].map(([l,v,c])=>(
          <div key={l} style={{background:C.bg,borderRadius:"8px",padding:"9px 4px",textAlign:"center"}}>
            <div style={{fontSize:"18px",fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:"9px",color:C.sub,marginTop:"1px",letterSpacing:"0.06em"}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#f5f0fa",borderRadius:"8px",padding:"10px 12px",marginBottom:"10px",borderLeft:`3px solid ${C.purple}`}}>
        <div style={{fontSize:"10px",color:C.purple,letterSpacing:"0.1em",marginBottom:"6px"}}>客單價 · 連帶銷售</div>
        <div style={{display:"flex",gap:"16px"}}>
          <div><div style={{fontSize:"18px",fontWeight:700,color:C.purple}}>{avgItems}</div><div style={{fontSize:"9px",color:C.sub}}>平均件數</div></div>
          <div><div style={{fontSize:"18px",fontWeight:700,color:C.purple}}>{upsells}</div><div style={{fontSize:"9px",color:C.sub}}>連帶成交</div></div>
          <div><div style={{fontSize:"18px",fontWeight:700,color:C.gold}}>{success.length?numFmt(Math.round(success.reduce((s,r)=>s+(Number(r.amount)||0),0)/success.length)):"—"}</div><div style={{fontSize:"9px",color:C.sub}}>平均客單</div></div>
        </div>
      </div>
      {success.length>0&&<div style={{marginBottom:"10px"}}>
        <div style={{fontSize:"10px",color:C.success,letterSpacing:"0.1em",marginBottom:"7px"}}>✔ 成交 {success.length} 筆</div>
        {success.map((r,i)=>(
          <div key={i} style={{background:"#f0f8f2",borderRadius:"8px",padding:"9px 11px",marginBottom:"6px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{fontSize:"11px",color:C.sub}}>{r.period} · {r.language}</span><span style={{fontSize:"12px",fontWeight:600,color:C.gold}}>{numFmt(r.amount)}</span></div>
            {r.buy_reason&&(Array.isArray(r.buy_reason)?r.buy_reason.length>0:true)&&<div style={{fontSize:"11px",color:C.success,marginBottom:"2px"}}>原因：{Array.isArray(r.buy_reason)?r.buy_reason.join("、"):r.buy_reason}</div>}
            {r.key_sentence&&<div style={{fontSize:"12px",color:C.text,fontStyle:"italic",lineHeight:"1.5"}}>「{r.key_sentence}」</div>}
            {r.item_count>1&&<div style={{fontSize:"10px",color:C.purple,marginTop:"3px"}}>連帶 {r.item_count} 件 🛍</div>}
          </div>
        ))}
      </div>}
      {fail.length>0&&<div>
        <div style={{fontSize:"10px",color:C.fail,letterSpacing:"0.1em",marginBottom:"7px"}}>✘ 未成交 {fail.length} 筆</div>
        {fail.map((r,i)=>(
          <div key={i} style={{background:"#fdf0ee",borderRadius:"8px",padding:"9px 11px",marginBottom:"6px"}}>
            <div style={{fontSize:"11px",color:C.sub,marginBottom:"3px"}}>{r.period} · {r.customer_type}型 · {r.language}</div>
            {r.no_buy_reason&&(Array.isArray(r.no_buy_reason)?r.no_buy_reason.length>0:true)&&<div style={{fontSize:"11px",color:C.fail,marginBottom:"2px"}}>原因：{Array.isArray(r.no_buy_reason)?r.no_buy_reason.join("、"):r.no_buy_reason}</div>}
            {r.redo&&<div style={{fontSize:"12px",color:C.text,lineHeight:"1.5"}}>重來：{r.redo}</div>}
          </div>
        ))}
      </div>}
    </Card>
  );
}

// ── TOMORROW TASKS ────────────────────────────────────────────────────────────
function TomorrowTasks(){
  const [data,setData]=useState(INIT_TASKS);
  const [editMode,setEditMode]=useState(false);
  const toggle=i=>setData(p=>({...p,done:p.done.map((d,j)=>j===i?!d:d)}));
  const setTask=(i,v)=>setData(p=>({...p,tasks:p.tasks.map((t,j)=>j===i?v:t)}));
  return(
    <Card accent={C.gold}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"13px"}}>
        <SectionLabel label="給明天的三項任務" accent={C.gold}/>
        <button onClick={()=>setEditMode(!editMode)} style={{background:editMode?C.dark:"transparent",border:`1px solid ${editMode?C.dark:C.border}`,color:editMode?"#fff":C.sub,padding:"3px 10px",borderRadius:"12px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>{editMode?"完成":"編輯"}</button>
      </div>
      {data.tasks.map((task,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}}>
          <div onClick={()=>!editMode&&toggle(i)} style={{width:"20px",height:"20px",borderRadius:"50%",flexShrink:0,cursor:"pointer",border:`2px solid ${data.done[i]?C.gold:C.border}`,background:data.done[i]?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {data.done[i]&&<span style={{fontSize:"11px",color:"white"}}>✓</span>}
          </div>
          {editMode?<input value={task} onChange={e=>setTask(i,e.target.value)} placeholder={["明天要嘗試的話術…","想改善的接客環節…","要觀察的事…"][i]} style={{flex:1,padding:"7px 10px",border:`1px solid ${C.border}`,borderRadius:"8px",fontFamily:"inherit",fontSize:"13px",color:C.text,background:C.bg,outline:"none"}}/>:<div style={{flex:1,fontSize:"13px",color:data.done[i]?C.sub:C.text,textDecoration:data.done[i]?"line-through":"none",lineHeight:"1.5"}}>{task||<span style={{color:C.border}}>{["明天要嘗試的話術…","想改善的接客環節…","要觀察的事…"][i]}</span>}</div>}
          <div style={{fontSize:"11px",color:C.gold,fontWeight:700,width:"16px",textAlign:"center",flexShrink:0}}>{i+1}</div>
        </div>
      ))}
    </Card>
  );
}

// ── WARDROBE DB ───────────────────────────────────────────────────────────────
function WardrobeDB({records}){
  const [items,setItems]=useState(INIT_WARDROBE);
  const [adding,setAdding]=useState(false);
  const [newItem,setNewItem]=useState({name:"",category:"外套",pairsWith:""});
  const [selected,setSelected]=useState(null);
  const fileRefs=useRef({});
  const soldMap={};
  records.filter(r=>r.result==="success").forEach(r=>{(r.items||[]).forEach(item=>{soldMap[item.name]=(soldMap[item.name]||0)+1;});});
  const handleImg=(id,e)=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>setItems(p=>p.map(item=>item.id===id?{...item,imgUrl:ev.target.result}:item));reader.readAsDataURL(file);};
  const addItem=()=>{if(!newItem.name)return;setItems(p=>[...p,{id:Date.now(),name:newItem.name,category:newItem.category,soldCount:0,pairsWith:newItem.pairsWith.split("、").filter(Boolean),imgColor:"#e8e4dc",imgEmoji:"👔",imgUrl:null}]);setNewItem({name:"",category:"外套",pairsWith:""});setAdding(false);};
  const CATS=["全部","外套","上衣","下身","洋裝","配件"];
  const [catFilter,setCatFilter]=useState("全部");
  const filtered=catFilter==="全部"?items:items.filter(i=>i.category===catFilter);
  const sorted=[...filtered].sort((a,b)=>(soldMap[b.name]||b.soldCount)-(soldMap[a.name]||a.soldCount));
  return(
    <div>
      <div style={{display:"flex",gap:"6px",marginBottom:"12px",overflowX:"auto",paddingBottom:"4px"}}>
        {CATS.map(c=><button key={c} onClick={()=>setCatFilter(c)} style={{padding:"5px 12px",border:`1.5px solid ${catFilter===c?C.dark:C.border}`,background:catFilter===c?C.dark:"transparent",color:catFilter===c?"#fff":C.sub,borderRadius:"20px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{c}</button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"10px"}}>
        {sorted.map(item=>{
          const realSold=soldMap[item.name]||item.soldCount;
          return(
            <div key={item.id} onClick={()=>setSelected(selected===item.id?null:item.id)} style={{background:C.card,borderRadius:"12px",overflow:"hidden",border:`1px solid ${selected===item.id?C.gold:C.border}`,cursor:"pointer"}}>
              <div onClick={e=>{e.stopPropagation();fileRefs.current[item.id]?.click();}} style={{height:"90px",background:item.imgUrl?"transparent":item.imgColor,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                {item.imgUrl?<img src={item.imgUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{textAlign:"center"}}><div style={{fontSize:"32px"}}>{item.imgEmoji}</div><div style={{fontSize:"9px",color:"rgba(0,0,0,0.3)",marginTop:"2px"}}>點擊加圖</div></div>}
                <input ref={el=>fileRefs.current[item.id]=el} type="file" accept="image/*" onChange={e=>handleImg(item.id,e)} style={{display:"none"}}/>
                <div style={{position:"absolute",top:"6px",right:"6px",background:realSold>0?"rgba(90,144,96,0.9)":"rgba(0,0,0,0.3)",color:"white",fontSize:"10px",padding:"2px 7px",borderRadius:"10px",fontWeight:600}}>{realSold}次</div>
              </div>
              <div style={{padding:"8px 10px"}}><div style={{fontSize:"12px",fontWeight:600,color:C.text,marginBottom:"3px"}}>{item.name}</div><div style={{fontSize:"10px",color:C.sub}}>{item.category}</div></div>
              {selected===item.id&&item.pairsWith?.length>0&&<div style={{padding:"0 10px 10px",borderTop:`1px solid ${C.border}`}}><div style={{fontSize:"10px",color:C.gold,letterSpacing:"0.08em",margin:"8px 0 5px"}}>常見搭配</div><div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>{item.pairsWith.map(p=><span key={p} style={{fontSize:"10px",padding:"2px 8px",background:C.goldLight,borderRadius:"10px",color:"#8a6830"}}>{p}</span>)}</div></div>}
            </div>
          );
        })}
        <div onClick={()=>setAdding(true)} style={{background:C.bg,borderRadius:"12px",border:`1.5px dashed ${C.border}`,height:"150px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:"6px"}}>
          <div style={{fontSize:"24px",color:C.border}}>＋</div>
          <div style={{fontSize:"11px",color:C.sub}}>新增商品</div>
        </div>
      </div>
      {adding&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:100}} onClick={()=>setAdding(false)}><div style={{background:C.card,borderRadius:"20px 20px 0 0",padding:"20px",width:"100%",boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}><div style={{fontSize:"14px",fontWeight:700,color:C.text,marginBottom:"14px"}}>新增商品</div><Fld label="商品名稱"><Inp value={newItem.name} onChange={v=>setNewItem(p=>({...p,name:v}))} placeholder="例：米色針織外套"/></Fld><Fld label="類別"><TagGroup options={["外套","上衣","下身","洋裝","配件"]} value={newItem.category} onChange={v=>setNewItem(p=>({...p,category:v}))}/></Fld><Fld label="常見搭配" hint="用、分隔"><Inp value={newItem.pairsWith} onChange={v=>setNewItem(p=>({...p,pairsWith:v}))} placeholder="例：高腰寬褲、格紋長裙"/></Fld><div style={{display:"flex",gap:"8px"}}><button onClick={()=>setAdding(false)} style={{flex:1,padding:"12px",background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:"12px",cursor:"pointer",fontFamily:"inherit"}}>取消</button><button onClick={addItem} style={{flex:2,padding:"12px",background:C.dark,border:"none",color:"#f5ead8",borderRadius:"12px",cursor:"pointer",fontFamily:"inherit"}}>新增</button></div></div></div>}
    </div>
  );
}

// ── RECORD FORM ───────────────────────────────────────────────────────────────
const emptyRec=(profile={})=>({id:Date.now(),date:TODAY,period:"",weather:profile.weather?({"晴":"☀️ 晴","陰天":"⛅ 多雲","下雨":"🌧️ 雨"}[profile.weather]||""):"",temp:profile.lowTemp!==""&&profile.highTemp!==""?`${profile.lowTemp}°C～${profile.highTemp}°C`:"",flow:"",self_state:({"還好":"😐 普通","很累":"😴 疲憊","有幹勁":"✨ 飽滿"}[profile.status]||""),sell_desire:"",gender:"",age:"",language:"",style:[],customer_type:"",mood:"",companion:"",opening_line:"",built_rapport:false,items:[{name:"",price:""}],products:"",reasons:[],outfit_complete:false,reaction:"",tryon:"",result:"",amount:"",buy_reason:[],key_sentence:"",no_buy_reason:[],redo:"",memo:"",first_approach:"",first_reaction:"",second_approach:"",second_approach_line:"",second_reaction:"",followup_approach:"",followup_reaction:""});

function RecordForm({initial,onSave,onCancel,records,dailyProfile}){
  const [r,setR]=useState(()=>{
    const base=initial||emptyRec(dailyProfile);
    return {...base,buy_reason:Array.isArray(base.buy_reason)?base.buy_reason:(base.buy_reason?[base.buy_reason]:[]),no_buy_reason:Array.isArray(base.no_buy_reason)?base.no_buy_reason:(base.no_buy_reason?[base.no_buy_reason]:[])};
  });
  const set=k=>v=>setR(p=>({...p,[k]:v}));
  const setItem=(i,k,v)=>setR(p=>{const items=[...p.items];items[i]={...items[i],[k]:v};return{...p,items};});
  const addItem=()=>setR(p=>({...p,items:[...p.items,{name:"",price:""}]}));
  const removeItem=i=>setR(p=>({...p,items:p.items.filter((_,j)=>j!==i)}));
  const calcTotal=()=>{const total=r.items.reduce((s,item)=>s+(Number(item.price)||0),0);if(total>0)setR(p=>({...p,amount:total}));};
  const itemCount=r.items.filter(i=>i.name).length;
  const sameTypeSuccess=records.filter(rec=>rec.customer_type===r.customer_type&&rec.result==="success"&&rec.key_sentence);
  const hintPhrase=sameTypeSuccess[sameTypeSuccess.length-1];
  const Sec=({title,accent=C.gold,children})=><div style={{background:C.card,borderRadius:"14px",padding:"15px 16px",marginBottom:"10px",border:`1px solid ${C.border}`}}><SectionLabel label={title} accent={accent}/>{children}</div>;
  return(
    <div style={{paddingBottom:"40px"}}>
      <div style={{background:C.dark,borderRadius:"14px",padding:"12px 16px",marginBottom:"10px",borderLeft:`3px solid ${C.gold}`}}>
        <div style={{fontSize:"11px",color:C.gold,letterSpacing:"0.1em",marginBottom:"3px"}}>套裝思維提醒</div>
        <div style={{fontSize:"12px",color:"#c0b8a4",lineHeight:"1.7"}}>不是賣一件——怎樣讓他自然多買一件？<br/>人是在買「理想中的自己」</div>
      </div>
      <Sec title="環境 · 店況">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"10px"}}>
          <Fld label="日期"><input type="date" value={r.date} onChange={e=>set("date")(e.target.value)} style={{width:"100%",padding:"8px 10px",border:`1px solid ${C.border}`,borderRadius:"8px",fontFamily:"inherit",fontSize:"13px",background:C.bg,boxSizing:"border-box",outline:"none"}}/></Fld>
          <Fld label="氣溫"><Inp value={r.temp} onChange={set("temp")} placeholder="22°C"/></Fld>
        </div>
        <Fld label="時段"><TagGroup options={["早班","午班","晚班"]} value={r.period} onChange={set("period")}/></Fld>
        <Fld label="天氣"><TagGroup options={["☀️ 晴","⛅ 多雲","🌧️ 雨","❄️ 寒流"]} value={r.weather} onChange={set("weather")}/></Fld>
        <Fld label="客流"><TagGroup options={["多","普通","少"]} value={r.flow} onChange={set("flow")}/></Fld>
      </Sec>
      <Sec title="自我狀態" accent={C.purple}>
        <Fld label="今日精神"><TagGroup options={["✨ 飽滿","😐 普通","😴 疲憊","😤 壓力大"]} value={r.self_state} onChange={set("self_state")} color={C.purple}/></Fld>
        <Fld label="想賣的慾望"><TagGroup options={["🔥 強烈","普通","今天不想推"]} value={r.sell_desire} onChange={set("sell_desire")} color={C.purple}/></Fld>
      </Sec>
      <Sec title="客人觀察" accent={C.success}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"10px"}}>
          <Fld label="性別"><TagGroup options={["女性","男性"]} value={r.gender} onChange={set("gender")} color={C.success}/></Fld>
          <Fld label="語言"><TagGroup options={["日文","中文","英文"]} value={r.language} onChange={set("language")} color={C.success}/></Fld>
        </div>
        <Fld label="年齡"><TagGroup options={["10代","20代前","20代後","30代","40代","50代+"]} value={r.age} onChange={set("age")}/></Fld>
        <Fld label="風格（可多選）"><TagGroup options={["休閒","韓系","OL","高級感","街頭","自然系"]} value={r.style} onChange={set("style")} multi/></Fld>
        <Fld label="客人類型"><TagGroup options={["A⚡快速決策","B🤔猶豫型","C🛡️防備型","D👀閒逛型"]} value={r.customer_type} onChange={set("customer_type")} color={C.gold}/></Fld>
        <Fld label="情緒"><TagGroup options={["開放","冷淡","防備","有壓力"]} value={r.mood} onChange={set("mood")}/></Fld>
        {r.customer_type&&hintPhrase&&<div style={{background:"#fdf8ec",border:`1px solid ${C.goldLight}`,borderRadius:"8px",padding:"9px 11px",marginTop:"4px"}}><div style={{fontSize:"9px",color:C.gold,letterSpacing:"0.1em",marginBottom:"4px"}}>上次同類型客人成交話術</div><div style={{fontSize:"12px",color:C.text,fontStyle:"italic"}}>「{hintPhrase.key_sentence}」</div></div>}
      </Sec>
      <Sec title="接近過程 · 話術" accent={C.gold}>
        <div style={{background:"#fbf7ee",borderRadius:"8px",padding:"9px 11px",marginBottom:"12px",fontSize:"11px",color:C.sub,lineHeight:"1.6"}}>記錄每次接近時你做了什麼，以及客人如何回應。不需要每個階段都發生，沒有第二次接近就留白即可。</div>
        <div style={{borderLeft:`3px solid ${C.gold}`,paddingLeft:"10px",marginBottom:"12px"}}>
          <div style={{fontSize:"12px",fontWeight:700,color:C.gold,marginBottom:"8px"}}>① 第一次接近</div>
          <Fld label="接近方式"><TagGroup options={["主動問候","商品介紹","穿搭稱讚","詢問需求","提供協助","其他"]} value={r.first_approach||""} onChange={set("first_approach")}/></Fld>
          <Fld label="實際說了什麼"><Inp value={r.opening_line} onChange={set("opening_line")} placeholder='例：「今天是想找上班穿的款式嗎？」' multi/></Fld>
          <Fld label="客人第一次反應"><TagGroup options={["積極回應","普通回應","簡短回應","沒有興趣","拒絕交流"]} value={r.first_reaction||""} onChange={set("first_reaction")}/></Fld>
        </div>
        <div style={{borderLeft:`3px solid ${C.purple}`,paddingLeft:"10px",marginBottom:"12px"}}>
          <div style={{fontSize:"12px",fontWeight:700,color:C.purple,marginBottom:"8px"}}>② 第二次接近（選填）</div>
          <Fld label="再次接近方式"><TagGroup options={["補充商品資訊","提供其他款式","分享穿搭建議","詢問需求","邀請試穿","等待客人主動","其他"]} value={r.second_approach||""} onChange={set("second_approach")}/></Fld>
          <Fld label="實際說了什麼"><Inp value={r.second_approach_line||""} onChange={set("second_approach_line")} placeholder="第二次接近時實際說的話…" multi/></Fld>
          <Fld label="客人第二次反應"><TagGroup options={["開始交流","願意聽介紹","願意試穿","仍然冷淡","拒絕交流"]} value={r.second_reaction||""} onChange={set("second_reaction")}/></Fld>
        </div>
        <div style={{borderLeft:`3px solid ${C.success}`,paddingLeft:"10px",marginBottom:"10px"}}>
          <div style={{fontSize:"12px",fontWeight:700,color:C.success,marginBottom:"8px"}}>③ 後續提案（選填）</div>
          <Fld label="後續做了什麼"><TagGroup options={["補充商品特色","提供搭配建議","推薦替代款","邀請試穿","說明使用場景","連帶推薦"]} value={r.followup_approach||""} onChange={set("followup_approach")}/></Fld>
          <Fld label="客人後續反應"><TagGroup options={["願意試穿","主動詢問","開始比較","有購買意願","興趣下降","沒有變化"]} value={r.followup_reaction||""} onChange={set("followup_reaction")}/></Fld>
        </div>
        <Tog label="有成功建立對話" value={r.built_rapport} onChange={set("built_rapport")}/>
      </Sec>
      <Sec title="推薦商品 · 連帶銷售" accent={C.purple}>
        <div style={{fontSize:"11px",color:C.purple,marginBottom:"10px",background:"#f5f0fa",padding:"8px 10px",borderRadius:"8px"}}>💡 套裝思維：每件都填，系統自動計算客單價</div>
        {r.items.map((item,i)=>(
          <div key={i} style={{display:"flex",gap:"6px",marginBottom:"8px",alignItems:"center"}}>
            <div style={{width:"18px",height:"18px",borderRadius:"50%",background:C.purple,color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:700,flexShrink:0}}>{i+1}</div>
            <input value={item.name} onChange={e=>setItem(i,"name",e.target.value)} placeholder={`商品 ${i+1}`} style={{flex:2,padding:"8px 10px",border:`1px solid ${C.border}`,borderRadius:"8px",fontFamily:"inherit",fontSize:"13px",color:C.text,background:C.bg,outline:"none"}}/>
            <div style={{position:"relative",flex:1}}>
              <span style={{position:"absolute",left:"8px",top:"50%",transform:"translateY(-50%)",fontSize:"11px",color:C.sub}}>¥</span>
              <input type="number" value={item.price} onChange={e=>setItem(i,"price",e.target.value)} placeholder="0" style={{width:"100%",padding:"8px 6px 8px 20px",border:`1px solid ${C.border}`,borderRadius:"8px",fontFamily:"inherit",fontSize:"13px",color:C.text,background:C.bg,outline:"none",boxSizing:"border-box"}}/>
            </div>
            {r.items.length>1&&<button onClick={()=>removeItem(i)} style={{background:"transparent",border:"none",color:C.sub,cursor:"pointer",fontSize:"16px",padding:"0 2px"}}>×</button>}
          </div>
        ))}
        <div style={{display:"flex",gap:"8px",marginTop:"4px"}}>
          <button onClick={addItem} style={{flex:1,padding:"8px",background:"transparent",border:`1.5px dashed ${C.border}`,color:C.sub,borderRadius:"8px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>＋ 再加一件</button>
          <button onClick={calcTotal} style={{flex:1,padding:"8px",background:C.goldLight,border:`1px solid ${C.gold}`,color:"#8a6830",borderRadius:"8px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>自動加總</button>
        </div>
        <Tog label="有給出完整造型搭配" value={r.outfit_complete} onChange={set("outfit_complete")} accent={C.purple}/>
      </Sec>
      <Sec title="結果分析" accent={C.fail}>
        <Fld label="結果">
          <div style={{display:"flex",gap:"8px"}}>
            {[["success","✔ 成交","#5a9060"],["fail","✘ 未成交",C.fail]].map(([v,l,c])=>(
              <Tag key={v} label={l} active={r.result===v} onClick={()=>set("result")(r.result===v?"":v)} color={c}/>
            ))}
          </div>
        </Fld>
        {r.result==="success"&&<>
          <div style={{background:"#f0f8f2",border:"1px solid #b8ddc0",borderRadius:"10px",padding:"12px 14px",marginBottom:"12px"}}>
            <div style={{fontSize:"10px",color:C.success,letterSpacing:"0.12em",marginBottom:"5px"}}>成交金額</div>
            <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
              <span style={{fontSize:"18px",fontWeight:700,color:C.success}}>¥</span>
              <input type="number" value={r.amount} onChange={e=>set("amount")(e.target.value)} placeholder="0" style={{flex:1,border:"none",background:"transparent",fontFamily:"inherit",fontSize:"20px",fontWeight:700,color:C.success,outline:"none"}}/>
            </div>
            {itemCount>0&&<div style={{fontSize:"10px",color:"#8aba98",marginTop:"3px"}}>共 {itemCount} 件 · 已自動加入今日業績</div>}
          </div>
          <Fld label="為什麼會買？（可複選）"><TagGroup options={["商品設計／款式吸引","價格合適","我的推薦或提案","穿搭／整體造型吸引","使用場景或需求符合","試穿後覺得適合","自我形象認同","衝動購買","其他"]} value={r.buy_reason} onChange={set("buy_reason")} color={C.success} multi/></Fld>
          <Fld label="哪一句話起了關鍵作用"><Inp value={r.key_sentence} onChange={set("key_sentence")} placeholder="還原實際說的話——這是最珍貴的話術" multi/></Fld>
        </>}
        {r.result==="fail"&&<>
          <Fld label="客人為什麼沒買？（可複選）"><TagGroup options={["價格考量","時機不對／暫時不需要","想再考慮","想比較其他品牌或商品","沒找到合適的商品","尺寸／顏色／庫存問題","對商品興趣不足","尚未建立信任","其他"]} value={r.no_buy_reason} onChange={set("no_buy_reason")} color={C.fail} multi/></Fld>
          <Fld label="如果重來，我會怎麼說"><Inp value={r.redo} onChange={set("redo")} placeholder="下次遇到同類客人，我會這樣說…" multi/></Fld>
        </>}
        <Fld label="備忘 / 心得"><Inp value={r.memo} onChange={set("memo")} placeholder="今天印象最深的一個發現…" multi/></Fld>
      </Sec>
      <div style={{display:"flex",gap:"8px"}}>
        <button onClick={onCancel} style={{flex:1,padding:"13px",background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:"12px",cursor:"pointer",fontFamily:"inherit",fontSize:"13px"}}>取消</button>
        <button onClick={()=>onSave({...r,item_count:itemCount})} style={{flex:2,padding:"13px",background:C.dark,border:"none",color:"#f5ead8",borderRadius:"12px",cursor:"pointer",fontFamily:"inherit",fontSize:"13px",letterSpacing:"0.08em"}}>{initial?"更新記錄":"儲存記錄"}</button>
      </div>
    </div>
  );
}

// ── RECORD CARD ───────────────────────────────────────────────────────────────
function RecordCard({r,onEdit,onDelete}){
  const [open,setOpen]=useState(false);
  const [confirmDel,setConfirmDel]=useState(false);
  const isS=r.result==="success";
  return(
    <div style={{background:C.card,borderRadius:"14px",marginBottom:"8px",border:`1px solid ${C.border}`,overflow:"hidden"}}>
      <div onClick={()=>setOpen(!open)} style={{padding:"13px 15px",cursor:"pointer",display:"flex",gap:"12px",alignItems:"center"}}>
        <div style={{background:C.dark,color:C.gold,padding:"6px 10px",textAlign:"center",borderRadius:"8px",flexShrink:0,minWidth:"40px"}}>
          <div style={{fontSize:"16px",fontWeight:700,lineHeight:1}}>{r.date?.split("-")[2]}</div>
          <div style={{fontSize:"8px",letterSpacing:"0.1em",marginTop:"1px"}}>{MONTHS[parseInt(r.date?.split("-")[1])-1]}</div>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:"13px",fontWeight:600,color:C.text}}>{r.period} · {r.language}</div>
          <div style={{fontSize:"11px",color:C.sub,marginTop:"2px"}}>{r.weather} {r.temp} · {r.style?.join("·")||"—"}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:"12px",fontWeight:700,color:isS?C.success:C.fail}}>{isS?"✔ 成交":"✘ 未成"}</div>
          {r.amount>0&&<div style={{fontSize:"11px",color:C.gold,marginTop:"1px"}}>{numFmt(r.amount)}{r.item_count>1?` · ${r.item_count}件`:""}</div>}
        </div>
      </div>
      {open&&(
        <div style={{padding:"0 15px 14px",borderTop:`1px solid ${C.border}`}}>
          {r.customer_type&&<div style={{marginTop:"9px",marginBottom:"7px"}}>
            <span style={{fontSize:"10px",padding:"2px 8px",background:C.goldLight,borderRadius:"10px",color:"#8a6830"}}>{r.customer_type}型</span>
            {r.item_count>=2&&<span style={{fontSize:"10px",padding:"2px 8px",background:"#f5f0fa",borderRadius:"10px",color:C.purple,marginLeft:"5px"}}>連帶 {r.item_count} 件</span>}
          </div>}
          {r.items?.filter(i=>i.name).length>0&&<div style={{marginBottom:"8px"}}>{r.items.filter(i=>i.name).map((item,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:"12px",color:C.sub,marginBottom:"2px"}}><span>{item.name}</span>{item.price&&<span style={{color:C.gold}}>¥{Number(item.price).toLocaleString()}</span>}</div>)}</div>}
          {(r.opening_line||r.first_approach||r.second_approach_line||r.followup_approach)&&<div style={{borderLeft:`3px solid ${C.gold}`,paddingLeft:"10px",marginBottom:"8px"}}>
            <div style={{fontSize:"10px",color:C.gold,marginBottom:"4px"}}>接近過程</div>
            {r.first_approach&&<div style={{fontSize:"11px",color:C.sub}}>第一次：{r.first_approach}{r.first_reaction?` → ${r.first_reaction}`:""}</div>}
            {r.opening_line&&<div style={{fontSize:"12px",color:C.text,fontStyle:"italic",margin:"2px 0 5px"}}>「{r.opening_line}」</div>}
            {r.second_approach&&<div style={{fontSize:"11px",color:C.sub}}>第二次：{r.second_approach}{r.second_reaction?` → ${r.second_reaction}`:""}</div>}
            {r.second_approach_line&&<div style={{fontSize:"12px",color:C.text,fontStyle:"italic",margin:"2px 0 5px"}}>「{r.second_approach_line}」</div>}
            {r.followup_approach&&<div style={{fontSize:"11px",color:C.sub}}>後續提案：{Array.isArray(r.followup_approach)?r.followup_approach.join("、"):r.followup_approach}{r.followup_reaction?` → ${r.followup_reaction}`:""}</div>}
          </div>}
          {isS&&r.key_sentence&&<div style={{borderLeft:`3px solid ${C.success}`,paddingLeft:"10px",marginBottom:"8px"}}><div style={{fontSize:"10px",color:C.sub,marginBottom:"2px"}}>關鍵話術</div><div style={{fontSize:"12.5px",color:C.text,fontStyle:"italic",lineHeight:"1.5"}}>「{r.key_sentence}」</div></div>}
          {!isS&&r.redo&&<div style={{borderLeft:`3px solid ${C.fail}`,paddingLeft:"10px",marginBottom:"8px"}}><div style={{fontSize:"10px",color:C.sub,marginBottom:"2px"}}>如果重來</div><div style={{fontSize:"12.5px",color:C.text,lineHeight:"1.5"}}>{r.redo}</div></div>}
          <div style={{display:"flex",gap:"8px",marginTop:"12px",paddingTop:"12px",borderTop:`1px solid ${C.border}`}}>
            {onEdit&&<button onClick={e=>{e.stopPropagation();onEdit(r);}} style={{flex:1,padding:"8px",background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:"8px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>✏️ 編輯</button>}
            {onDelete&&!confirmDel&&<button onClick={e=>{e.stopPropagation();setConfirmDel(true);}} style={{flex:1,padding:"8px",background:"transparent",border:"1px solid #f0d0cc",color:C.fail,borderRadius:"8px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>🗑 刪除</button>}
            {confirmDel&&<>
              <div style={{flex:1,fontSize:"12px",color:C.fail,display:"flex",alignItems:"center",paddingLeft:"4px"}}>確定刪除？</div>
              <button onClick={e=>{e.stopPropagation();setConfirmDel(false);}} style={{padding:"8px 12px",background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:"8px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>取消</button>
              <button onClick={e=>{e.stopPropagation();onDelete(r.id);}} style={{padding:"8px 14px",background:C.fail,border:"none",color:"white",borderRadius:"8px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>刪除</button>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PHRASES BANK (4 sub-tabs, image upload) ───────────────────────────────────
const navy="#3a4a6a", sage="#6a9070", rose="#c07880";

async function callAI(prompt, imageBase64=null, imageType="image/jpeg"){
  const content = imageBase64
    ? [{ type:"image", source:{ type:"base64", media_type:imageType, data:imageBase64 }}, { type:"text", text:prompt }]
    : prompt;
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content}] })
  });
  const data = await res.json();
  if(data.error) throw new Error(data.error.message);
  return data.content?.find(b=>b.type==="text")?.text||"";
}

function fileToBase64(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>res(r.result.split(",")[1]);
    r.onerror=()=>rej(new Error("read failed"));
    r.readAsDataURL(file);
  });
}

function UploadBtn({ onFile, label="上傳圖片", loading=false }){
  const ref = useRef();
  return (
    <div style={{ position:"relative", overflow:"hidden", display:"inline-block", width:"100%" }}>
      <button style={{ width:"100%", padding:"11px", background:loading?C.border:C.dark, border:"none", color:loading?"#999":"#f5ead8", borderRadius:"10px", fontSize:"12px", cursor:loading?"default":"pointer", fontFamily:"inherit" }}>
        {loading ? "AI 分析中…" : `📷 ${label}`}
      </button>
      {!loading && (
        <input ref={ref} type="file" accept="image/*"
          onChange={e=>{ const f=e.target.files[0]; if(f) onFile(f); e.target.value=""; }}
          style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer", fontSize:"0" }}
        />
      )}
    </div>
  );
}

// 我的話術
function MyPhrasesImageTab({records}){
  const [manual,setManual]=useState([]);
  const [newText,setNewText]=useState("");
  const [editId,setEditId]=useState(null);
  const [editText,setEditText]=useState("");
  const [genInfo,setGenInfo]=useState({material:"",cut:"",style:""});
  const [imgPreview,setImgPreview]=useState(null);
  const [imgBase64,setImgBase64]=useState(null);
  const [imgType,setImgType]=useState("image/jpeg");
  const [loading,setLoading]=useState(false);
  const [generated,setGenerated]=useState(null);

  const fromRecords=records.filter(r=>r.result==="success"&&r.key_sentence).map(r=>({
    id:`s-${r.id}`,text:r.key_sentence,source:"記錄",date:r.date?.slice(5).replace("-","."),
    product:r.items?.filter(i=>i.name).map(i=>i.name).join(" + ")||r.products||"",
    customer_type:r.customer_type,language:r.language,buy_reason:r.buy_reason,
  }));
  const fromOpening=records.filter(r=>r.built_rapport&&r.opening_line).map(r=>({
    id:`o-${r.id}`,text:r.opening_line,source:"切入",date:r.date?.slice(5).replace("-","."),
    product:r.items?.filter(i=>i.name).map(i=>i.name).join(" + ")||r.products||"",
    customer_type:r.customer_type,language:r.language,
  }));
  const all=[...manual,...fromRecords,...fromOpening];

  const addManual=()=>{ if(!newText.trim())return; setManual(p=>[{id:Date.now(),text:newText.trim(),source:"手動",date:new Date().toISOString().slice(5,10).replace("-",".")},...p]); setNewText(""); };
  const saveGenLine=line=>{ const text=line.replace(/^【.*?】/,"").trim(); setManual(p=>[{id:Date.now(),text,source:"AI",date:new Date().toISOString().slice(5,10).replace("-",".")},...p]); };
  const del=id=>setManual(p=>p.filter(x=>x.id!==id));
  const startEdit=p=>{setEditId(p.id);setEditText(p.text);};
  const saveEdit=()=>{ setManual(p=>p.map(x=>x.id===editId?{...x,text:editText}:x)); setEditId(null); };

  const handleFile=async file=>{
    setImgType(file.type||"image/jpeg");
    const b64=await fileToBase64(file);
    setImgBase64(b64);
    setImgPreview(URL.createObjectURL(file));
    setGenerated(null);
  };

  const generate=async()=>{
    setLoading(true); setGenerated(null);
    try{
      const extras=[genInfo.material&&`材質：${genInfo.material}`,genInfo.cut&&`剪裁：${genInfo.cut}`,genInfo.style&&`風格：${genInfo.style}`].filter(Boolean).join("、");
      const prompt=`你是服飾業資深店員，根據這張商品圖片${extras?`（${extras}）`:""}，用繁體中文生成4個方向的銷售話術（每個1-2句，口語化）：\n\n【材質賣點】\n【剪裁版型】\n【搭配建議】\n【場景推薦】`;
      const text=await callAI(prompt,imgBase64,imgType);
      setGenerated(text);
    }catch(e){setGenerated("生成失敗，請再試一次");}
    finally{setLoading(false);}
  };

  const genLines=generated?generated.split("\n").filter(l=>l.trim()&&l.includes("】")):[];

  return(
    <div>
      <Card accent={C.gold}>
        <SectionLabel label="手動新增" accent={C.gold}/>
        <Inp value={newText} onChange={setNewText} placeholder="輸入你覺得有效的話術…" multi/>
        <button onClick={addManual} style={{width:"100%",padding:"10px",background:C.dark,border:"none",color:"#f5ead8",borderRadius:"10px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit",marginTop:"8px"}}>新增 ＋</button>
      </Card>

      <Card accent={C.purple}>
        <SectionLabel label="上傳商品照片 · AI 生成話術" accent={C.purple}/>
        {imgPreview
          ? <div style={{marginBottom:"10px"}}>
              <div style={{display:"flex",gap:"10px",marginBottom:"10px"}}>
                <img src={imgPreview} alt="" style={{width:"80px",height:"80px",objectFit:"cover",borderRadius:"10px",flexShrink:0}}/>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:"6px"}}>
                  {[["material","材質","例：羊毛"],["cut","剪裁","例：修身"],["style","風格","例：韓系"]].map(([k,l,p])=>(
                    <div key={k}>
                      <div style={{fontSize:"10px",color:C.sub,marginBottom:"2px"}}>{l}（選填）</div>
                      <Inp value={genInfo[k]} onChange={v=>setGenInfo(g=>({...g,[k]:v}))} placeholder={p} style={{padding:"6px 9px",fontSize:"12px"}}/>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:"8px"}}>
                <button onClick={()=>{setImgPreview(null);setImgBase64(null);setGenerated(null);}} style={{flex:1,padding:"9px",background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:"10px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>重新上傳</button>
                <button onClick={generate} disabled={loading} style={{flex:2,padding:"9px",background:loading?C.border:C.purple,border:"none",color:"white",borderRadius:"10px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>{loading?"AI 生成中…":"▶ 生成話術"}</button>
              </div>
            </div>
          : <UploadBtn onFile={handleFile} label="上傳商品照片，AI 生成話術"/>
        }
        {genLines.length>0&&<div style={{marginTop:"12px",borderTop:`1px solid ${C.border}`,paddingTop:"12px"}}>
          <div style={{fontSize:"10px",color:C.purple,letterSpacing:"0.1em",marginBottom:"8px"}}>生成結果 · 點擊儲存</div>
          {genLines.map((line,i)=>{
            const title=line.match(/【(.*?)】/)?.[1]||"";
            const content=line.replace(/^【.*?】/,"").trim();
            return(
              <div key={i} style={{background:"#f5f0fa",borderRadius:"10px",padding:"10px 12px",marginBottom:"8px"}}>
                {title&&<div style={{fontSize:"10px",color:C.purple,fontWeight:700,marginBottom:"4px"}}>{title}</div>}
                <div style={{fontSize:"13px",color:C.text,lineHeight:"1.65",fontStyle:"italic",marginBottom:"7px"}}>「{content}」</div>
                <button onClick={()=>saveGenLine(line)} style={{padding:"5px 12px",background:"transparent",border:`1px solid ${C.purple}`,color:C.purple,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>＋ 儲存</button>
              </div>
            );
          })}
        </div>}
      </Card>

      {all.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:C.sub,fontSize:"13px"}}><div style={{fontSize:"28px",marginBottom:"8px"}}>💬</div>還沒有話術</div>}
      {all.map(p=>{
        const srcColor=p.source==="AI"?C.purple:p.source==="記錄"?C.success:p.source==="切入"?C.gold:C.sub;
        return(
          <div key={p.id} style={{background:C.card,borderRadius:"12px",marginBottom:"8px",border:`1px solid ${C.border}`,borderLeft:`3px solid ${srcColor}`,padding:"12px 14px"}}>
            <div style={{display:"flex",gap:"5px",alignItems:"center",marginBottom:"5px"}}>
              <span style={{fontSize:"9px",padding:"2px 6px",background:`${srcColor}22`,borderRadius:"10px",color:srcColor,fontWeight:700}}>{p.source}</span>
              <span style={{fontSize:"10px",color:"#c0b8a8"}}>{p.date}</span>
            </div>
            {p.product&&<div style={{fontSize:"11px",color:C.gold,fontWeight:600,marginBottom:"4px"}}>🛍 {p.product}</div>}
            {(p.customer_type||p.language||p.buy_reason)&&<div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"5px"}}>
              {p.customer_type&&<span style={{fontSize:"10px",padding:"2px 6px",background:C.goldLight,borderRadius:"10px",color:"#8a6830"}}>{p.customer_type}型</span>}
              {p.language&&<span style={{fontSize:"10px",padding:"2px 6px",background:"#f0f4f8",borderRadius:"10px",color:C.sub}}>{p.language}</span>}
              {p.buy_reason&&<span style={{fontSize:"10px",padding:"2px 6px",background:"#e8f4ec",borderRadius:"10px",color:C.success}}>{p.buy_reason}</span>}
            </div>}
            {editId===p.id
              ?<div><Inp value={editText} onChange={setEditText} multi style={{fontSize:"12px",minHeight:"50px"}}/><div style={{display:"flex",gap:"6px",marginTop:"6px"}}><button onClick={()=>setEditId(null)} style={{flex:1,padding:"6px",background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>取消</button><button onClick={saveEdit} style={{flex:2,padding:"6px",background:C.dark,border:"none",color:"#f5ead8",borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>儲存</button></div></div>
              :<div style={{fontSize:"13px",color:C.text,lineHeight:"1.65",fontStyle:"italic"}}>「{p.text}」</div>
            }
            {editId!==p.id&&(p.source==="手動"||p.source==="AI")&&<div style={{display:"flex",gap:"6px",marginTop:"8px"}}>
              <button onClick={()=>startEdit(p)} style={{flex:1,padding:"5px",background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>✏️</button>
              <button onClick={()=>del(p.id)} style={{flex:1,padding:"5px",background:"transparent",border:"1px solid #f0d0cc",color:C.fail,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>🗑</button>
            </div>}
          </div>
        );
      })}
    </div>
  );
}

// 日文單詞
function JpWordsImageTab(){
  const [words,setWords]=useState([]);
  const [loading,setLoading]=useState(false);
  const [search,setSearch]=useState("");
  const [filterCat,setFilterCat]=useState("全部");
  const [editId,setEditId]=useState(null);
  const [editData,setEditData]=useState({});

  const extract=async file=>{
    setLoading(true);
    try{
      const b64=await fileToBase64(file);
      const imgType=file.type||"image/jpeg";
      const prompt=`請仔細分析這張圖片中所有日文服飾相關詞彙。只輸出JSON陣列，不要其他文字：\n[{"jp":"日文","reading":"讀音","zh":"繁體中文","category":"品類/材質/風格/描述其中之一","example":"例句"}]\n\n如果圖中有中文對照直接使用，沒有的自動補上。`;
      const text=await callAI(prompt,b64,imgType);
      const clean=text.replace(/\`\`\`json|\`\`\`/g,"").trim();
      const arr=JSON.parse(clean);
      const newW=arr.map(w=>({...w,id:Date.now()+Math.random(),date:new Date().toISOString().slice(0,10)}));
      setWords(p=>{const ex=new Set(p.map(x=>x.jp));return[...p,...newW.filter(w=>!ex.has(w.jp))];});
    }catch(e){alert("提取失敗，請再試一次");}
    finally{setLoading(false);}
  };

  const CAT_COLORS={品類:navy,材質:sage,風格:C.purple,描述:rose};
  const cats=["全部",...new Set(words.map(w=>w.category).filter(Boolean))];
  const filtered=words.filter(w=>filterCat==="全部"||w.category===filterCat).filter(w=>!search||w.jp?.includes(search)||w.zh?.includes(search));

  return(
    <div>
      <Card accent={navy}>
        <SectionLabel label="上傳圖片 · AI 提取日文單詞" accent={navy}/>
        <UploadBtn onFile={extract} label="上傳圖片，自動提取日文單詞＋翻譯" loading={loading}/>
      </Card>
      {words.length>0&&<>
        <Inp value={search} onChange={setSearch} placeholder="搜尋單詞…" style={{marginBottom:"8px"}}/>
        <div style={{display:"flex",gap:"6px",overflowX:"auto",paddingBottom:"4px",marginBottom:"8px"}}>
          {cats.map(c=><button key={c} onClick={()=>setFilterCat(c)} style={{padding:"4px 10px",border:`1.5px solid ${filterCat===c?(CAT_COLORS[c]||C.dark):C.border}`,background:filterCat===c?(CAT_COLORS[c]||C.dark):"transparent",color:filterCat===c?"#fff":C.sub,borderRadius:"20px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{c}</button>)}
        </div>
        <div style={{fontSize:"11px",color:C.sub,marginBottom:"8px"}}>共 {words.length} 個 · 顯示 {filtered.length} 個</div>
      </>}
      {filtered.length===0&&words.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:C.sub,fontSize:"13px"}}><div style={{fontSize:"28px",marginBottom:"8px"}}>🈳</div>上傳圖片，自動提取日文單詞</div>}
      {filtered.map(w=>(
        <div key={w.id} style={{background:C.card,borderRadius:"12px",marginBottom:"8px",border:`1px solid ${C.border}`,borderLeft:`3px solid ${CAT_COLORS[w.category]||C.border}`,padding:"12px 14px"}}>
          {editId===w.id
            ?<div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
              {[["jp","日文"],["reading","讀音"],["zh","中文"],["category","分類"],["example","例句"]].map(([k,l])=>(
                <div key={k}><div style={{fontSize:"10px",color:C.sub,marginBottom:"2px"}}>{l}</div><Inp value={editData[k]||""} onChange={v=>setEditData(d=>({...d,[k]:v}))} style={{fontSize:"12px",padding:"6px 9px"}}/></div>
              ))}
              <div style={{display:"flex",gap:"6px"}}><button onClick={()=>setEditId(null)} style={{flex:1,padding:"6px",background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>取消</button><button onClick={()=>{setWords(p=>p.map(x=>x.id===editId?editData:x));setEditId(null);}} style={{flex:2,padding:"6px",background:C.dark,border:"none",color:"#f5ead8",borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>儲存</button></div>
            </div>
            :<div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:"18px",fontWeight:700,color:C.dark}}>{w.jp}</div>
                  {w.reading&&<div style={{fontSize:"11px",color:C.sub,marginBottom:"2px"}}>{w.reading}</div>}
                  <div style={{fontSize:"14px",color:C.text,fontWeight:600}}>{w.zh}</div>
                </div>
                {w.category&&<span style={{fontSize:"9px",padding:"2px 7px",background:`${CAT_COLORS[w.category]||"#888"}22`,borderRadius:"10px",color:CAT_COLORS[w.category]||C.sub,fontWeight:700}}>{w.category}</span>}
              </div>
              {w.example&&<div style={{fontSize:"11px",color:C.sub,marginTop:"6px",fontStyle:"italic",background:C.bg,borderRadius:"6px",padding:"5px 8px"}}>{w.example}</div>}
              <div style={{display:"flex",gap:"6px",marginTop:"8px"}}>
                <button onClick={()=>{setEditId(w.id);setEditData({...w});}} style={{flex:1,padding:"5px",background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>✏️</button>
                <button onClick={()=>setWords(p=>p.filter(x=>x.id!==w.id))} style={{flex:1,padding:"5px",background:"transparent",border:"1px solid #f0d0cc",color:C.fail,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>🗑</button>
              </div>
            </div>
          }
        </div>
      ))}
    </div>
  );
}

// 材質資料
function MaterialsImageTab(){
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(false);

  const extract=async file=>{
    setLoading(true);
    try{
      const b64=await fileToBase64(file);
      const imgType=file.type||"image/jpeg";
      const prompt=`分析這張圖片（材質標籤/成分表/材質圖），用繁體中文整理。只輸出JSON陣列：\n[{"name_zh":"中文名","name_jp":"日文名","name_en":"英文","composition":"成分比例","features":["特性1","特性2","特性3"],"sales_pitch":"向客人介紹的一句話（口語化）","care":"保養建議","seasons":["春","夏","秋","冬"中適合的]}]\n\n如有多個材質分開整理。`;
      const text=await callAI(prompt,b64,imgType);
      const clean=text.replace(/\`\`\`json|\`\`\`/g,"").trim();
      const arr=JSON.parse(clean);
      setItems(p=>[...arr.map(w=>({...w,id:Date.now()+Math.random(),date:new Date().toISOString().slice(0,10)})),...p]);
    }catch(e){alert("提取失敗，請再試一次");}
    finally{setLoading(false);}
  };

  const SEASON_C={春:"#a0c870",夏:"#70a0c8",秋:"#c8a070",冬:"#8070c8"};
  return(
    <div>
      <Card accent={sage}>
        <SectionLabel label="上傳圖片 · AI 提取材質資訊" accent={sage}/>
        <UploadBtn onFile={extract} label="上傳材質標籤或成分表，AI 自動整理" loading={loading}/>
      </Card>
      {items.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:C.sub,fontSize:"13px"}}><div style={{fontSize:"28px",marginBottom:"8px"}}>🧵</div>上傳材質標籤，自動整理成資料卡</div>}
      {items.map(item=>(
        <div key={item.id} style={{background:C.card,borderRadius:"14px",marginBottom:"10px",border:`1px solid ${C.border}`,borderTop:`3px solid ${sage}`,padding:"14px"}}>
          <div style={{fontSize:"18px",fontWeight:700,color:C.dark,marginBottom:"2px"}}>{item.name_zh}</div>
          <div style={{display:"flex",gap:"6px",marginBottom:"8px",flexWrap:"wrap"}}>
            {item.name_jp&&<span style={{fontSize:"12px",color:C.sub}}>{item.name_jp}</span>}
            {item.name_en&&<span style={{fontSize:"11px",color:"#aaa"}}>{item.name_en}</span>}
            {item.composition&&<span style={{fontSize:"11px",color:C.sub,background:C.bg,borderRadius:"6px",padding:"2px 7px"}}>{item.composition}</span>}
          </div>
          {item.sales_pitch&&<div style={{background:"#f0faf4",borderRadius:"8px",padding:"9px 12px",marginBottom:"10px",borderLeft:`3px solid ${sage}`}}>
            <div style={{fontSize:"10px",color:sage,fontWeight:700,marginBottom:"3px"}}>銷售話術</div>
            <div style={{fontSize:"13px",color:C.text,fontStyle:"italic"}}>「{item.sales_pitch}」</div>
          </div>}
          {item.features?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"8px"}}>
            {item.features.map((f,i)=><span key={i} style={{fontSize:"11px",padding:"3px 9px",background:"#e8f4ec",borderRadius:"10px",color:sage}}>{f}</span>)}
          </div>}
          <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap",marginBottom:"10px"}}>
            {item.seasons?.map((s,i)=><span key={i} style={{fontSize:"10px",padding:"2px 7px",background:`${SEASON_C[s]||"#aaa"}22`,borderRadius:"10px",color:SEASON_C[s]||C.sub}}>{s}</span>)}
            {item.care&&<span style={{fontSize:"10px",color:C.sub,marginLeft:"auto"}}>🧺 {item.care}</span>}
          </div>
          <button onClick={()=>setItems(p=>p.filter(x=>x.id!==item.id))} style={{width:"100%",padding:"6px",background:"transparent",border:"1px solid #f0d0cc",color:C.fail,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>🗑 刪除</button>
        </div>
      ))}
    </div>
  );
}

// 穿搭話術
function StylingImageTab(){
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(false);

  const extract=async file=>{
    setLoading(true);
    try{
      const b64=await fileToBase64(file);
      const imgType=file.type||"image/jpeg";
      const prompt=`你是服飾業資深店員，分析這張穿搭圖片，用繁體中文生成銷售話術資料。只輸出JSON：\n{"style":"風格","key_pieces":["單品1","單品2"],"color_scheme":"配色","suitable_for":["場合1","場合2"],"body_effect":"修身效果","pitches":["話術1","話術2","話術3"],"jp_phrases":[{"jp":"日文話術","zh":"中文"}]}\n\n話術要口語化像真正店員說的。`;
      const text=await callAI(prompt,b64,imgType);
      const clean=text.replace(/\`\`\`json|\`\`\`/g,"").trim();
      const item=JSON.parse(clean);
      setItems(p=>[{...item,id:Date.now(),date:new Date().toISOString().slice(0,10),imgPreview:URL.createObjectURL(file)},...p]);
    }catch(e){alert("分析失敗，請再試一次");}
    finally{setLoading(false);}
  };

  return(
    <div>
      <Card accent={rose}>
        <SectionLabel label="上傳穿搭圖片 · AI 生成話術" accent={rose}/>
        <UploadBtn onFile={extract} label="上傳穿搭照片，AI 分析並生成推薦話術" loading={loading}/>
      </Card>
      {items.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:C.sub,fontSize:"13px"}}><div style={{fontSize:"28px",marginBottom:"8px"}}>👗</div>上傳穿搭圖，自動生成推薦話術</div>}
      {items.map(item=>(
        <div key={item.id} style={{background:C.card,borderRadius:"14px",marginBottom:"10px",border:`1px solid ${C.border}`,borderTop:`3px solid ${rose}`,overflow:"hidden"}}>
          <div style={{display:"flex",gap:"12px",padding:"14px 14px 10px"}}>
            {item.imgPreview&&<img src={item.imgPreview} alt="" style={{width:"80px",height:"100px",objectFit:"cover",borderRadius:"10px",flexShrink:0}}/>}
            <div style={{flex:1}}>
              <div style={{fontSize:"16px",fontWeight:700,color:C.dark,marginBottom:"4px"}}>{item.style}</div>
              {item.color_scheme&&<div style={{fontSize:"11px",color:C.sub,marginBottom:"6px"}}>🎨 {item.color_scheme}</div>}
              {item.key_pieces?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"6px"}}>
                {item.key_pieces.map((p,i)=><span key={i} style={{fontSize:"10px",padding:"2px 8px",background:C.goldLight,borderRadius:"10px",color:"#8a6830"}}>{p}</span>)}
              </div>}
              {item.body_effect&&<div style={{fontSize:"11px",color:C.sub,fontStyle:"italic"}}>{item.body_effect}</div>}
            </div>
          </div>
          {item.pitches?.length>0&&<div style={{padding:"0 14px 10px"}}>
            <div style={{fontSize:"10px",color:rose,fontWeight:700,marginBottom:"6px"}}>推薦話術</div>
            {item.pitches.map((p,i)=><div key={i} style={{background:"#fdf0f2",borderRadius:"8px",padding:"9px 12px",marginBottom:"6px",borderLeft:`3px solid ${rose}`}}>
              <div style={{fontSize:"13px",color:C.text,lineHeight:"1.65",fontStyle:"italic"}}>「{p}」</div>
            </div>)}
          </div>}
          {item.suitable_for?.length>0&&<div style={{padding:"0 14px 10px"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
              {item.suitable_for.map((s,i)=><span key={i} style={{fontSize:"11px",padding:"3px 9px",background:"#fde8ec",borderRadius:"10px",color:rose}}>{s}</span>)}
            </div>
          </div>}
          {item.jp_phrases?.length>0&&<div style={{padding:"0 14px 10px"}}>
            <div style={{fontSize:"10px",color:navy,fontWeight:700,marginBottom:"6px"}}>日文話術</div>
            {item.jp_phrases.map((p,i)=><div key={i} style={{display:"flex",gap:"8px",marginBottom:"5px",background:"#f0f2f8",borderRadius:"8px",padding:"7px 10px",alignItems:"baseline"}}>
              <div style={{fontSize:"13px",color:navy,fontWeight:600,flexShrink:0}}>{p.jp}</div>
              <div style={{fontSize:"11px",color:C.sub}}>{p.zh}</div>
            </div>)}
          </div>}
          <div style={{padding:"0 14px 12px"}}>
            <button onClick={()=>setItems(p=>p.filter(x=>x.id!==item.id))} style={{width:"100%",padding:"6px",background:"transparent",border:"1px solid #f0d0cc",color:C.fail,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>🗑 刪除</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PhrasesBank({records}){
  const [sub,setSub]=useState("my");
  const SUBS=[["my","💬 我的話術",C.gold],["jp","🈳 日文單詞",navy],["mat","🧵 材質資料",sage],["style","👗 穿搭話術",rose]];
  return(
    <div>
      <div style={{display:"flex",gap:"2px",marginBottom:"14px",background:C.dark,borderRadius:"12px",padding:"4px"}}>
        {SUBS.map(([id,label,accent])=>(
          <button key={id} onClick={()=>setSub(id)} style={{flex:1,padding:"8px 2px",background:sub===id?accent:"transparent",border:"none",color:sub===id?"#fff":"#6a6058",fontSize:"10px",cursor:"pointer",fontFamily:"inherit",borderRadius:"8px",transition:"all .15s",whiteSpace:"nowrap"}}>{label}</button>
        ))}
      </div>
      {sub==="my"&&<MyPhrasesTab records={records}/>}
      {sub==="jp"&&<JpWordsTab/>}
      {sub==="mat"&&<MaterialsTab/>}
      {sub==="style"&&<StylingTab/>}
    </div>
  );
}

// 我的話術
function MyPhrasesTextTab({records}){
  const [manual,setManual]=useState([]);
  const [newText,setNewText]=useState("");
  const [editId,setEditId]=useState(null);
  const [editText,setEditText]=useState("");
  // AI generate fields
  const [genInfo,setGenInfo]=useState({product:"",material:"",cut:"",style:""});
  const [loading,setLoading]=useState(false);
  const [generated,setGenerated]=useState(null);

  const fromRecords=records.filter(r=>r.result==="success"&&r.key_sentence).map(r=>({
    id:`s-${r.id}`,text:r.key_sentence,source:"記錄",date:r.date?.slice(5).replace("-","."),
    product:r.items?.filter(i=>i.name).map(i=>i.name).join(" + ")||r.products||"",
    customer_type:r.customer_type,language:r.language,buy_reason:r.buy_reason,
  }));
  const fromOpening=records.filter(r=>r.built_rapport&&r.opening_line).map(r=>({
    id:`o-${r.id}`,text:r.opening_line,source:"切入",date:r.date?.slice(5).replace("-","."),
    product:r.items?.filter(i=>i.name).map(i=>i.name).join(" + ")||r.products||"",
    customer_type:r.customer_type,language:r.language,
  }));
  const all=[...manual,...fromRecords,...fromOpening];

  const addManual=()=>{if(!newText.trim())return;setManual(p=>[{id:Date.now(),text:newText.trim(),source:"手動",date:new Date().toISOString().slice(5,10).replace("-",".")},...p]);setNewText("");};
  const saveGenLine=(line)=>{const text=line.replace(/^【.*?】/,"").trim();setManual(p=>[{id:Date.now(),text,source:"AI",date:new Date().toISOString().slice(5,10).replace("-",".")},...p]);};
  const del=id=>setManual(p=>p.filter(x=>x.id!==id));
  const startEdit=(p)=>{setEditId(p.id);setEditText(p.text);};
  const saveEdit=()=>{setManual(p=>p.map(x=>x.id===editId?{...x,text:editText}:x));setEditId(null);};

  const generate=async()=>{
    if(!genInfo.product&&!genInfo.material)return;
    setLoading(true);setGenerated(null);
    try{
      const desc=[genInfo.product&&`商品：${genInfo.product}`,genInfo.material&&`材質：${genInfo.material}`,genInfo.cut&&`剪裁：${genInfo.cut}`,genInfo.style&&`風格：${genInfo.style}`].filter(Boolean).join("、");
      const text=await callAI(`你是服飾業資深店員。根據以下商品資訊，用繁體中文生成4個方向的銷售話術（每個1-2句，口語化，像真正店員說的）：\n\n${desc}\n\n格式：\n【材質賣點】話術\n【剪裁版型】話術\n【搭配建議】話術\n【場景推薦】話術`);
      setGenerated(text);
    }catch(e){setGenerated("生成失敗，請再試一次");}
    finally{setLoading(false);}
  };

  const genLines=generated?generated.split("\n").filter(l=>l.trim()&&l.includes("】")):[];

  return(
    <div>
      {/* Manual */}
      <Card accent={C.gold}>
        <SectionLabel label="手動新增" accent={C.gold}/>
        <Inp value={newText} onChange={setNewText} placeholder="輸入你覺得有效的話術…" multi/>
        <button onClick={addManual} style={{width:"100%",padding:"10px",background:C.dark,border:"none",color:"#f5ead8",borderRadius:"10px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit",marginTop:"8px"}}>新增 ＋</button>
      </Card>

      {/* AI Generate */}
      <Card accent={C.purple}>
        <SectionLabel label="AI 生成話術" accent={C.purple}/>
        <div style={{fontSize:"11px",color:C.purple,background:"#f5f0fa",borderRadius:"8px",padding:"8px 10px",marginBottom:"10px"}}>填入商品資訊，AI 自動生成4個方向的話術</div>
        {[["product","商品名稱","例：米色針織外套"],["material","材質","例：羊毛、喀什米爾"],["cut","剪裁","例：修身、oversize"],["style","風格","例：韓系、高級感"]].map(([k,l,p])=>(
          <Fld key={k} label={l}>
            <Inp value={genInfo[k]} onChange={v=>setGenInfo(g=>({...g,[k]:v}))} placeholder={p}/>
          </Fld>
        ))}
        <button onClick={generate} disabled={loading||(!genInfo.product&&!genInfo.material)} style={{width:"100%",padding:"10px",background:loading||(!genInfo.product&&!genInfo.material)?C.border:C.purple,border:"none",color:"white",borderRadius:"10px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>
          {loading?"AI 生成中…":"▶ 生成話術"}
        </button>
        {genLines.length>0&&<div style={{marginTop:"12px",borderTop:`1px solid ${C.border}`,paddingTop:"12px"}}>
          <div style={{fontSize:"10px",color:C.purple,letterSpacing:"0.1em",marginBottom:"8px"}}>生成結果 · 點擊儲存</div>
          {genLines.map((line,i)=>{
            const title=line.match(/【(.*?)】/)?.[1]||"";
            const content=line.replace(/^【.*?】/,"").trim();
            return(
              <div key={i} style={{background:"#f5f0fa",borderRadius:"10px",padding:"10px 12px",marginBottom:"8px"}}>
                {title&&<div style={{fontSize:"10px",color:C.purple,fontWeight:700,marginBottom:"4px"}}>{title}</div>}
                <div style={{fontSize:"13px",color:C.text,lineHeight:"1.65",fontStyle:"italic",marginBottom:"7px"}}>「{content}」</div>
                <button onClick={()=>saveGenLine(line)} style={{padding:"5px 12px",background:"transparent",border:`1px solid ${C.purple}`,color:C.purple,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>＋ 儲存</button>
              </div>
            );
          })}
        </div>}
      </Card>

      {/* All phrases */}
      {all.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:C.sub,fontSize:"13px"}}><div style={{fontSize:"28px",marginBottom:"8px"}}>💬</div>還沒有話術</div>}
      {all.map(p=>{
        const srcColor=p.source==="AI"?C.purple:p.source==="記錄"?C.success:p.source==="切入"?C.gold:C.sub;
        return(
          <div key={p.id} style={{background:C.card,borderRadius:"12px",marginBottom:"8px",border:`1px solid ${C.border}`,borderLeft:`3px solid ${srcColor}`,padding:"12px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"5px"}}>
              <div style={{display:"flex",gap:"5px",alignItems:"center"}}>
                <span style={{fontSize:"9px",padding:"2px 6px",background:`${srcColor}22`,borderRadius:"10px",color:srcColor,fontWeight:700}}>{p.source}</span>
                <span style={{fontSize:"10px",color:"#c0b8a8"}}>{p.date}</span>
              </div>
            </div>
            {p.product&&<div style={{fontSize:"11px",color:C.gold,fontWeight:600,marginBottom:"4px"}}>🛍 {p.product}</div>}
            {(p.customer_type||p.language||p.buy_reason)&&<div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"5px"}}>
              {p.customer_type&&<span style={{fontSize:"10px",padding:"2px 6px",background:C.goldLight,borderRadius:"10px",color:"#8a6830"}}>{p.customer_type}型</span>}
              {p.language&&<span style={{fontSize:"10px",padding:"2px 6px",background:"#f0f4f8",borderRadius:"10px",color:C.sub}}>{p.language}</span>}
              {p.buy_reason&&<span style={{fontSize:"10px",padding:"2px 6px",background:"#e8f4ec",borderRadius:"10px",color:C.success}}>{p.buy_reason}</span>}
            </div>}
            {editId===p.id
              ?<div><Inp value={editText} onChange={setEditText} multi style={{fontSize:"12px",minHeight:"50px"}}/><div style={{display:"flex",gap:"6px",marginTop:"6px"}}><button onClick={()=>setEditId(null)} style={{flex:1,padding:"6px",background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>取消</button><button onClick={saveEdit} style={{flex:2,padding:"6px",background:C.dark,border:"none",color:"#f5ead8",borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>儲存</button></div></div>
              :<div style={{fontSize:"13px",color:C.text,lineHeight:"1.65",fontStyle:"italic"}}>「{p.text}」</div>
            }
            {editId!==p.id&&p.source==="手動"&&<div style={{display:"flex",gap:"6px",marginTop:"8px"}}>
              <button onClick={()=>startEdit(p)} style={{flex:1,padding:"5px",background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>✏️</button>
              <button onClick={()=>del(p.id)} style={{flex:1,padding:"5px",background:"transparent",border:"1px solid #f0d0cc",color:C.fail,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>🗑</button>
            </div>}
          </div>
        );
      })}
    </div>
  );
}

// 日文單詞
function JpWordsTextTab(){
  const [words,setWords]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [search,setSearch]=useState("");
  const [filterCat,setFilterCat]=useState("全部");
  const [editId,setEditId]=useState(null);
  const [editData,setEditData]=useState({});

  const extract=async()=>{
    if(!input.trim())return;
    setLoading(true);
    try{
      const text=await callAI(`請分析以下服飾相關文字，提取所有日文詞彙並整理。只輸出JSON陣列：\n\n${input}\n\n格式：[{"jp":"日文","reading":"讀音","zh":"繁體中文","category":"品類/材質/風格/描述其中之一","example":"例句"}]\n\n如果沒有中文翻譯請自動補上。`);
      const clean=text.replace(/\`\`\`json|\`\`\`/g,"").trim();
      const arr=JSON.parse(clean);
      const newW=arr.map(w=>({...w,id:Date.now()+Math.random(),date:new Date().toISOString().slice(0,10)}));
      setWords(p=>{const ex=new Set(p.map(x=>x.jp));return[...p,...newW.filter(w=>!ex.has(w.jp))];});
      setInput("");
    }catch(e){alert("提取失敗，請再試一次");}
    finally{setLoading(false);}
  };

  const CAT_COLORS={品類:navy,材質:sage,風格:C.purple,描述:rose};
  const cats=["全部",...new Set(words.map(w=>w.category).filter(Boolean))];
  const filtered=words.filter(w=>filterCat==="全部"||w.category===filterCat).filter(w=>!search||w.jp?.includes(search)||w.zh?.includes(search));

  return(
    <div>
      <Card accent={navy}>
        <SectionLabel label="貼入文字 · AI 提取日文單詞" accent={navy}/>
        <div style={{fontSize:"11px",color:navy,background:"#f0f2f8",borderRadius:"8px",padding:"8px 10px",marginBottom:"10px"}}>把截圖裡的文字複製貼入，或直接輸入日文，AI 自動整理成單詞表</div>
        <Inp value={input} onChange={setInput} placeholder="貼入或輸入日文文字…例：トップス 上衣、ウール 羊毛…" multi/>
        <button onClick={extract} disabled={loading||!input.trim()} style={{width:"100%",padding:"10px",background:loading||!input.trim()?C.border:navy,border:"none",color:"white",borderRadius:"10px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit",marginTop:"8px"}}>
          {loading?"提取中…":"▶ 提取並整理"}
        </button>
      </Card>

      {words.length>0&&<>
        <Inp value={search} onChange={setSearch} placeholder="搜尋單詞…" style={{marginBottom:"8px"}}/>
        <div style={{display:"flex",gap:"6px",overflowX:"auto",paddingBottom:"4px",marginBottom:"10px"}}>
          {cats.map(c=><button key={c} onClick={()=>setFilterCat(c)} style={{padding:"4px 10px",border:`1.5px solid ${filterCat===c?(CAT_COLORS[c]||C.dark):C.border}`,background:filterCat===c?(CAT_COLORS[c]||C.dark):"transparent",color:filterCat===c?"#fff":C.sub,borderRadius:"20px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{c}</button>)}
        </div>
        <div style={{fontSize:"11px",color:C.sub,marginBottom:"8px"}}>共 {words.length} 個 · 顯示 {filtered.length} 個</div>
      </>}

      {filtered.length===0&&words.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:C.sub,fontSize:"13px"}}><div style={{fontSize:"28px",marginBottom:"8px"}}>🈳</div>貼入文字，自動整理日文單詞</div>}
      {filtered.map(w=>(
        <div key={w.id} style={{background:C.card,borderRadius:"12px",marginBottom:"8px",border:`1px solid ${C.border}`,borderLeft:`3px solid ${CAT_COLORS[w.category]||C.border}`,padding:"12px 14px"}}>
          {editId===w.id
            ?<div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
              {[["jp","日文"],["reading","讀音"],["zh","中文"],["category","分類"],["example","例句"]].map(([k,l])=>(
                <div key={k}><div style={{fontSize:"10px",color:C.sub,marginBottom:"2px"}}>{l}</div><Inp value={editData[k]||""} onChange={v=>setEditData(d=>({...d,[k]:v}))} style={{fontSize:"12px",padding:"6px 9px"}}/></div>
              ))}
              <div style={{display:"flex",gap:"6px"}}><button onClick={()=>setEditId(null)} style={{flex:1,padding:"6px",background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>取消</button><button onClick={()=>{setWords(p=>p.map(x=>x.id===editId?editData:x));setEditId(null);}} style={{flex:2,padding:"6px",background:C.dark,border:"none",color:"#f5ead8",borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>儲存</button></div>
            </div>
            :<div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:"18px",fontWeight:700,color:C.dark}}>{w.jp}</div>
                  {w.reading&&<div style={{fontSize:"11px",color:C.sub,marginBottom:"2px"}}>{w.reading}</div>}
                  <div style={{fontSize:"14px",color:C.text,fontWeight:600}}>{w.zh}</div>
                </div>
                {w.category&&<span style={{fontSize:"9px",padding:"2px 7px",background:`${CAT_COLORS[w.category]||"#888"}22`,borderRadius:"10px",color:CAT_COLORS[w.category]||C.sub,fontWeight:700}}>{w.category}</span>}
              </div>
              {w.example&&<div style={{fontSize:"11px",color:C.sub,marginTop:"6px",fontStyle:"italic",background:C.bg,borderRadius:"6px",padding:"5px 8px"}}>{w.example}</div>}
              <div style={{display:"flex",gap:"6px",marginTop:"8px"}}>
                <button onClick={()=>{setEditId(w.id);setEditData({...w});}} style={{flex:1,padding:"5px",background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>✏️</button>
                <button onClick={()=>setWords(p=>p.filter(x=>x.id!==w.id))} style={{flex:1,padding:"5px",background:"transparent",border:"1px solid #f0d0cc",color:C.fail,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>🗑</button>
              </div>
            </div>
          }
        </div>
      ))}
    </div>
  );
}

// 常見服裝纖維小冊子（內建資料，可離線查看）
const MATERIAL_GUIDE = [{"name":"棉","jp":"綿（めん）","en":"Cotton","group":"天然纖維・植物性","source":"棉花種子周圍的棉絮（種子毛）。","process":"採收棉鈴 → 分離棉籽與棉纖維 → 清潔、梳理 → 紡成紗線 → 織布或針織。","features":["親膚柔軟","吸濕性佳","透氣、容易染色","耐熱性相對不錯"],"drawbacks":["容易皺","吸水後乾得較慢","可能縮水","反覆摩擦可能起毛球或褪色"],"care":"依洗標清洗；深淺色分開。純棉可能縮水，避免高溫烘乾。","pitch":"棉的觸感自然、親膚又透氣，日常穿著很舒服。","jpDetail":{"source":"綿花の種子を包む綿毛（種子毛）です。","process":"綿花を収穫し、綿実と繊維を分けて洗浄・梳綿します。その後、糸に紡いで織物や編物にします。","features":["肌触りが柔らかい","吸湿性に優れる","通気性があり、染色しやすい","比較的熱に強い"],"drawbacks":["シワになりやすい","水を含むと乾きにくい","縮むことがある","摩擦により毛玉や色落ちが生じる場合がある"],"care":"洗濯表示に従い、濃色と淡色を分けて洗います。綿100％は縮む場合があるため、高温乾燥は避けましょう。","pitch":"自然で柔らかな肌触りと通気性が魅力です。毎日の着用にも快適ですよ。"}},{"name":"亞麻","jp":"麻（リネン）","en":"Linen / Flax","group":"天然纖維・植物性","source":"亞麻植物的莖部韌皮纖維。","process":"收割亞麻莖 → 浸漚或其他方式分離韌皮纖維 → 梳理 → 紡紗 → 織布。","features":["吸濕、散熱快","透氣乾爽","有自然的節點與肌理","強度佳，濕態強度也不錯"],"drawbacks":["容易產生自然皺褶","初期手感可能較硬","摩擦處可能磨損","深色或特殊整理需留意褪色"],"care":"依洗標溫和洗滌；可接受自然皺感，熨燙時依洗標調整溫度。","pitch":"亞麻的優點是乾爽透氣，天氣熱時穿起來很舒服，也有自然的質感。","jpDetail":{"source":"亜麻（フラックス）の茎から採れる靭皮繊維です。","process":"亜麻の茎を収穫し、浸水などで靭皮繊維を取り出します。繊維を梳いて糸に紡ぎ、生地にします。","features":["吸湿・放熱性に優れる","通気性が高く、さらりとしている","自然な節や風合いがある","強度が高く、濡れた状態でも比較的丈夫"],"drawbacks":["自然なシワが出やすい","使い始めは硬く感じることがある","摩擦部分が擦り切れる場合がある","濃色品は色落ちに注意"],"care":"洗濯表示に従って優しく洗います。リネン特有のシワも風合いとして楽しめます。アイロンは表示に従いましょう。","pitch":"さらりとして通気性がよく、暑い季節も快適です。リネンならではの自然な風合いも魅力です。"}},{"name":"苧麻","jp":"ラミー","en":"Ramie","group":"天然纖維・植物性","source":"苧麻植物莖部的韌皮纖維。","process":"剝取莖皮 → 脫膠去除部分天然膠質 → 梳理、紡紗 → 織布。","features":["吸濕散熱","纖維強度高","布面乾爽、有挺度","不易被微生物侵蝕"],"drawbacks":["彈性較低、容易皺","纖維較硬挺，可能有刺感","反覆折疊處可能脆化"],"care":"依洗標清洗，避免長時間折壓；熨燙溫度依成分與洗標。","pitch":"苧麻摸起來比較乾爽挺身，適合喜歡自然麻感、又希望有輪廓的穿搭。","jpDetail":{"source":"苧麻（ラミー）の茎から採れる靭皮繊維です。","process":"茎の皮から繊維を取り出し、脱膠処理で天然の粘質物を除きます。その後、梳いて糸にし、生地にします。","features":["吸湿・放熱性がある","繊維強度が高い","さらりとした張りのある生地になる","微生物による劣化を受けにくい"],"drawbacks":["伸縮性が低く、シワになりやすい","硬めでチクチク感じる場合がある","折り曲げを繰り返すと繊維が傷むことがある"],"care":"洗濯表示に従い、長時間の折り畳みや圧迫を避けます。アイロン温度も表示を確認してください。","pitch":"さらりとした清涼感とハリが特徴です。ナチュラルな麻の風合いや、きれいなシルエットがお好きな方におすすめです。"}},{"name":"大麻纖維","jp":"ヘンプ","en":"Hemp","group":"天然纖維・植物性","source":"工業大麻植物莖部的韌皮纖維，與麻類同屬莖纖維。","process":"收割莖部 → 浸漚或機械分離韌皮纖維 → 梳理、紡紗 → 織造。","features":["耐用、強度佳","吸濕透氣","纖維具有自然粗獷的肌理","植物生長週期通常較短"],"drawbacks":["未充分加工時手感偏粗硬","彈性低、容易皺","不同加工方式造成觸感差異大"],"care":"依洗標溫和清洗；避免長時間潮濕與強力摩擦。","pitch":"大麻纖維有自然的乾爽肌理，特色是耐穿、透氣，風格比較休閒自然。","jpDetail":{"source":"産業用ヘンプの茎から採れる靭皮繊維です。麻の仲間に分類されます。","process":"茎を収穫し、浸水または機械的方法で靭皮繊維を分離します。梳いて糸に紡ぎ、生地にします。","features":["丈夫で強度が高い","吸湿性と通気性がある","自然で素朴な表面感がある","植物の生育期間が比較的短い"],"drawbacks":["加工が不十分だと硬く粗い手触りになる","伸縮性が低く、シワになりやすい","加工方法によって風合いに差が出る"],"care":"洗濯表示に従って優しく洗い、長時間濡れたままにしたり強く摩擦したりしないでください。","pitch":"自然なドライタッチと素朴な表情が特徴です。丈夫で通気性がよく、カジュアルなスタイルに合います。"}},{"name":"羊毛","jp":"ウール","en":"Wool","group":"天然纖維・動物性","source":"主要取自綿羊的毛被。","process":"剪毛 → 洗毛去除油脂與雜質 → 梳毛或精梳 → 紡紗 → 織造或針織。","features":["捲曲結構能保留空氣、保暖","吸濕性佳，穿著時較不易有濕冷感","有彈性與回復性","部分羊毛具有天然抗異味特性"],"drawbacks":["遇熱、摩擦、濕氣與攪動可能氈化縮水","部分人會覺得刺癢","可能遭蟲蛀","保養通常比一般棉料講究"],"care":"優先依洗標；標示可水洗才使用羊毛專用洗劑與低摩擦方式，平放晾乾。","pitch":"羊毛能保留溫暖空氣，同時吸收濕氣，適合需要保暖又不想太悶的季節。","jpDetail":{"source":"主に羊の毛から採れる動物性繊維です。","process":"毛刈り後、洗毛して脂や汚れを落とします。梳毛・紡績を経て、織物やニットにします。","features":["縮れた繊維が空気を含み、保温性が高い","吸湿性があり、蒸れにくい","弾力と回復性がある","種類によってはにおいが付きにくい"],"drawbacks":["熱・摩擦・湿気・攪拌でフェルト化や縮みが起こる","肌にチクチク感じる場合がある","虫食いに注意が必要","綿などに比べてお手入れに配慮が必要"],"care":"洗濯表示を最優先にしてください。水洗い可能なものはウール用洗剤を使い、摩擦を避けて平干しします。","pitch":"羊毛は暖かい空気を含みながら湿気も吸収します。暖かさと快適さを両立したい季節におすすめです。"}},{"name":"美麗諾羊毛","jp":"メリノウール","en":"Merino Wool","group":"天然纖維・動物性","source":"美麗諾羊品種的羊毛，特色是纖維通常較細。","process":"剪毛、洗毛、梳理與紡紗，基本製程與一般羊毛相同；依纖維細度分級。","features":["纖維細，通常較柔軟","保暖且能吸濕","透氣、溫度調節感佳","適合貼身針織或機能衣"],"drawbacks":["仍可能因摩擦與洗滌方式不當而起毛球或氈化","細羊毛價格通常較高","部分人仍可能感到刺激"],"care":"依洗標；避免高溫、強力搓揉與吊掛變形。","pitch":"美麗諾羊毛的纖維比較細，觸感通常比一般粗羊毛柔和，適合做貼身或輕薄保暖單品。","jpDetail":{"source":"メリノ種の羊から採れる羊毛で、一般に繊維が細いことが特徴です。","process":"毛刈り・洗毛・梳毛・紡績の工程は一般的なウールと同様です。繊維の細さなどで選別されます。","features":["繊維が細く、比較的柔らかい","保温性と吸湿性がある","通気性がよく、温度調節に役立つ","肌着や薄手ニットにも使われる"],"drawbacks":["摩擦や不適切な洗濯で毛玉・フェルト化が起こる","細い羊毛は価格が高め","肌質によって刺激を感じる場合がある"],"care":"洗濯表示に従い、高温や強い揉み洗いを避けます。型崩れ防止のため、ニットは平干しがおすすめです。","pitch":"一般的なウールより繊維が細く、柔らかな肌触りが特徴です。薄手の保温アイテムや肌に近いニットにも向いています。"}},{"name":"喀什米爾羊毛","jp":"カシミヤ","en":"Cashmere","group":"天然纖維・動物性","source":"喀什米爾山羊身上細軟的底層絨毛。","process":"換毛季梳取或採集底絨 → 分離粗毛與細絨 → 清洗、梳理 → 紡成細紗。","features":["非常柔軟、細緻","輕盈但保暖","垂墜感與細膩光澤佳","適合製作高級針織品"],"drawbacks":["纖維細，摩擦處容易起毛球","容易被尖銳物勾到","需細心保養，價格較高","過度洗滌可能影響蓬鬆與手感"],"care":"依洗標；建議減少摩擦，平放收納與晾乾，避免長時間吊掛。","pitch":"喀什米爾的特色是輕盈又柔軟，保暖感很好，穿起來不會有厚重負擔。","jpDetail":{"source":"カシミヤ山羊の柔らかな下毛（産毛）から採れる繊維です。","process":"換毛期に下毛を採取し、粗い毛と細い毛を分けます。洗浄・梳毛後、細い糸に紡ぎます。","features":["非常に柔らかく繊細","軽くて暖かい","美しいドレープと上品な光沢","高級ニットに使われる"],"drawbacks":["摩擦部分に毛玉ができやすい","引っ掛かりやすい","価格が高く、丁寧なお手入れが必要","洗いすぎると風合いや膨らみが損なわれる"],"care":"洗濯表示に従い、摩擦を避けます。保管・乾燥は平置きにし、長時間ハンガーに掛けないようにしましょう。","pitch":"軽くて柔らかく、暖かさもしっかりあります。厚手すぎず、上質な着心地を楽しめる素材です。"}},{"name":"馬海毛","jp":"モヘヤ","en":"Mohair","group":"天然纖維・動物性","source":"安哥拉山羊的毛。注意：不是安哥拉兔毛。","process":"剪取山羊毛 → 洗毛、分級 → 梳理紡紗，常與羊毛或尼龍混紡改善耐用度。","features":["纖維有光澤","蓬鬆、輕盈","有一定強度與耐磨性","毛感明顯，視覺效果突出"],"drawbacks":["毛感可能掉毛或刺激敏感肌","表面容易勾紗","部分粗細等級觸感較刺","清洗需謹慎"],"care":"依洗標；避免摩擦與勾扯，摺疊收納較穩妥。","pitch":"馬海毛有漂亮的光澤和蓬鬆毛感，穿起來很有層次，適合做造型重點。","jpDetail":{"source":"アンゴラヤギから採れる毛です。アンゴラウサギの毛とは異なります。","process":"毛を刈り取り、洗浄・選別します。梳毛・紡績し、耐久性を高めるため羊毛やナイロンと混紡することもあります。","features":["繊維に光沢がある","ふんわり軽い","ある程度の強度と耐摩耗性がある","毛足が目立ち、華やかな表情になる"],"drawbacks":["毛抜けや肌への刺激が生じる場合がある","引っ掛かりやすい","繊維の太さによってチクチクすることがある","洗濯には注意が必要"],"care":"洗濯表示に従い、摩擦や引っ掛かりを避けます。保管は畳む方法がおすすめです。","pitch":"美しい光沢とふんわりした毛足が魅力です。コーディネートに立体感や華やかさをプラスできます。"}},{"name":"羊駝毛","jp":"アルパカ","en":"Alpaca","group":"天然纖維・動物性","source":"羊駝身上的毛纖維。","process":"剪毛 → 分級、洗淨 → 梳理與紡紗 → 織造或針織。","features":["輕盈、保暖","纖維表面較平滑，光澤柔和","部分品種纖維細軟","天然色系多"],"drawbacks":["不同等級觸感差異大","可能起毛球或勾紗","部分較粗纖維會有刺感","通常需要較溫和保養"],"care":"依洗標；避免高溫與大力搓揉，針織品平放晾乾。","pitch":"羊駝毛的特色是輕盈保暖，毛感和光澤都很柔和，適合做有蓬鬆感的針織。","jpDetail":{"source":"アルパカの毛から採れる動物性繊維です。","process":"毛刈り後に選別・洗浄し、梳毛・紡績を経て織物やニットにします。","features":["軽くて暖かい","繊維表面が比較的なめらかで、柔らかな光沢がある","品種によっては細く柔らかい","天然色のバリエーションが豊富"],"drawbacks":["品質によって肌触りに差がある","毛玉や引っ掛かりが生じる場合がある","太い繊維はチクチクすることがある","優しいお手入れが必要"],"care":"洗濯表示に従い、高温や強い揉み洗いを避けます。ニットは平干ししてください。","pitch":"軽くて暖かく、柔らかな毛並みと光沢が特徴です。ふんわりしたニットにぴったりです。"}},{"name":"安哥拉兔毛","jp":"アンゴラ","en":"Angora Rabbit Hair","group":"天然纖維・動物性","source":"安哥拉兔的細軟兔毛。","process":"梳取或剪取兔毛 → 清理、分級 → 常與羊毛或合成纖維混紡後紡紗。","features":["非常輕柔、蓬鬆","保暖性高","毛感細緻、外觀柔霧"],"drawbacks":["容易掉毛","纖維短，通常需混紡增加強度","容易勾紗、摩擦起毛","保養較費心"],"care":"依洗標；避免摩擦與頻繁清洗，收納時避免與尖銳物品接觸。","pitch":"安哥拉兔毛非常蓬鬆輕柔，視覺上有柔霧毛感，適合喜歡軟綿綿質地的人。","jpDetail":{"source":"アンゴラウサギの柔らかな毛から採れる繊維です。","process":"毛を櫛ですいたり刈り取ったりして採取し、選別・清浄します。短い繊維のため、羊毛や合成繊維と混紡することが多いです。","features":["非常に軽く柔らかい","保温性が高い","繊細で霧のような毛羽感がある"],"drawbacks":["毛が抜けやすい","繊維が短く、強度を補う混紡が必要なことが多い","引っ掛かりや摩擦による毛羽立ちが起こりやすい","お手入れに手間がかかる"],"care":"摩擦や頻繁な洗濯を避け、洗濯表示に従ってください。保管時は尖ったものに触れないようにします。","pitch":"ふわふわで軽く、柔らかな毛並みが魅力です。見た目にも優しい雰囲気を演出できます。"}},{"name":"蠶絲","jp":"シルク","en":"Silk","group":"天然纖維・動物性","source":"家蠶吐出的絲蛋白長纖維，形成繭絲。","process":"收繭 → 煮繭軟化絲膠 → 抽取、合併繭絲 → 合撚成絲線 → 織造。","features":["觸感滑順、光澤細緻","吸濕性佳","輕盈且有良好垂墜感","接觸皮膚時感覺柔和"],"drawbacks":["日光與汗液可能造成褪色或劣化","濕態時需避免強力摩擦","容易勾絲","部分品項需專業乾洗"],"care":"依洗標；避免曝曬、漂白與粗暴擰乾，香水或汗液盡量不要長時間停留。","pitch":"蠶絲有自然細緻的光澤，質地滑順又輕盈，穿起來很有垂墜感。","jpDetail":{"source":"蚕が繭を作る際に吐き出す、フィブロインを主成分とする長繊維です。","process":"繭を煮てセリシンを柔らかくし、繭糸を引き出して数本を合わせ、撚りをかけて糸にします。","features":["なめらかな肌触りと上品な光沢","吸湿性が高い","軽く、ドレープ性に優れる","肌に触れたときの感触が柔らかい"],"drawbacks":["日光や汗で変色・劣化する場合がある","濡れた状態で強く摩擦しない","引っ掛かりやすい","品物によっては専門クリーニングが必要"],"care":"洗濯表示に従い、直射日光・漂白・強い絞りを避けます。香水や汗が長時間付着しないようにしましょう。","pitch":"自然な上品な光沢となめらかさ、軽やかなドレープが魅力です。きれいめな装いにもよく合います。"}},{"name":"駱駝毛","jp":"キャメル","en":"Camel Hair","group":"天然纖維・動物性","source":"駱駝身上的底層細毛，常在換毛季採集。","process":"收集換毛纖維 → 分離粗毛與細毛 → 清洗、梳理 → 紡紗。","features":["輕盈保暖","觸感柔和（依纖維等級而異）","常見自然駝色","適合大衣與保暖針織"],"drawbacks":["價格可能較高","纖維細度不同，可能有刺感","容易受到摩擦與蟲蛀影響"],"care":"依洗標；大衣通常交由專業清潔，針織品避免吊掛變形。","pitch":"駱駝毛的保暖感很好，重量卻相對輕，經典駝色也很容易搭配。","jpDetail":{"source":"ラクダの下毛から採れる細い毛で、換毛期に採取されることがあります。","process":"換毛した毛を集め、粗い毛と細い毛を分けて洗浄・梳毛し、糸に紡ぎます。","features":["軽くて暖かい","繊維の品質によって柔らかな肌触り","自然なキャメル色が多い","コートや暖かなニットに適する"],"drawbacks":["価格が高めの場合がある","繊維の太さによってチクチクすることがある","摩擦や虫食いに注意が必要"],"care":"洗濯表示に従います。コートは専門クリーニング、ニットは型崩れ防止のため平置き保管がおすすめです。","pitch":"暖かいのに比較的軽く、定番のキャメルカラーも魅力です。上品で長く使いやすい素材です。"}},{"name":"牦牛絨","jp":"ヤク","en":"Yak Down","group":"天然纖維・動物性","source":"牦牛身上的細軟底絨。","process":"梳取或收集換毛底絨 → 分離粗毛 → 清洗、梳理 → 紡紗。","features":["柔軟、輕盈","保暖性佳","天然深色纖維常見","適合高級針織與混紡"],"drawbacks":["原料取得與分級較費工","價格通常較高","不同品質觸感差異明顯","需避免摩擦與不當洗滌"],"care":"依洗標；針織品平放晾乾，避免高溫與大力搓揉。","pitch":"牦牛絨兼具輕盈與保暖，天然色澤比較沉穩，適合喜歡低調質感的人。","jpDetail":{"source":"ヤクの体毛のうち、柔らかな下毛から採れる繊維です。","process":"下毛を櫛ですくなどして採取し、粗い毛を分けます。洗浄・梳毛後、糸に紡ぎます。","features":["柔らかく軽い","保温性に優れる","天然の濃色繊維が多い","上質なニットや混紡素材に使われる"],"drawbacks":["原料の採取や選別に手間がかかる","価格が高め","品質によって肌触りに差がある","摩擦や不適切な洗濯を避ける必要がある"],"care":"洗濯表示に従い、ニットは平干しします。高温や強い揉み洗いは避けてください。","pitch":"軽さと暖かさを兼ね備え、落ち着いた天然色も魅力です。控えめで上質な雰囲気がお好きな方におすすめです。"}},{"name":"嫘縈／人造絲","jp":"レーヨン","en":"Rayon / Viscose","group":"再生纖維・纖維素系","source":"木材紙漿或其他植物來源的纖維素；屬再生纖維，不是直接取出的天然纖維。","process":"將纖維素溶解或轉化成可紡液 → 經噴絲孔形成纖維 → 凝固、再生 → 洗淨與後處理。","features":["手感柔軟、垂墜感佳","吸濕性好","可呈現類似絲質的光澤","穿著觸感通常涼爽"],"drawbacks":["部分種類濕強度較低","容易皺、可能縮水或變形","洗滌方式需特別留意","不耐長時間潮濕與粗暴摩擦"],"care":"嚴格依洗標；不可自行假設可水洗，濕態避免拉扯。","pitch":"嫘縈的垂墜感很好，穿起來柔軟涼爽，能做出很漂亮的流動線條。","jpDetail":{"source":"木材パルプなど植物由来のセルロースを原料とする再生繊維です。天然繊維をそのまま取り出したものではありません。","process":"セルロースを溶解・化学変換して紡糸液を作り、ノズルから押し出します。凝固・再生・洗浄などを経て繊維になります。","features":["柔らかく、ドレープ性が高い","吸湿性に優れる","シルクのような光沢を表現できる","着用時に涼しく感じやすい"],"drawbacks":["種類によって濡れた状態の強度が低い","シワ・縮み・型崩れが起こる場合がある","洗濯方法に注意が必要","長時間の湿気や強い摩擦に弱い"],"care":"洗濯表示を必ず確認してください。水洗い可能と決めつけず、濡れた状態で引っ張らないようにします。","pitch":"落ち感が美しく、柔らかく涼しい着心地です。動きのあるきれいなシルエットを作れます。"}},{"name":"莫代爾","jp":"モダール","en":"Modal","group":"再生纖維・纖維素系","source":"以木材纖維素為原料的再生纖維素纖維，常見原料為山毛櫸等木材。","process":"木材製漿取得纖維素 → 以再生纖維素製程溶解紡絲 → 凝固再生 → 後整理。","features":["柔軟滑順","吸濕性佳","垂墜感好","適合貼身衣物與柔軟針織"],"drawbacks":["品質與耐洗性依製程和混紡而異","可能起毛球或變形","仍需依洗標照護"],"care":"依洗標使用溫和洗程；避免高溫烘乾與過度摩擦。","pitch":"莫代爾摸起來很滑順柔軟，吸濕性也不錯，適合喜歡親膚觸感的人。","jpDetail":{"source":"木材由来のセルロースを原料とする再生セルロース繊維で、ブナ材などが使われます。","process":"木材からパルプを作り、セルロースを溶解して紡糸します。凝固・再生後、仕上げ加工を行います。","features":["柔らかくなめらか","吸湿性に優れる","ドレープ性がよい","肌着や柔らかなニットに適する"],"drawbacks":["製法や混紡によって品質・耐洗濯性が異なる","毛玉や型崩れが起こる場合がある","洗濯表示に沿ったケアが必要"],"care":"洗濯表示に従い、優しい洗濯コースを使用します。高温乾燥や過度な摩擦は避けましょう。","pitch":"なめらかで柔らかく、吸湿性にも優れています。肌触りを重視する方におすすめです。"}},{"name":"天絲™萊賽爾","jp":"リヨセル（テンセル™）","en":"Lyocell (TENCEL™)","group":"再生纖維・纖維素系","source":"以木材纖維素製成的再生纖維；TENCEL™ 是品牌商標，Lyocell 是纖維類別。","process":"木材製漿取得纖維素 → 以溶劑直接溶解 → 濕式紡絲凝固成纖維 → 溶劑回收與後整理。","features":["柔軟、垂墜感佳","吸濕性佳","表面平滑、穿著舒適","常見製程有溶劑回收系統"],"drawbacks":["濕態摩擦可能造成表面起毛或白化（fibrillation）","不同整理與混紡會影響手感","仍可能皺或需要細心洗護"],"care":"依洗標；避免粗糙摩擦，反面洗滌或使用洗衣袋可降低磨損。","pitch":"萊賽爾的觸感滑順、垂墜自然，穿起來很舒服，也常用在柔軟有質感的單品。","jpDetail":{"source":"木材パルプ由来のセルロースから作られる再生繊維です。TENCEL™は商標名で、リヨセルは繊維の種類を指します。","process":"木材パルプからセルロースを取り出し、溶剤に直接溶かして湿式紡糸します。溶剤を回収しながら繊維を形成・仕上げます。","features":["柔らかく、ドレープ性がよい","吸湿性に優れる","表面がなめらかで快適","溶剤回収システムを用いる製法がある"],"drawbacks":["濡れた状態で摩擦すると毛羽立ちや白化（フィブリル化）が起こる場合がある","加工や混紡によって風合いが異なる","シワや丁寧なケアが必要な場合がある"],"care":"洗濯表示に従い、表面の粗い摩擦を避けます。裏返し洗いや洗濯ネットの使用も摩耗を抑えるのに役立ちます。","pitch":"なめらかな肌触りと自然な落ち感が魅力です。柔らかく上品な着心地を楽しめます。"}},{"name":"銅氨纖維","jp":"キュプラ","en":"Cupro","group":"再生纖維・纖維素系","source":"棉籽周圍短絨（棉籽絨／棉短絨）中的纖維素。","process":"取得棉短絨 → 以銅氨溶液溶解纖維素 → 濕式紡絲 → 凝固、洗淨與後處理。","features":["滑順細緻","吸濕、透氣","靜電感通常較低","常用於高級裡布與飄逸服裝"],"drawbacks":["濕態強度與耐磨表現需留意","容易勾絲或皺","保養需依洗標"],"care":"依洗標；避免擰扭與強力摩擦，精緻單品可交由專業清潔。","pitch":"銅氨纖維很滑順，常用在高級裡布，穿脫時也有很舒服的滑順感。","jpDetail":{"source":"綿実の周りにある短い綿毛（コットンリンター）に含まれるセルロースが原料です。","process":"綿リンターのセルロースを銅アンモニア溶液に溶かし、湿式紡糸します。凝固・洗浄・仕上げを経て繊維になります。","features":["なめらかで繊細な肌触り","吸湿性・通気性がある","静電気が起きにくい傾向","高級な裏地やドレープのある服に使われる"],"drawbacks":["濡れた状態の強度や摩耗に注意が必要","引っ掛かりやシワが生じやすい","洗濯表示に沿ったケアが必要"],"care":"洗濯表示に従い、ねじり絞りや強い摩擦を避けます。デリケートな品物は専門クリーニングを検討してください。","pitch":"とてもなめらかな肌触りが特徴で、高級な裏地にも使われます。袖を通すときの滑らかさも魅力です。"}},{"name":"醋酸纖維","jp":"アセテート","en":"Acetate","group":"半合成纖維・纖維素系","source":"植物纖維素經醋酸化學改質製成，屬纖維素衍生纖維。","process":"纖維素原料 → 醋酸化形成醋酸纖維素 → 溶液紡絲 → 溶劑揮發形成纖維。","features":["光澤接近絲質","垂墜感佳","手感滑順","不易像棉麻一樣大量吸水"],"drawbacks":["耐熱性較低，熨燙需小心","部分溶劑可能損傷纖維","強度與耐磨性依種類而異"],"care":"依洗標；遠離高溫，避免自行使用含丙酮等溶劑的去漬方式。","pitch":"醋酸纖維有漂亮的絲質光澤和垂墜感，適合想要優雅線條又不一定選真絲的客人。","jpDetail":{"source":"植物由来のセルロースを化学的にアセチル化して作る、セルロース誘導体繊維です。","process":"セルロースを酢酸化して酢酸セルロースにし、溶液紡糸します。溶剤を揮発させて繊維を形成します。","features":["シルクのような光沢","ドレープ性がよい","なめらかな手触り","綿や麻ほど水を吸いにくい"],"drawbacks":["熱に弱く、アイロンに注意が必要","一部の溶剤で損傷する場合がある","強度や耐摩耗性は種類によって異なる"],"care":"洗濯表示に従い、高温を避けます。アセトンなどの溶剤を使ったシミ抜きは避けてください。","pitch":"シルクのような光沢となめらかな落ち感が特徴です。上品なシルエットを楽しみたい方におすすめです。"}},{"name":"聚酯纖維","jp":"ポリエステル","en":"Polyester","group":"合成纖維","source":"主要由石化原料製成的聚合物；也有回收來源的聚酯。","process":"單體聚合成聚酯 → 熔融 → 經噴絲孔紡絲 → 拉伸定型 → 加工成紗線。","features":["不易皺、尺寸穩定","快乾、耐磨性通常不錯","容易保養","可製成多種手感與機能布料"],"drawbacks":["吸濕性較低，悶熱感依織法而異","容易產生靜電","可能吸附油污與異味","洗滌可能釋出微纖維"],"care":"依洗標；避免高溫熨燙，洗滌時可減少不必要的高頻率清洗。","pitch":"聚酯纖維的優點是好整理、不容易皺又快乾，日常穿著和旅行都很方便。","jpDetail":{"source":"主に石油由来原料から作られるポリマー繊維です。リサイクル原料を使うものもあります。","process":"原料を重合してポリエステルを作り、溶融紡糸・延伸・熱セットを経て糸にします。","features":["シワになりにくく、形が安定しやすい","速乾性があり、比較的摩耗に強い","お手入れしやすい","さまざまな風合いや機能性に加工できる"],"drawbacks":["吸湿性が低く、織り方によっては蒸れやすい","静電気が起きやすい","皮脂汚れやにおいが残る場合がある","洗濯時にマイクロファイバーが流出する可能性がある"],"care":"洗濯表示に従い、高温アイロンを避けます。必要以上に頻繁な洗濯を控えることも有効です。","pitch":"シワになりにくく乾きやすいため、お手入れが簡単です。普段使いや旅行にも便利な素材です。"}},{"name":"尼龍","jp":"ナイロン","en":"Nylon / Polyamide","group":"合成纖維","source":"由聚醯胺聚合物製成，常見原料來自石化，也有再生尼龍。","process":"聚合形成聚醯胺 → 熔融紡絲 → 拉伸定向 → 製成長絲或短纖。","features":["強度高、耐磨","輕量","彈性與回復性通常不錯","適合外套、機能服與包袋"],"drawbacks":["耐熱性有限","容易產生靜電","長期日曬可能劣化","依組織可能有悶熱或摩擦聲"],"care":"依洗標；避免高溫熨燙與長時間曝曬。","pitch":"尼龍很輕又耐磨，適合需要活動度、耐用度或輕量感的外套和機能單品。","jpDetail":{"source":"ポリアミド樹脂から作られる繊維で、石油由来のほかリサイクルナイロンもあります。","process":"ポリアミドを重合し、溶融紡糸・延伸して長繊維または短繊維にします。","features":["強度が高く、摩耗に強い","軽量","伸縮性や回復性が比較的高い","アウター・機能ウェア・バッグに適する"],"drawbacks":["熱に弱い","静電気が起きやすい","長時間の日光で劣化する場合がある","生地の構造によって蒸れや擦れる音が出ることがある"],"care":"洗濯表示に従い、高温アイロンと長時間の直射日光を避けてください。","pitch":"軽くて摩耗に強い素材です。動きやすさや耐久性、軽さを重視するアウターや機能アイテムに向いています。"}},{"name":"壓克力纖維","jp":"アクリル","en":"Acrylic","group":"合成纖維","source":"以丙烯腈為主要原料製成的合成纖維。","process":"聚合形成聚合物 → 溶液紡絲 → 凝固與拉伸 → 加工成短纖或長絲。","features":["輕盈、蓬鬆","保暖感佳","可模仿羊毛外觀與手感","容易染出鮮明色彩"],"drawbacks":["容易起毛球","可能產生靜電","吸濕性較低，容易悶熱","耐熱性較低，需避免高溫"],"care":"依洗標；避免高溫烘乾與熨燙，減少摩擦可降低起球。","pitch":"壓克力纖維輕盈蓬鬆，能做出類似羊毛的毛感，而且通常比較容易照顧。","jpDetail":{"source":"アクリロニトリルを主原料として作られる合成繊維です。","process":"ポリマーを作り、溶液紡糸・凝固・延伸を行い、短繊維や長繊維に加工します。","features":["軽くてふんわりしている","暖かさがある","ウールに似た見た目や風合いを表現できる","鮮やかに染色しやすい"],"drawbacks":["毛玉ができやすい","静電気が起きる場合がある","吸湿性が低く、蒸れやすい","熱に弱いため高温を避ける必要がある"],"care":"洗濯表示に従い、高温乾燥・アイロンを避けます。摩擦を減らすと毛玉の予防になります。","pitch":"軽くふんわりとしており、ウールのような毛足を表現できます。比較的お手入れしやすい素材です。"}},{"name":"彈性纖維／聚氨酯","jp":"ポリウレタン／スパンデックス","en":"Elastane / Spandex","group":"合成纖維","source":"以聚氨酯為基礎的高彈性合成纖維，常以少量混紡增加伸縮性。","process":"製成聚氨酯聚合物 → 溶液紡絲等方式形成彈性長絲 → 拉伸加工 → 與其他纖維混紡。","features":["伸縮性非常好","回復性佳","少量添加即可改善活動舒適度","常見於牛仔褲、貼身衣物與運動服"],"drawbacks":["長期高溫、氯水、汗液與日曬可能加速彈性衰退","比例過高可能較貼身","不適合高溫熨燙或烘乾"],"care":"依洗標；避免高溫烘乾、熨燙與長時間浸泡含氯水。","pitch":"這件有加入彈性纖維，活動時比較自在，坐下或抬手也不容易有緊繃感。","jpDetail":{"source":"ポリウレタンをベースにした伸縮性の高い合成繊維です。少量を混紡して伸縮性を加えます。","process":"ポリウレタンを作り、溶液紡糸などで弾性フィラメントにします。延伸加工後、他の繊維と組み合わせます。","features":["伸縮性が非常に高い","元に戻る力が強い","少量の混紡で動きやすさが向上する","デニム・肌着・スポーツウェアなどに使われる"],"drawbacks":["高温・塩素水・汗・日光で弾力が劣化する場合がある","配合率が高いと身体に密着しやすい","高温アイロンや乾燥機に不向き"],"care":"洗濯表示に従い、高温乾燥・アイロンや塩素水への長時間の浸漬を避けてください。","pitch":"ストレッチ素材が入っているので、座ったり腕を上げたりするときも動きやすく、快適に過ごせます。"}},{"name":"再生聚酯","jp":"リサイクルポリエステル","en":"Recycled Polyester","group":"合成纖維","source":"回收 PET 瓶或聚酯紡織品等來源，依供應鏈而異。","process":"回收材料分類清潔 → 破碎與熔融再製，或化學解聚再聚合 → 紡絲製成纖維。","features":["保留聚酯常見的快乾與耐皺特性","可利用回收原料","可用於服裝、填充物與機能布料"],"drawbacks":["回收來源與品質追溯需看認證及供應鏈","仍可能釋出微纖維","不代表產品整體一定低環境衝擊"],"care":"依洗標；可減少不必要清洗與高磨擦洗程。","pitch":"這款使用再生聚酯纖維，把回收材料再製成布料，同時保有聚酯快乾、好整理的特性。","jpDetail":{"source":"回収されたPETボトルやポリエステル製品などを原料とします。原料は供給経路によって異なります。","process":"回収品を選別・洗浄・粉砕し、溶融再生または化学的に分解・再重合して紡糸します。","features":["ポリエステルの速乾性や防シワ性を活かせる","回収原料を再利用できる","衣料・中綿・機能素材などに使われる"],"drawbacks":["回収元や品質の追跡には認証・供給網の確認が必要","マイクロファイバーが流出する可能性がある","製品全体の環境負荷が必ず低いとは限らない"],"care":"洗濯表示に従い、必要以上の洗濯や摩擦の強い洗い方を避けましょう。","pitch":"回収素材を再び繊維として活用しながら、ポリエステルの速乾性や扱いやすさを備えています。"}},{"name":"黃麻","jp":"ジュート","en":"Jute","group":"天然纖維・植物性","source":"黃麻植物莖部的韌皮纖維。","process":"收割莖部 → 浸漚分離纖維 → 洗淨、乾燥 → 紡紗或製成粗布。","features":["植物來源","纖維粗、挺度明顯","透氣且具天然外觀","常用於袋材、家飾與混紡"],"drawbacks":["觸感較粗，不適合多數貼身服裝","吸水後乾燥較慢","耐洗性與柔軟度有限"],"care":"避免長時間浸水；依產品洗標清潔，通常不適合頻繁水洗。","pitch":"黃麻的質地比較粗獷，常用在有自然感的配件或家居用品，不是典型貼身衣料。","jpDetail":{"source":"ジュート植物の茎から採れる靭皮繊維です。","process":"茎を収穫して浸水し、繊維を分離します。洗浄・乾燥後、糸や粗い布に加工します。","features":["植物由来の繊維","太く、しっかりした風合い","通気性があり、自然な見た目","バッグやインテリア、混紡素材に使われる"],"drawbacks":["肌触りが粗く、肌に直接触れる衣服には不向きなことが多い","水を含むと乾きにくい","洗濯耐久性や柔らかさに限界がある"],"care":"長時間水に浸さないでください。製品の洗濯表示に従い、頻繁な水洗いは避けるのが一般的です。","pitch":"素朴で粗めの風合いが特徴です。自然な雰囲気のバッグやインテリア小物などによく使われます。"}}];

// 材質資料
function MaterialsTextTab(){
  const [items,setItems]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);

  const extract=async()=>{
    if(!input.trim())return;
    setLoading(true);
    try{
      const text=await callAI(`你是服飾業專家。根據以下材質相關文字，整理材質資訊。只輸出JSON陣列：\n\n${input}\n\n格式：[{"name_zh":"中文名","name_jp":"日文名","name_en":"英文名","features":["特性1","特性2","特性3"],"sales_pitch":"向客人介紹的一句話（口語化）","care":"保養建議","seasons":["春","夏"]}]\n\n如果有多個材質分開整理。特性要具體實用。`);
      const clean=text.replace(/\`\`\`json|\`\`\`/g,"").trim();
      const arr=JSON.parse(clean);
      setItems(p=>[...arr.map(w=>({...w,id:Date.now()+Math.random(),date:new Date().toISOString().slice(0,10)})),...p]);
      setInput("");
    }catch(e){alert("整理失敗，請再試一次");}
    finally{setLoading(false);}
  };

  const SEASON_C={春:"#a0c870",夏:"#70a0c8",秋:"#c8a070",冬:"#8070c8"};

  return(
    <div>
      <Card accent={sage}>
        <SectionLabel label="貼入材質文字 · AI 整理" accent={sage}/>
        <div style={{fontSize:"11px",color:sage,background:"#f0f4f2",borderRadius:"8px",padding:"8px 10px",marginBottom:"10px"}}>貼入材質說明、成分標籤文字，AI 整理成資料卡</div>
        <Inp value={input} onChange={setInput} placeholder="例：ウール 羊毛 保暖透氣 不易起皺 建議乾洗…" multi/>
        <button onClick={extract} disabled={loading||!input.trim()} style={{width:"100%",padding:"10px",background:loading||!input.trim()?C.border:sage,border:"none",color:"white",borderRadius:"10px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit",marginTop:"8px"}}>
          {loading?"整理中…":"▶ 整理材質資料"}
        </button>
      </Card>

      {items.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:C.sub,fontSize:"13px"}}><div style={{fontSize:"28px",marginBottom:"8px"}}>🧵</div>貼入材質文字，自動整理成資料卡</div>}
      {items.map(item=>(
        <div key={item.id} style={{background:C.card,borderRadius:"14px",marginBottom:"10px",border:`1px solid ${C.border}`,borderTop:`3px solid ${sage}`,padding:"14px"}}>
          <div style={{fontSize:"18px",fontWeight:700,color:C.dark,marginBottom:"2px"}}>{item.name_zh}</div>
          <div style={{display:"flex",gap:"6px",marginBottom:"8px",flexWrap:"wrap"}}>
            {item.name_jp&&<span style={{fontSize:"12px",color:C.sub}}>{item.name_jp}</span>}
            {item.name_en&&<span style={{fontSize:"11px",color:"#aaa"}}>{item.name_en}</span>}
          </div>
          {item.sales_pitch&&<div style={{background:"#f0faf4",borderRadius:"8px",padding:"9px 12px",marginBottom:"10px",borderLeft:`3px solid ${sage}`}}>
            <div style={{fontSize:"10px",color:sage,fontWeight:700,marginBottom:"3px"}}>銷售話術</div>
            <div style={{fontSize:"13px",color:C.text,fontStyle:"italic"}}>「{item.sales_pitch}」</div>
          </div>}
          {item.features?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"8px"}}>
            {item.features.map((f,i)=><span key={i} style={{fontSize:"11px",padding:"3px 9px",background:"#e8f4ec",borderRadius:"10px",color:sage}}>{f}</span>)}
          </div>}
          <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
            {item.seasons?.map((s,i)=><span key={i} style={{fontSize:"10px",padding:"2px 7px",background:`${SEASON_C[s]||"#aaa"}22`,borderRadius:"10px",color:SEASON_C[s]||C.sub}}>{s}</span>)}
            {item.care&&<span style={{fontSize:"10px",color:C.sub,marginLeft:"auto"}}>🧺 {item.care}</span>}
          </div>
          <button onClick={()=>setItems(p=>p.filter(x=>x.id!==item.id))} style={{width:"100%",padding:"6px",background:"transparent",border:"1px solid #f0d0cc",color:C.fail,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit",marginTop:"10px"}}>🗑 刪除</button>
        </div>
      ))}
    </div>
  );
}

// 穿搭話術
function StylingTextTab(){
  const [items,setItems]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);

  const extract=async()=>{
    if(!input.trim())return;
    setLoading(true);
    try{
      const text=await callAI(`你是服飾業資深店員。根據以下穿搭描述，生成實用的銷售話術資料。只輸出JSON：\n\n${input}\n\n格式：{"style":"穿搭風格","key_pieces":["單品1","單品2"],"color_scheme":"配色","suitable_for":["場合1","場合2"],"body_effect":"修身效果","pitches":["話術1","話術2","話術3"],"jp_phrases":[{"jp":"日文話術","zh":"中文意思"}]}\n\n話術要口語化，像真正店員說的。`);
      const clean=text.replace(/\`\`\`json|\`\`\`/g,"").trim();
      const item=JSON.parse(clean);
      setItems(p=>[{...item,id:Date.now(),date:new Date().toISOString().slice(0,10)},...p]);
      setInput("");
    }catch(e){alert("生成失敗，請再試一次");}
    finally{setLoading(false);}
  };

  return(
    <div>
      <Card accent={rose}>
        <SectionLabel label="描述穿搭 · AI 生成話術" accent={rose}/>
        <div style={{fontSize:"11px",color:rose,background:"#fdf0f2",borderRadius:"8px",padding:"8px 10px",marginBottom:"10px"}}>描述一套穿搭或貼入穿搭文字，AI 生成推薦話術</div>
        <Inp value={input} onChange={setInput} placeholder="例：米色針織外套 + 高腰寬褲，韓系風格，適合上班或約會…" multi/>
        <button onClick={extract} disabled={loading||!input.trim()} style={{width:"100%",padding:"10px",background:loading||!input.trim()?C.border:rose,border:"none",color:"white",borderRadius:"10px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit",marginTop:"8px"}}>
          {loading?"生成中…":"▶ 生成穿搭話術"}
        </button>
      </Card>

      {items.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:C.sub,fontSize:"13px"}}><div style={{fontSize:"28px",marginBottom:"8px"}}>👗</div>描述穿搭，自動生成推薦話術</div>}
      {items.map(item=>(
        <div key={item.id} style={{background:C.card,borderRadius:"14px",marginBottom:"10px",border:`1px solid ${C.border}`,borderTop:`3px solid ${rose}`,overflow:"hidden"}}>
          <div style={{padding:"14px 14px 10px"}}>
            <div style={{fontSize:"16px",fontWeight:700,color:C.dark,marginBottom:"4px"}}>{item.style}</div>
            {item.color_scheme&&<div style={{fontSize:"11px",color:C.sub,marginBottom:"6px"}}>🎨 {item.color_scheme}</div>}
            {item.key_pieces?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"6px"}}>
              {item.key_pieces.map((p,i)=><span key={i} style={{fontSize:"10px",padding:"2px 8px",background:C.goldLight,borderRadius:"10px",color:"#8a6830"}}>{p}</span>)}
            </div>}
            {item.body_effect&&<div style={{fontSize:"11px",color:C.sub,fontStyle:"italic"}}>{item.body_effect}</div>}
          </div>
          {item.pitches?.length>0&&<div style={{padding:"0 14px 10px"}}>
            <div style={{fontSize:"10px",color:rose,fontWeight:700,marginBottom:"6px",letterSpacing:"0.08em"}}>推薦話術</div>
            {item.pitches.map((p,i)=><div key={i} style={{background:"#fdf0f2",borderRadius:"8px",padding:"9px 12px",marginBottom:"6px",borderLeft:`3px solid ${rose}`}}>
              <div style={{fontSize:"13px",color:C.text,lineHeight:"1.65",fontStyle:"italic"}}>「{p}」</div>
            </div>)}
          </div>}
          {item.suitable_for?.length>0&&<div style={{padding:"0 14px 10px"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
              {item.suitable_for.map((s,i)=><span key={i} style={{fontSize:"11px",padding:"3px 9px",background:"#fde8ec",borderRadius:"10px",color:rose}}>{s}</span>)}
            </div>
          </div>}
          {item.jp_phrases?.length>0&&<div style={{padding:"0 14px 10px"}}>
            <div style={{fontSize:"10px",color:navy,fontWeight:700,marginBottom:"6px"}}>日文話術</div>
            {item.jp_phrases.map((p,i)=><div key={i} style={{display:"flex",gap:"8px",marginBottom:"5px",background:"#f0f2f8",borderRadius:"8px",padding:"7px 10px",alignItems:"baseline"}}>
              <div style={{fontSize:"13px",color:navy,fontWeight:600,flexShrink:0}}>{p.jp}</div>
              <div style={{fontSize:"11px",color:C.sub}}>{p.zh}</div>
            </div>)}
          </div>}
          <div style={{padding:"0 14px 12px"}}>
            <button onClick={()=>setItems(p=>p.filter(x=>x.id!==item.id))} style={{width:"100%",padding:"6px",background:"transparent",border:"1px solid #f0d0cc",color:C.fail,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>🗑 刪除</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PhrasesBankTextVersion({records}){
  const [sub,setSub]=useState("my");
  const SUBS=[["my","💬 我的話術",C.gold],["jp","🈳 日文單詞",navy],["mat","🧵 材質資料",sage],["style","👗 穿搭話術",rose]];
  return(
    <div>
      {/* Sub tabs */}
      <div style={{display:"flex",gap:"0",marginBottom:"14px",background:C.dark,borderRadius:"12px",padding:"4px",overflowX:"auto"}}>
        {SUBS.map(([id,label,accent])=>(
          <button key={id} onClick={()=>setSub(id)} style={{flexShrink:0,flex:1,padding:"8px 4px",background:sub===id?accent:"transparent",border:"none",color:sub===id?"#fff":"#6a6058",fontSize:"11px",cursor:"pointer",fontFamily:"inherit",borderRadius:"8px",transition:"all .15s",whiteSpace:"nowrap"}}>{label}</button>
        ))}
      </div>
      {sub==="my"&&<MyPhrasesTab records={records}/>}
      {sub==="jp"&&<JpWordsTab/>}
      {sub==="mat"&&<MaterialsTab/>}
      {sub==="style"&&<StylingTab/>}
    </div>
  );
}

// Each phrase-bank category keeps both input methods available.
function ModeTabs({mode,onChange}){
  return <div style={{display:"flex",gap:"6px",marginBottom:"10px"}}>
    {[ ["image","圖片分析"], ["text","文字整理"] ].map(([value,label])=>(
      <button key={value} onClick={()=>onChange(value)} style={{flex:1,padding:"7px",border:`1px solid ${mode===value?C.gold:C.border}`,background:mode===value?C.goldLight:"transparent",color:mode===value?C.dark:C.sub,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>{label}</button>
    ))}
  </div>;
}
function MyPhrasesTab({records}){
  const [mode,setMode]=useState("image");
  return <div><ModeTabs mode={mode} onChange={setMode}/>{mode==="image"?<MyPhrasesImageTab records={records}/>:<MyPhrasesTextTab records={records}/>}</div>;
}
function JpWordsTab(){
  const [mode,setMode]=useState("image");
  return <div><ModeTabs mode={mode} onChange={setMode}/>{mode==="image"?<JpWordsImageTab/>:<JpWordsTextTab/>}</div>;
}
function MaterialsTab(){
  const [mode,setMode]=useState("guide");
  const [query,setQuery]=useState("");
  const [group,setGroup]=useState("全部");
  const [opened,setOpened]=useState(null);
  const groups=["全部","天然纖維・植物性","天然纖維・動物性","再生纖維・纖維素系","半合成纖維・纖維素系","合成纖維"];
  const groupJP={"全部":"すべて","天然纖維・植物性":"天然繊維・植物性","天然纖維・動物性":"天然繊維・動物性","再生纖維・纖維素系":"再生繊維・セルロース系","半合成纖維・纖維素系":"半合成繊維・セルロース系","合成纖維":"合成繊維"};
  const labels=[["纖維來源","繊維の原料"],["怎麼製作","製造工程"],["主要特性","主な特徴"],["缺點／注意事項","デメリット・注意点"],["保養方式","お手入れ方法"],["接客時可以這樣介紹","接客での紹介例"]];
  const filtered=MATERIAL_GUIDE.filter(m=>(group==="全部"||m.group===group)&&
    [m.name,m.jp,m.en,m.group,m.source,m.features.join(" "),m.drawbacks.join(" "),m.jpDetail.source,m.jpDetail.features.join(" ")].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  const detail=(m,label,idx)=>{
    const zh=[m.source,m.process,m.features,m.drawbacks,m.care,m.pitch][idx];
    const ja=[m.jpDetail.source,m.jpDetail.process,m.jpDetail.features,m.jpDetail.drawbacks,m.jpDetail.care,m.jpDetail.pitch][idx];
    return <div key={label} style={{marginTop:"14px"}}>
      <div style={{fontSize:"12px",fontWeight:700,color:sage,marginBottom:"7px"}}>{label} <span style={{fontWeight:500,color:C.sub}}>／ {labels[idx][1]}</span></div>
      {Array.isArray(zh)?<div style={{display:"grid",gap:"7px"}}>{zh.map((v,i)=><div key={i} style={{fontSize:"12px",color:C.text,lineHeight:1.65,paddingLeft:"10px",borderLeft:`2px solid ${sage}`}}>{v}<div style={{fontSize:"11px",color:C.sub,marginTop:"2px"}}>{ja[i]}</div></div>)}</div>:<div style={{fontSize:"12px",color:C.text,lineHeight:1.75}}>{zh}<div style={{fontSize:"11px",color:C.sub,lineHeight:1.7,marginTop:"4px"}}>{ja}</div></div>}
    </div>;
  };
  return <div>
    <div style={{display:"flex",gap:"6px",marginBottom:"10px"}}>
      {[["guide","📖 材質小冊子"],["image","圖片分析"],["text","文字整理"]].map(([value,label])=>(
        <button key={value} onClick={()=>setMode(value)} style={{flex:1,padding:"8px 4px",border:`1px solid ${mode===value?C.gold:C.border}`,background:mode===value?C.goldLight:"transparent",color:mode===value?C.dark:C.sub,borderRadius:"8px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>{label}</button>
      ))}
    </div>
    {mode==="guide"?<div>
      <Card accent={sage}>
        <SectionLabel label="服裝材質速查手冊 ／ 素材ハンドブック" accent={sage}/>
        <div style={{fontSize:"11px",color:C.sub,lineHeight:1.7,marginBottom:"10px"}}>小卡片先看基本優缺點，點進去查看完整介紹。所有材質說明均附日文翻譯。</div>
        <Inp value={query} onChange={setQuery} placeholder="搜尋材質：羊毛、透氣、ウール、通気性…"/>
        <div style={{display:"flex",gap:"6px",overflowX:"auto",padding:"9px 0 2px"}}>
          {groups.map(g=><button key={g} onClick={()=>setGroup(g)} style={{whiteSpace:"nowrap",padding:"6px 9px",border:`1px solid ${group===g?sage:C.border}`,background:group===g?"#edf4ef":"white",color:group===g?sage:C.sub,borderRadius:"18px",fontSize:"10px",cursor:"pointer",fontFamily:"inherit"}}>{g}<span style={{marginLeft:"4px",opacity:.7}}>{groupJP[g]}</span></button>)}
        </div>
        <div style={{fontSize:"10px",color:C.sub,marginTop:"5px"}}>共 {filtered.length} 種材質 ／ {filtered.length}種類</div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:"9px",marginTop:"10px"}}>
        {filtered.map(m=><button key={m.name} onClick={()=>setOpened(m)} style={{minWidth:0,textAlign:"left",background:C.card,border:`1px solid ${C.border}`,borderRadius:"12px",padding:"11px 10px",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 2px 6px rgba(0,0,0,.035)"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"4px"}}>
            <div style={{fontSize:"14px",fontWeight:750,color:C.dark,lineHeight:1.3}}>{m.name}</div>
            <span style={{fontSize:"11px",color:sage,flexShrink:0}}>↗</span>
          </div>
          <div style={{fontSize:"10px",color:C.sub,marginTop:"3px",lineHeight:1.4,minHeight:"27px"}}>{m.jp}<br/>{m.en}</div>
          <div style={{height:"1px",background:C.border,margin:"8px 0"}}/>
          <div style={{fontSize:"10px",fontWeight:700,color:C.success,marginBottom:"4px"}}>＋ 優點 ／ メリット</div>
          <div style={{fontSize:"10px",color:C.text,lineHeight:1.5,minHeight:"30px"}}>{m.features.slice(0,2).map((v,i)=><div key={i}>{v}<div style={{fontSize:"9px",color:C.sub}}>{m.jpDetail.features[i]}</div></div>)}</div>
          <div style={{fontSize:"10px",fontWeight:700,color:C.fail,margin:"7px 0 4px"}}>－ 缺點 ／ デメリット</div>
          <div style={{fontSize:"10px",color:C.text,lineHeight:1.5,minHeight:"30px"}}>{m.drawbacks.slice(0,2).map((v,i)=><div key={i}>{v}<div style={{fontSize:"9px",color:C.sub}}>{m.jpDetail.drawbacks[i]}</div></div>)}</div>
          <div style={{fontSize:"9px",color:C.sub,marginTop:"8px",paddingTop:"6px",borderTop:`1px solid ${C.border}`}}>點擊查看完整介紹 ／ 詳細を見る</div>
        </button>)}
      </div>
      {filtered.length===0&&<div style={{textAlign:"center",padding:"28px",fontSize:"12px",color:C.sub}}>找不到符合的材質，試試其他關鍵字。</div>}
      <div style={{fontSize:"10px",color:C.sub,lineHeight:1.7,padding:"10px 3px"}}>小提醒：同一種纖維會因纖維細度、紗線、織法、染整與混紡比例而有不同手感及性能。實際商品請以成分標籤與洗標為準。<br/>同じ繊維でも、繊維の太さ・糸・織り方・染色加工・混紡率によって風合いや性能は異なります。実際の商品は品質表示・洗濯表示をご確認ください。</div>
      {opened&&<div onClick={()=>setOpened(null)} style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(20,25,22,.58)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"12px"}}>
        <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:"620px",maxHeight:"88vh",overflowY:"auto",background:C.card,borderRadius:"18px",padding:"18px 16px 24px",boxShadow:"0 12px 40px rgba(0,0,0,.25)"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"12px"}}>
            <div>
              <div style={{fontSize:"19px",fontWeight:750,color:C.dark}}>{opened.name}</div>
              <div style={{fontSize:"12px",color:C.sub,marginTop:"3px"}}>{opened.jp} · {opened.en}</div>
              <div style={{fontSize:"10px",color:sage,marginTop:"5px"}}>{opened.group} ／ {groupJP[opened.group]||""}</div>
            </div>
            <button onClick={()=>setOpened(null)} style={{border:0,background:C.goldLight,color:C.dark,borderRadius:"20px",width:"32px",height:"32px",fontSize:"18px",cursor:"pointer",flexShrink:0}}>×</button>
          </div>
          <div style={{height:"1px",background:C.border,marginTop:"14px"}}/>
          {labels.map(([label],idx)=>detail(opened,label,idx))}
          <div style={{marginTop:"16px",textAlign:"center"}}>
            <button onClick={()=>setOpened(null)} style={{padding:"9px 26px",border:0,borderRadius:"20px",background:C.gold,color:C.dark,fontSize:"12px",fontWeight:700,cursor:"pointer"}}>關閉 ／ 閉じる</button>
          </div>
        </div>
      </div>}
    </div>:mode==="image"?<MaterialsImageTab/>:<MaterialsTextTab/>}
  </div>;
}
function StylingTab(){
  const [mode,setMode]=useState("image");
  return <div><ModeTabs mode={mode} onChange={setMode}/>{mode==="image"?<StylingImageTab/>:<StylingTextTab/>}</div>;
}

// ── STATS ─────────────────────────────────────────────────────────────────────
function Stats({records}){
  const total=records.length;
  const success=records.filter(r=>r.result==="success");
  const rate=total?Math.round((success.length/total)*100):0;
  const periodSales={};success.forEach(r=>{periodSales[r.period]=(periodSales[r.period]||0)+1;});
  const typeData={};records.forEach(r=>{if(!r.customer_type)return;const t=r.customer_type[0];if(!typeData[t])typeData[t]={total:0,success:0};typeData[t].total++;if(r.result==="success")typeData[t].success++;});
  const upsellRecs=success.filter(r=>r.item_count>=2);
  const upsellRate=success.length?Math.round((upsellRecs.length/success.length)*100):0;
  const avgItems=success.length?(success.reduce((s,r)=>s+(r.item_count||1),0)/success.length).toFixed(1):0;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"10px"}}>
        {[["接客",total,C.gold],["成交",success.length,C.success],["成交率",`${rate}%`,C.purple]].map(([l,v,c])=>(
          <div key={l} style={{background:C.card,borderRadius:"12px",padding:"12px 8px",textAlign:"center",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:"22px",fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:"10px",color:C.sub,letterSpacing:"0.06em",marginTop:"1px"}}>{l}</div>
          </div>
        ))}
      </div>
      <Card accent={C.purple}>
        <SectionLabel label="連帶銷售分析" accent={C.purple}/>
        <div style={{display:"flex",gap:"16px"}}>
          {[["連帶率",`${upsellRate}%`,C.purple],["平均件數",avgItems,C.purple],["連帶筆數",upsellRecs.length,C.gold]].map(([l,v,c])=>(
            <div key={l} style={{flex:1,textAlign:"center"}}><div style={{fontSize:"20px",fontWeight:700,color:c}}>{v}</div><div style={{fontSize:"9px",color:C.sub,marginTop:"2px"}}>{l}</div></div>
          ))}
        </div>
      </Card>
      {Object.keys(periodSales).length>0&&<Card><SectionLabel label="哪個時段成交最多？" accent={C.gold}/>{Object.entries(periodSales).sort((a,b)=>b[1]-a[1]).map(([p,n])=><div key={p} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}><div style={{fontSize:"12px",color:C.text,width:"36px"}}>{p}</div><div style={{flex:1,height:"6px",background:C.border,borderRadius:"3px"}}><div style={{height:"100%",width:`${(n/Math.max(...Object.values(periodSales)))*100}%`,background:C.gold,borderRadius:"3px"}}/></div><div style={{fontSize:"12px",color:C.gold,fontWeight:600,width:"20px",textAlign:"right"}}>{n}</div></div>)}</Card>}
      {Object.keys(typeData).length>0&&<Card><SectionLabel label="哪種客人最容易成交？" accent={C.success}/>{Object.entries(typeData).sort((a,b)=>b[1].success/b[1].total-a[1].success/a[1].total).map(([t,d])=>{const pct=Math.round((d.success/d.total)*100);const tc={A:C.success,B:"#7090c0",C:C.fail,D:C.purple};return(<div key={t} style={{marginBottom:"10px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{fontSize:"11px",color:C.sub}}>{t}型</span><span style={{fontSize:"11px",fontWeight:600,color:tc[t]||C.gold}}>{pct}%（{d.success}/{d.total}）</span></div><div style={{height:"5px",background:C.border,borderRadius:"3px"}}><div style={{height:"100%",width:`${pct}%`,background:tc[t]||C.gold,borderRadius:"3px"}}/></div></div>);})}</Card>}
    </div>
  );
}

// ── CALENDAR VIEW ────────────────────────────────────────────────────────────
function CalendarView({records}){
  const today=new Date();
  const [year,setYear]=useState(today.getFullYear());
  const [month,setMonth]=useState(today.getMonth());
  const [selected,setSelected]=useState(null);
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const MONTH_JP=["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const DAYS=["日","一","二","三","四","五","六"];
  const byDate={};records.forEach(r=>{if(!byDate[r.date])byDate[r.date]=[];byDate[r.date].push(r);});
  const prevMonth=()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);setSelected(null);};
  const nextMonth=()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);setSelected(null);};
  const selectedDate=selected?`${year}-${String(month+1).padStart(2,"0")}-${String(selected).padStart(2,"0")}`:null;
  const selectedRecs=selectedDate?(byDate[selectedDate]||[]):[];
  return(
    <div>
      <Card accent={C.gold}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <button onClick={prevMonth} style={{background:"transparent",border:"none",fontSize:"18px",cursor:"pointer",color:C.sub,padding:"4px 8px"}}>‹</button>
          <div style={{fontSize:"15px",fontWeight:700,color:C.text}}>{year}年 {MONTH_JP[month]}</div>
          <button onClick={nextMonth} style={{background:"transparent",border:"none",fontSize:"18px",cursor:"pointer",color:C.sub,padding:"4px 8px"}}>›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"2px",marginBottom:"4px"}}>
          {DAYS.map((d,i)=><div key={d} style={{textAlign:"center",fontSize:"10px",color:i===0?"#c07070":i===6?"#7090c0":C.sub,padding:"2px 0"}}>{d}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"2px"}}>
          {[...Array(firstDay)].map((_,i)=><div key={`e${i}`}/>)}
          {[...Array(daysInMonth)].map((_,i)=>{
            const d=i+1;
            const dateStr=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const recs=byDate[dateStr]||[];
            const successes=recs.filter(r=>r.result==="success").length;
            const fails=recs.filter(r=>r.result==="fail").length;
            const isToday=dateStr===TODAY;
            const isSel=selected===d;
            const hasData=recs.length>0;
            return(
              <div key={d} onClick={()=>setSelected(isSel?null:d)} style={{textAlign:"center",padding:"4px 2px",borderRadius:"8px",cursor:hasData?"pointer":"default",background:isSel?C.dark:isToday?C.goldLight:"transparent",border:isToday&&!isSel?`1.5px solid ${C.gold}`:"1.5px solid transparent"}}>
                <div style={{fontSize:"12px",fontWeight:isToday||isSel?700:400,color:isSel?"#f5ead8":isToday?C.gold:C.text,marginBottom:"2px"}}>{d}</div>
                {hasData?<div style={{display:"flex",justifyContent:"center",gap:"2px"}}>{successes>0&&<div style={{width:"5px",height:"5px",borderRadius:"50%",background:C.success}}/>}{fails>0&&<div style={{width:"5px",height:"5px",borderRadius:"50%",background:C.fail}}/>}</div>:<div style={{height:"7px"}}/>}
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",gap:"12px",justifyContent:"flex-end",marginTop:"10px"}}>
          {[[C.success,"成交"],[C.fail,"未成交"]].map(([c,l])=><div key={l} style={{display:"flex",alignItems:"center",gap:"4px"}}><div style={{width:"6px",height:"6px",borderRadius:"50%",background:c}}/><span style={{fontSize:"10px",color:C.sub}}>{l}</span></div>)}
        </div>
      </Card>
      {selected&&<Card><SectionLabel label={`${month+1}/${selected} の接客`} accent={C.gold}/>{selectedRecs.length===0?<div style={{fontSize:"13px",color:C.sub,textAlign:"center",padding:"12px 0"}}>當天沒有記錄</div>:selectedRecs.map((r,i)=><div key={i} style={{borderLeft:`3px solid ${r.result==="success"?C.success:C.fail}`,paddingLeft:"10px",marginBottom:"12px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}><span style={{fontSize:"12px",fontWeight:600,color:C.text}}>{r.period} · {r.language}</span><span style={{fontSize:"12px",fontWeight:700,color:r.result==="success"?C.success:C.fail}}>{r.result==="success"?`✔ ${numFmt(r.amount)}`:"✘ 未成交"}</span></div><div style={{fontSize:"11px",color:C.sub,marginBottom:"3px"}}>{r.style?.join("·")||"—"} · {r.customer_type}型</div>{r.key_sentence&&<div style={{fontSize:"12px",color:C.text,fontStyle:"italic",lineHeight:"1.5"}}>「{r.key_sentence}」</div>}{r.redo&&<div style={{fontSize:"12px",color:C.fail,lineHeight:"1.5"}}>複盤：{r.redo}</div>}</div>)}</Card>}
    </div>
  );
}

// ── AI REVIEW ─────────────────────────────────────────────────────────────────
function AIReview({records}){
  const [loading,setLoading]=useState(false);
  const [review,setReview]=useState(null);
  const [error,setError]=useState(null);
  const [scope,setScope]=useState("today");
  const yesterday=new Date(Date.now()-86400000).toISOString().split("T")[0];
  const getRecords=()=>{if(scope==="today")return records.filter(r=>r.date===TODAY);if(scope==="yesterday")return records.filter(r=>r.date===yesterday);const weekAgo=new Date(Date.now()-7*86400000).toISOString().split("T")[0];return records.filter(r=>r.date>=weekAgo);};
  const buildPrompt=recs=>{if(recs.length===0)return null;const summary=recs.map((r,i)=>{const items=r.items?.filter(i=>i.name).map(i=>i.name).join("、")||r.products||"未記錄";return`【接客${i+1}】${r.period||""} · ${r.language||""} · ${r.customer_type||"?"}型 · 情緒:${r.mood||"未記"} · 推薦:${items} · 第一次接近:${r.first_approach||"未記"}/${r.first_reaction||"未記"}「${r.opening_line||""}」 · 第二次接近:${r.second_approach||"未記"}/${r.second_reaction||"未記"}「${r.second_approach_line||""}」 · 後續提案:${r.followup_approach||"未記"}/${r.followup_reaction||"未記"} · 結果:${r.result==="success"?`成交¥${r.amount}(${(Array.isArray(r.buy_reason)?r.buy_reason.join("、"):r.buy_reason)||"未記"})，話術:"${r.key_sentence||""}"`:`未成交(${(Array.isArray(r.no_buy_reason)?r.no_buy_reason.join("、"):r.no_buy_reason)||"未記"})，複盤:"${r.redo||"未記"}"`}`}).join("\n");return`你是服飾業資深銷售顧問，請用繁體中文複盤以下接客記錄。\n\n${summary}\n\n請按格式回覆（簡短有力）：\n\n**✦ 今日表現亮點**\n（1-2點具體做得好的地方）\n\n**✦ 最需要改善的一件事**\n（最關鍵弱點＋具體改善方法）\n\n**✦ 話術升級建議**\n（1-2句更好的說法）\n\n**✦ 明天的一個小實驗**\n（一個明天可以馬上試的具體行動）`;};
  const runReview=async()=>{const recs=getRecords();if(recs.length===0){setError("這個範圍內沒有記錄");return;}setLoading(true);setReview(null);setError(null);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:buildPrompt(recs)}]})});const data=await res.json();if(data.error)throw new Error(data.error.message);setReview(data.content?.find(b=>b.type==="text")?.text||"");}catch(e){setError("複盤失敗，請稍後再試");}finally{setLoading(false);}};
  const renderReview=text=>text.split("\n").map((line,i)=>{if(line.startsWith("**✦"))return <div key={i} style={{marginTop:i===0?0:16,marginBottom:"6px"}}><div style={{fontSize:"12px",fontWeight:700,color:C.gold,letterSpacing:"0.05em"}}>{line.replace(/\*\*/g,"")}</div></div>;if(line.trim()==="")return <div key={i} style={{height:"4px"}}/>;return <div key={i} style={{fontSize:"13px",color:C.text,lineHeight:"1.7"}}>{line}</div>;});
  const scopeRecs=getRecords();
  return(
    <Card accent={C.purple}>
      <SectionLabel label="AI 接客複盤" accent={C.purple}/>
      <div style={{display:"flex",gap:"6px",marginBottom:"12px"}}>
        {[["today","今天"],["yesterday","昨天"],["week","近7天"]].map(([v,l])=><button key={v} onClick={()=>setScope(v)} style={{padding:"5px 14px",border:`1.5px solid ${scope===v?C.purple:C.border}`,background:scope===v?C.purple:"transparent",color:scope===v?"#fff":C.sub,borderRadius:"20px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>{l}</button>)}
      </div>
      <div style={{fontSize:"11px",color:C.sub,marginBottom:"12px"}}>{scopeRecs.length>0?`${scopeRecs.length} 筆記錄（成交 ${scopeRecs.filter(r=>r.result==="success").length} / 未成交 ${scopeRecs.filter(r=>r.result==="fail").length}）`:"這個範圍內沒有記錄"}</div>
      <button onClick={runReview} disabled={loading||scopeRecs.length===0} style={{width:"100%",padding:"13px",background:loading||scopeRecs.length===0?C.border:C.dark,border:"none",color:loading||scopeRecs.length===0?C.sub:"#f5ead8",borderRadius:"12px",cursor:loading||scopeRecs.length===0?"default":"pointer",fontFamily:"inherit",fontSize:"13px",letterSpacing:"0.08em",marginBottom:"14px"}}>{loading?"AI 分析中…":"▶ 開始複盤分析"}</button>
      {error&&<div style={{background:"#fde8e4",borderRadius:"10px",padding:"12px",fontSize:"13px",color:C.fail}}>{error}</div>}
      {review&&<div style={{background:C.bg,borderRadius:"12px",padding:"14px 15px"}}><div style={{fontSize:"10px",color:C.purple,letterSpacing:"0.12em",marginBottom:"12px"}}>複盤結果</div>{renderReview(review)}</div>}
    </Card>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("home");
  const [records,setRecords]=useState(INIT_RECORDS);
  const [dailyProfile,setDailyProfile]=useState(()=>{
    try{return JSON.parse(localStorage.getItem(`fashionJournalDailyProfile:${TODAY}`))||{weather:"",lowTemp:"",highTemp:"",status:""};}
    catch{return {weather:"",lowTemp:"",highTemp:"",status:""};}
  });
  useEffect(()=>{try{localStorage.setItem(`fashionJournalDailyProfile:${TODAY}`,JSON.stringify(dailyProfile));}catch{}}
  ,[dailyProfile]);
  const [view,setView]=useState("list");
  const [editing,setEditing]=useState(null);
  const todayRecs=records.filter(r=>r.date===TODAY);
  const save=r=>{setRecords(p=>editing?p.map(x=>x.id===r.id?r:x):[r,...p]);setEditing(null);setView("list");setTab("home");};
  const deleteRecord=id=>setRecords(p=>p.filter(r=>r.id!==id));
  const editRecord=r=>{setEditing(r);setTab("records");setView("new");};
  const TABS=[["home","主頁"],["records","記錄"],["phrases","話術庫"],["wardrobe","穿搭庫"],["calendar","月曆"],["ai","AI複盤"],["stats","統計"]];
  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Noto Serif TC', serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@300;400;600;700&display=swap" rel="stylesheet"/>
      <div style={{background:C.dark,padding:"16px 16px 0",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",paddingBottom:"12px",borderBottom:"1px solid #2a2418"}}>
          <div>
            <div style={{fontSize:"7.5px",letterSpacing:"0.4em",color:"#4a4030",marginBottom:"3px"}}>FASHION RETAIL JOURNAL</div>
            <div style={{fontSize:"20px",fontWeight:700,color:"#f5ead8",letterSpacing:"0.06em"}}>接客誌</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:"11px",color:C.gold}}>{TODAY.replace(/-/g,".")}</div>
            <div style={{fontSize:"9px",color:"#4a4030",marginTop:"1px"}}>{["日","月","火","水","木","金","土"][new Date().getDay()]}曜日</div>
          </div>
        </div>
        <div style={{display:"flex",overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
          {TABS.map(([t,l])=><button key={t} onClick={()=>{setTab(t);setView("list");}} style={{flexShrink:0,padding:"9px 12px",background:"transparent",border:"none",borderBottom:tab===t?`2px solid ${C.gold}`:"2px solid transparent",color:tab===t?C.gold:"#4a4030",fontSize:"10px",letterSpacing:"0.02em",cursor:"pointer",fontFamily:"inherit",transition:"all .15s",whiteSpace:"nowrap"}}>{l}</button>)}
        </div>
      </div>
      <div style={{padding:"16px"}}>
        {tab==="home"&&<>
          <TodayTargets todayRecs={todayRecs}/>
          <DailyEnvironment profile={dailyProfile} onChange={setDailyProfile}/>
          <PerformanceCard records={records}/>
          <TodaySummary todayRecs={todayRecs}/>
          <TomorrowTasks/>
          <div style={{fontSize:"10px",letterSpacing:"0.15em",color:C.sub,marginBottom:"10px"}}>今日接客</div>
          {todayRecs.length===0?<div style={{textAlign:"center",padding:"30px",color:C.sub,fontSize:"13px"}}>今天還沒有記錄<br/><span style={{fontSize:"11px",color:C.border}}>點「記錄」開始第一筆</span></div>:todayRecs.map(r=><RecordCard key={r.id} r={r} onEdit={editRecord} onDelete={deleteRecord}/>)}
        </>}
        {tab==="records"&&view==="list"&&<>
          <button onClick={()=>{setEditing(null);setView("new");}} style={{width:"100%",padding:"13px",background:C.dark,border:"none",color:"#f5ead8",borderRadius:"12px",cursor:"pointer",fontFamily:"inherit",fontSize:"13px",letterSpacing:"0.08em",marginBottom:"12px"}}>＋ 新增接客記錄</button>
          {records.map(r=><RecordCard key={r.id} r={r} onEdit={editRecord} onDelete={deleteRecord}/>)}
        </>}
        {tab==="records"&&view==="new"&&<RecordForm initial={editing} onSave={save} onCancel={()=>{setView("list");setEditing(null);}} records={records} dailyProfile={dailyProfile}/>}
        {tab==="phrases"&&<PhrasesBank records={records}/>}
        {tab==="calendar"&&<CalendarView records={records}/>}
        {tab==="ai"&&<AIReview records={records}/>}
        {tab==="wardrobe"&&<WardrobeDB records={records}/>}
        {tab==="stats"&&<Stats records={records}/>}
      </div>
    </div>
  );
}
