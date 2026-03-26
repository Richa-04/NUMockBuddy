"use client";
import { useState, useEffect } from "react";

const SKILLS   = ["System Design","LeetCode","Behavioral","Finance/DS","Amazon LP","STAR Method","TPM","Audit"];
const COMPANIES= ["Google","Amazon","Microsoft","Meta","Apple","Fidelity","Goldman Sachs","Other"];
const ROLES    = ["SWE","DS","TPM","Audit"];
const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WD       = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const AVCOLS   = ["#fde8e8","#ddeeff","#ddf3e4","#f3e8fd","#fdf3e8"];

const gridBg = {
  backgroundColor:"#fff",
  backgroundImage:"linear-gradient(#e8e8e8 1px,transparent 1px),linear-gradient(90deg,#e8e8e8 1px,transparent 1px)",
  backgroundSize:"40px 40px",
};

const toIn  = n => n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
const toCol = id=> AVCOLS[id.charCodeAt(0)%AVCOLS.length];
const fmtT  = t => { const [h,m]=t.split(":").map(Number); return `${h>12?h-12:(h||12)}:${m===0?"00":m} ${h>=12?"PM":"AM"}`; };
const fmtS  = (s,e)=>`${fmtT(s)} – ${fmtT(e)}`;
const fmtD  = ds=> new Date(ds+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
const dstr  = n=>{ const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0]; };

function genSlots(){ const s=[]; for(let h=9;h<18;h++) ["00","30"].forEach(m=>{ const eh=m==="30"?h+1:h,em=m==="30"?"00":"30"; s.push({start:`${h}:${m}`,end:`${eh}:${em}`}); }); return s; }
const ALL_SLOTS = genSlots();



// ── Calendar ──────────────────────────────────────────────────────────────────
function Calendar({ markedSet, selectedDate, onSelect, pickAny=false }) {
  const [view,setView] = useState(()=>{ const n=new Date(); return new Date(n.getFullYear(),n.getMonth(),1); });
  const yr=view.getFullYear(), mo=view.getMonth();
  const dim=new Date(yr,mo+1,0).getDate(), fdow=new Date(yr,mo,1).getDay();
  const today=new Date(); today.setHours(0,0,0,0);
  const cells=[...Array(fdow).fill(null),...Array.from({length:dim},(_,i)=>i+1)];
  return (
    <div style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <button onClick={()=>setView(new Date(yr,mo-1,1))} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#555",lineHeight:1}}>‹</button>
        <span style={{fontWeight:600,fontSize:14,color:"#111"}}>{MONTHS[mo]} {yr}</span>
        <button onClick={()=>setView(new Date(yr,mo+1,1))} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#555",lineHeight:1}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {WD.map(d=><div key={d} style={{textAlign:"center",fontSize:11,color:"#bbb",paddingBottom:6}}>{d}</div>)}
        {cells.map((day,i)=>{
          if(!day) return <div key={i}/>;
          const s=`${yr}-${String(mo+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isPast=new Date(yr,mo,day)<today;
          const marked=markedSet?.has(s);
          const sel=selectedDate===s;
          const can=pickAny?!isPast:(!isPast&&marked);
          return (
            <button key={i} onClick={()=>can&&onSelect(sel?null:s)}
              style={{padding:"7px 0",borderRadius:7,fontSize:13,textAlign:"center",position:"relative",
                border:sel?"2px solid #c8102e":marked?"1.5px solid #b8d4e8":"1px solid transparent",
                background:sel?"#fff0f0":marked&&!isPast?"#eaf4fb":isPast?"transparent":"white",
                color:can?"#111":"#ddd", cursor:can?"pointer":"default", fontWeight:sel?700:400}}>
              {day}
            </button>
          );
        })}
      </div>
      {!pickAny && (
        <div style={{display:"flex",gap:12,marginTop:12,fontSize:12,color:"#888"}}>
          <span>🔵 Available</span><span style={{color:"#c8102e"}}>🔴 Selected</span>
        </div>
      )}
    </div>
  );
}

// ── Volunteer List ────────────────────────────────────────────────────────────
function VolunteerList({ volunteers, setPage, setSelected }) {
  const [filter,setFilter]=useState("All");
  const filters=["All","Google","SWE","Open now"];
  const filtered=volunteers.filter(v=>{
    if(filter==="All") return true;
    if(filter==="Open now") return v.available;
    if(filter==="SWE") return v.role?.includes("SWE")||v.role?.includes("SDE");
    return v.company===filter;
  });
  return (
    <div style={{...gridBg,minHeight:"calc(100vh - 64px)",padding:"40px 48px"}} className="vol-outer">
      <style>{`
        @media (max-width: 768px) {
          .vol-outer        { padding: 24px 16px !important; }
          .vol-header       { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .vol-header > button { width: 100% !important; }
          .vol-filter-row   { flex-wrap: wrap !important; }
          .vol-filter-row input { min-width: 0 !important; width: 100% !important; margin-bottom: 4px; }
          .vol-grid         { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div className="vol-header" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
          <div>
            <h2 style={{margin:0,fontSize:22,fontWeight:700,color:"#111"}}>Peer volunteers</h2>
            <p style={{margin:"6px 0 0",color:"#666",fontSize:14}}>Students who've done co-ops & internships and want to help</p>
          </div>
          <button onClick={()=>setPage("signup")} style={{background:"white",border:"1.5px solid #222",color:"#111",borderRadius:8,padding:"10px 20px",cursor:"pointer",fontWeight:600,fontSize:14}}>Become a volunteer</button>
        </div>
        <div className="vol-filter-row" style={{display:"flex",gap:10,marginBottom:32,alignItems:"center",flexWrap:"wrap"}}>
          <input placeholder="Filter by company, role, or skill..." style={{flex:1,padding:"10px 16px",borderRadius:8,border:"1px solid #ddd",background:"white",fontSize:14,outline:"none",minWidth:180}}/>
          {filters.map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:"8px 18px",borderRadius:20,border:"1.5px solid "+(filter===f?"#111":"#ddd"),background:filter===f?"#111":"white",color:filter===f?"white":"#555",cursor:"pointer",fontWeight:filter===f?700:400,fontSize:13}}>{f}</button>
          ))}
        </div>
        <div className="vol-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {filtered.map(v=>(
            <div key={v.id} style={{background:"white",borderRadius:12,padding:24,border:"1px solid #eee",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:toCol(v.id),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#444",fontSize:15}}>{toIn(v.name)}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:16,color:"#111"}}>{v.name}</div>
                  <div style={{color:"#888",fontSize:13}}>{v.degree} · {v.company} {v.role}</div>
                </div>
              </div>
              <p style={{margin:"0 0 14px",color:"#444",fontSize:14,lineHeight:1.6}}>{v.bio}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
                {v.skills.map((s,i)=>(
                  <span key={s} style={{padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:600,background:i===0?"#fde8e8":"#f4f4f4",color:i===0?"#c8102e":"#555",border:i===0?"1px solid #f5c0c0":"1px solid #e8e8e8"}}>{s}</span>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:v.available?"#22c55e":"#aaa",display:"inline-block"}}/>
                  <span style={{color:v.available?"#22c55e":"#aaa",fontWeight:500}}>{v.available?"Available":"Busy this week"}</span>
                </span>
                <button onClick={()=>{setSelected(v);setPage("book");}} style={{background:"#111",color:"white",border:"none",borderRadius:8,padding:"10px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Request session</button>
              </div>
            </div>
          ))}
          <div style={{background:"white",borderRadius:12,padding:24,border:"1px solid #eee",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
            <div style={{fontSize:40}}>🎓</div>
            <div style={{fontWeight:700,fontSize:16,color:"#111"}}>Done a co-op?</div>
            <div style={{color:"#777",fontSize:14}}>Help fellow Huskies prep</div>
            <button onClick={()=>setPage("signup")} style={{background:"white",border:"1.5px solid #222",color:"#111",borderRadius:8,padding:"10px 20px",cursor:"pointer",fontWeight:600,fontSize:14,marginTop:4}}>Join as volunteer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Volunteer Signup ──────────────────────────────────────────────────────────
function VolunteerSignup({ setPage, onAdd }) {
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({name:"",email:"",degree:"",company:"",role:"",bio:"",skills:[]});
  const [calDate,setCalDate]=useState(null);
  const [avSlots,setAvSlots]=useState({});
  const [done,setDone]=useState(false);
  const [submitting,setSubmitting]=useState(false);

  const toggleSkill=s=>setForm(f=>({...f,skills:f.skills.includes(s)?f.skills.filter(x=>x!==s):[...f.skills,s]}));
  const toggleSlot=(date,slot)=>setAvSlots(prev=>{
    const cur=prev[date]||[];
    const ex=cur.some(s=>s.start===slot.start);
    return {...prev,[date]:ex?cur.filter(s=>s.start!==slot.start):[...cur,slot]};
  });
  const isSlotSel=(date,slot)=>(avSlots[date]||[]).some(s=>s.start===slot.start);
  const selDates=Object.keys(avSlots).filter(d=>avSlots[d].length>0);
  const totalSlots=selDates.reduce((a,d)=>a+(avSlots[d]||[]).length,0);

  const handleSubmit=async()=>{
    setSubmitting(true);
    const slots=Object.entries(avSlots).flatMap(([day,times])=>times.map(t=>({day,startTime:t.start,endTime:t.end})));
    try {
      const res=await fetch("/api/volunteers",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...form,skills:form.skills.join(","),slots})});
      if(res.ok){
        const nv=await res.json();
        onAdd({...nv,skills:form.skills,available:true,slots:slots.map((s,i)=>({id:"new"+i,day:s.day,start:s.startTime,end:s.endTime,booked:false}))});
        setDone(true);
      } else alert("提交失败，请重试");
    } catch { alert("网络错误"); } finally { setSubmitting(false); }
  };

  const inp={width:"100%",padding:"10px 14px",border:"1px solid #ddd",borderRadius:8,fontSize:14,outline:"none",boxSizing:"border-box",background:"white"};

  if(done) return (
    <div style={{...gridBg,minHeight:"calc(100vh - 64px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"white",borderRadius:16,padding:"48px 56px",textAlign:"center",border:"1px solid #eee",boxShadow:"0 2px 16px rgba(0,0,0,.06)"}}>
        <div style={{fontSize:56,marginBottom:12}}>🎉</div>
        <h2 style={{margin:"0 0 8px",fontSize:22}}>You're now a volunteer!</h2>
        <p style={{color:"#666",margin:"0 0 24px"}}>Your profile is live. Students can now request sessions with you.</p>
        <button onClick={()=>setPage("list")} style={{background:"#c8102e",color:"white",border:"none",borderRadius:24,padding:"12px 28px",fontWeight:700,fontSize:15,cursor:"pointer"}}>View Volunteers</button>
      </div>
    </div>
  );

  return (
    <div style={{...gridBg,minHeight:"calc(100vh - 64px)",padding:"40px 0",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{background:"white",border:"1px solid #eee",borderRadius:16,padding:"40px 48px",width:"100%",maxWidth:620,boxShadow:"0 2px 12px rgba(0,0,0,.05)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
          <h2 style={{margin:0,fontSize:20,fontWeight:700}}>Become a Volunteer</h2>
          <span style={{background:"#fff0f0",color:"#c8102e",borderRadius:20,padding:"4px 14px",fontSize:13,fontWeight:600}}>Step {step} of 2</span>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:32}}>
          {[1,2].map(i=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?"#c8102e":"#eee"}}/>)}
        </div>

        {step===1&&(
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            {[["Full Name","name","text","e.g. Rohan Kumar"],["Email","email","email","rohan@northeastern.edu"],["Degree Program","degree","text","e.g. MSCS, MSIS"]].map(([label,key,type,ph])=>(
              <div key={key}>
                <label style={{fontWeight:600,fontSize:14,display:"block",marginBottom:8}}>{label}</label>
                <input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph} style={inp}/>
              </div>
            ))}
            <div>
              <label style={{fontWeight:600,fontSize:14,display:"block",marginBottom:8}}>Company / Internship</label>
              <select value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} style={inp}>
                <option value="">Select a company</option>
                {COMPANIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontWeight:600,fontSize:14,display:"block",marginBottom:10}}>Role Type</label>
              <div style={{display:"flex",gap:10}}>
                {ROLES.map(r=>(
                  <button key={r} onClick={()=>setForm(f=>({...f,role:r}))} style={{flex:1,padding:"10px",border:`1.5px solid ${form.role===r?"#c8102e":"#ddd"}`,borderRadius:8,background:form.role===r?"#fff0f0":"white",color:form.role===r?"#c8102e":"#555",cursor:"pointer",fontWeight:form.role===r?700:400,fontSize:14}}>{r}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{fontWeight:600,fontSize:14,display:"block",marginBottom:10}}>Skills / Specialties</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {SKILLS.map(s=>(
                  <button key={s} onClick={()=>toggleSkill(s)} style={{padding:"7px 14px",borderRadius:20,border:`1.5px solid ${form.skills.includes(s)?"#c8102e":"#ddd"}`,background:form.skills.includes(s)?"#fff0f0":"white",color:form.skills.includes(s)?"#c8102e":"#555",cursor:"pointer",fontSize:13,fontWeight:form.skills.includes(s)?600:400}}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{fontWeight:600,fontSize:14,display:"block",marginBottom:8}}>Short Bio</label>
              <textarea value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} rows={3} placeholder="Describe your experience..." style={{...inp,resize:"vertical"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:4}}>
              <button onClick={()=>setStep(2)} style={{background:"#c8102e",color:"white",border:"none",borderRadius:24,padding:"12px 28px",fontWeight:700,fontSize:14,cursor:"pointer"}}>Next: Set Availability →</button>
            </div>
          </div>
        )}

        {step===2&&(
          <div>
            <p style={{margin:"0 0 16px",color:"#555",fontSize:14}}>Click on any date to add available time slots.</p>
            <Calendar markedSet={new Set(selDates)} selectedDate={calDate} onSelect={setCalDate} pickAny={true}/>

            {calDate&&(
              <div style={{marginTop:16,background:"#f9f9f9",borderRadius:10,padding:16}}>
                <div style={{fontWeight:600,fontSize:14,marginBottom:12,color:"#111"}}>
                  {fmtD(calDate)} — select your available slots
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {ALL_SLOTS.map(slot=>{
                    const sel=isSlotSel(calDate,slot);
                    return (
                      <button key={slot.start} onClick={()=>toggleSlot(calDate,slot)}
                        style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${sel?"#c8102e":"#c5dff0"}`,background:sel?"#fff0f0":"#eaf4fb",color:sel?"#c8102e":"#2a6090",cursor:"pointer",fontSize:12,fontWeight:sel?700:400}}>
                        {fmtS(slot.start,slot.end)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {totalSlots>0&&(
              <div style={{marginTop:12,background:"#f0faf0",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#2a7a2a"}}>
                ✓ {selDates.length} date{selDates.length>1?"s":""} set · {totalSlots} total slot{totalSlots>1?"s":""}
              </div>
            )}

            <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
              <button onClick={()=>setStep(1)} style={{background:"white",color:"#333",border:"1.5px solid #ddd",borderRadius:24,padding:"12px 24px",fontWeight:600,fontSize:14,cursor:"pointer"}}>← Back</button>
              <button onClick={handleSubmit} disabled={submitting||totalSlots===0}
                style={{background:totalSlots>0?"#c8102e":"#ddd",color:totalSlots>0?"white":"#aaa",border:"none",borderRadius:24,padding:"12px 28px",fontWeight:700,fontSize:14,cursor:totalSlots>0?"pointer":"not-allowed",opacity:submitting?0.7:1}}>
                {submitting?"Submitting...":"Submit Profile ✓"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Booking Page ──────────────────────────────────────────────────────────────
function BookingPage({ volunteer, setPage, onBook }) {
  const [calDate,setCalDate]=useState(null);
  const [selSlot,setSelSlot]=useState(null);
  const [email,setEmail]=useState("");
  const [booked,setBooked]=useState(false);
  const [booking,setBooking]=useState(false);

  const availDates=new Set(volunteer.slots.filter(s=>!s.booked).map(s=>s.day));
  const dateSlots=calDate?volunteer.slots.filter(s=>s.day===calDate):[];

  const handleConfirm=async()=>{
    if(!selSlot||!email) return;
    setBooking(true);
    try {
      const res=await fetch("/api/sessions",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({volunteerId:volunteer.id,requester:email,slotId:selSlot.id,
          timeSlot:`${fmtD(selSlot.day)} ${fmtS(selSlot.start,selSlot.end)}`,notes:""})});
      if(res.ok){ onBook(volunteer.id,selSlot.id); setBooked(true); }
      else alert("预约失败，请重试");
    } catch { alert("网络错误"); } finally { setBooking(false); }
  };

  if(booked) return (
    <div style={{...gridBg,minHeight:"calc(100vh - 64px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"white",borderRadius:16,padding:"48px 56px",textAlign:"center",border:"1px solid #eee",boxShadow:"0 2px 16px rgba(0,0,0,.06)",maxWidth:460}}>
        <div style={{fontSize:56,marginBottom:12}}>✅</div>
        <h2 style={{margin:"0 0 8px",fontSize:22}}>Session Confirmed!</h2>
        <p style={{color:"#333",fontWeight:600,margin:"0 0 4px"}}>{fmtD(selSlot.day)}, {fmtS(selSlot.start,selSlot.end)}</p>
        <p style={{color:"#888",fontSize:13,margin:"0 0 20px"}}>with {volunteer.name}</p>
        <div style={{background:"#f0faf0",borderRadius:8,padding:"12px 16px",fontSize:13,color:"#2a7a2a",marginBottom:24,textAlign:"left"}}>
          📧 Confirmation emails sent to:<br/>
          <strong>{email}</strong> (you)<br/>
          <strong>{volunteer.email}</strong> ({volunteer.name})
        </div>
        <button onClick={()=>setPage("list")} style={{background:"#c8102e",color:"white",border:"none",borderRadius:24,padding:"12px 28px",fontWeight:700,fontSize:15,cursor:"pointer"}}>Back to Volunteers</button>
      </div>
    </div>
  );

  return (
    <div style={{...gridBg,minHeight:"calc(100vh - 64px)",padding:"40px 48px"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <button onClick={()=>setPage("list")} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:14,marginBottom:28,padding:0}}>← Back to volunteers</button>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:32,paddingBottom:24,borderBottom:"1px solid #eee"}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:toCol(volunteer.id),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#444",fontSize:18}}>{toIn(volunteer.name)}</div>
          <div>
            <div style={{fontWeight:700,fontSize:20,color:"#111"}}>{volunteer.name}</div>
            <div style={{color:"#888",fontSize:14}}>{volunteer.degree} · {volunteer.company} {volunteer.role}</div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32,alignItems:"start"}}>
          {/* Calendar */}
          <div>
            <div style={{fontWeight:600,fontSize:15,marginBottom:12,color:"#111"}}>① Pick a date</div>
            <Calendar markedSet={availDates} selectedDate={calDate} onSelect={d=>{setCalDate(d);setSelSlot(null);}} pickAny={false}/>
          </div>

          {/* Slots + Email */}
          <div>
            <div style={{fontWeight:600,fontSize:15,marginBottom:12,color:"#111"}}>② Pick a time slot</div>
            {!calDate&&(
              <div style={{background:"#f9f9f9",borderRadius:12,padding:32,textAlign:"center",color:"#bbb",fontSize:14,border:"1px solid #eee"}}>
                ← Select a date first
              </div>
            )}
            {calDate&&dateSlots.length===0&&(
              <div style={{background:"#f9f9f9",borderRadius:12,padding:32,textAlign:"center",color:"#aaa",fontSize:14,border:"1px solid #eee"}}>
                No slots on {fmtD(calDate)}
              </div>
            )}
            {calDate&&dateSlots.length>0&&(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {dateSlots.map(slot=>{
                  const isSel=selSlot?.id===slot.id;
                  return (
                    <button key={slot.id} disabled={slot.booked} onClick={()=>!slot.booked&&setSelSlot(isSel?null:slot)}
                      style={{padding:"12px 16px",borderRadius:10,textAlign:"left",fontSize:14,
                        border:`1.5px solid ${isSel?"#c8102e":slot.booked?"#eee":"#c5dff0"}`,
                        background:isSel?"#fff0f0":slot.booked?"#f5f5f5":"#eaf4fb",
                        color:isSel?"#c8102e":slot.booked?"#bbb":"#1a5c80",
                        cursor:slot.booked?"not-allowed":"pointer",fontWeight:isSel?700:400,
                        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      {fmtS(slot.start,slot.end)}
                      {slot.booked&&<span style={{fontSize:11,background:"#eee",color:"#aaa",borderRadius:20,padding:"3px 10px"}}>Booked</span>}
                      {isSel&&<span style={{fontSize:11,background:"#c8102e",color:"white",borderRadius:20,padding:"3px 10px"}}>Selected</span>}
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{marginTop:24}}>
              <div style={{fontWeight:600,fontSize:15,marginBottom:8,color:"#111"}}>③ Your email</div>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@northeastern.edu"
                style={{width:"100%",padding:"10px 14px",border:"1px solid #ddd",borderRadius:8,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
              <p style={{fontSize:12,color:"#aaa",margin:"6px 0 0"}}>Confirmation will be sent to you and {volunteer.name}</p>
            </div>
          </div>
        </div>

        {/* Confirm bar */}
        <div style={{position:"sticky",bottom:0,background:"white",padding:"16px 0",borderTop:"1px solid #eee",marginTop:32,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:14,color:selSlot?"#333":"#aaa"}}>
            {selSlot?`${fmtD(selSlot.day)} · ${fmtS(selSlot.start,selSlot.end)}`:"No slot selected"}
          </span>
          <button disabled={!selSlot||!email||booking} onClick={handleConfirm}
            style={{background:selSlot&&email?"#c8102e":"#ddd",color:selSlot&&email?"white":"#aaa",border:"none",borderRadius:24,padding:"12px 28px",fontWeight:700,fontSize:15,cursor:selSlot&&email?"pointer":"not-allowed"}}>
            {booking?"Booking...":"Confirm Session"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]=useState("list");
  const [selected,setSelected]=useState(null);
  const [volunteers,setVolunteers]=useState([]);

  // 从真实 API 拉取数据
  useEffect(()=>{
    fetch("/api/volunteers")
      .then(r=>r.json())
      .then(data=>{
        const enriched = data.map((v: any)=>({
          ...v,
          initials: toIn(v.name),
          color: toCol(v.id),
          skills: v.skills ? v.skills.split(",").map((s: any)=>s.trim()) : [],
          available: v.availability === "available",
          slots: (v.availabilitySlots||[]).map((s: any)=>({
            id: s.id,
            day: s.day,
            start: s.startTime,
            end: s.endTime,
            booked: s.booked,
          })),
        }));
        setVolunteers(enriched);
      });
  },[]);

  const handleAdd=v=>setVolunteers((p: any)=>[v,...p]);
  const handleBook=(vid,sid)=>setVolunteers(p=>p.map(v=>v.id!==vid?v:{...v,slots:v.slots.map(s=>s.id!==sid?s:{...s,booked:true})}));
  const curVol=selected?volunteers.find(v=>v.id===selected.id)||selected:null;

  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",minHeight:"100vh"}}>
      {page==="list"   &&<VolunteerList volunteers={volunteers} setPage={setPage} setSelected={setSelected}/>}
      {page==="signup" &&<VolunteerSignup setPage={setPage} onAdd={handleAdd}/>}
      {page==="book"   &&curVol&&<BookingPage volunteer={curVol} setPage={setPage} onBook={handleBook}/>}
    </div>
  );
}