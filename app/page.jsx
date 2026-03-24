"use client";
import { useState, useRef, useEffect } from "react";

const DEFAULT_KB = {
  empresa: {
    nome: "Clínica Vita",
    segmento: "Clínica Médica",
    descricao: "Clínica moderna focada em bem-estar e saúde preventiva",
    endereco: "Rua das Flores, 142 — Jardim Europa, São Paulo/SP",
    telefone: "(11) 3456-7890",
    whatsapp: "(11) 99876-5432",
    horarios: "Segunda a Sexta: 8h às 18h | Sábados: 8h às 12h",
    site: "www.clinicavita.com.br",
  },
  faqs: [
    { id: 1, pergunta: "Quais convênios vocês aceitam?", resposta: "Aceitamos Unimed, Bradesco Saúde, SulAmérica, Amil e Porto Seguro. Consulta particular: R$ 250,00." },
    { id: 2, pergunta: "Como faço para agendar?", resposta: "Pelo WhatsApp (11) 99876-5432, telefone (11) 3456-7890 ou diretamente pelo chat. Horários disponíveis: amanhã às 9h, 10h30, 14h e 15h30." },
    { id: 3, pergunta: "Vocês atendem urgências?", resposta: "Atendemos casos de urgência leve. Para emergências graves, oriente o paciente a ligar para o SAMU (192) ou ir à UPA mais próxima." },
  ],
  servicos: [
    { id: 1, nome: "Consulta Clínica Geral", descricao: "Avaliação completa de saúde", preco: "R$ 250,00", duracao: "45 min" },
    { id: 2, nome: "Eletrocardiograma", descricao: "Exame do coração", preco: "R$ 120,00", duracao: "20 min" },
    { id: 3, nome: "Check-up Completo", descricao: "Pacote com 12 exames + consulta", preco: "R$ 680,00", duracao: "2h" },
  ],
  equipe: [
    { id: 1, nome: "Dra. Ana Souza", especialidade: "Clínica Geral", crm: "CRM/SP 123456", bio: "15 anos de experiência em medicina preventiva" },
    { id: 2, nome: "Dr. Carlos Lima", especialidade: "Cardiologia", crm: "CRM/SP 789012", bio: "Especialista em doenças cardiovasculares" },
  ],
  personalidade: {
    nome: "Sofia",
    tom: "acolhedora",
    instrucoes: "Seja empática, profissional e objetiva. Nunca faça diagnósticos. Sempre sugira consulta presencial para dúvidas médicas.",
  },
};

function buildSystemPrompt(kb) {
  const { empresa, faqs, servicos, equipe, personalidade } = kb;
  return `Você é ${personalidade.nome}, assistente virtual da ${empresa.nome} (${empresa.segmento}).
Tom: ${personalidade.tom}. ${personalidade.instrucoes}
Responda SEMPRE em português brasileiro. Seja breve (máx. 3-4 frases por resposta).

INFORMAÇÕES DA EMPRESA:
- Descrição: ${empresa.descricao}
- Endereço: ${empresa.endereco}
- Telefone: ${empresa.telefone} | WhatsApp: ${empresa.whatsapp}
- Horários: ${empresa.horarios}
- Site: ${empresa.site}

SERVIÇOS OFERECIDOS:
${servicos.map(s => `• ${s.nome}: ${s.descricao} — ${s.preco} (${s.duracao})`).join("\n")}

EQUIPE:
${equipe.map(e => `• ${e.nome} — ${e.especialidade} (${e.crm}): ${e.bio}`).join("\n")}

BASE DE CONHECIMENTO / FAQ:
${faqs.map(f => `P: ${f.pergunta}\nR: ${f.resposta}`).join("\n\n")}

Ao receber uma saudação, apresente-se brevemente e pergunte como pode ajudar.`;
}

const TONES = ["acolhedora", "formal", "descontraída", "direta", "entusiasmada"];
const SEGMENTS = ["Clínica Médica", "Restaurante", "Academia", "E-commerce", "Consultório", "Escritório", "Hotel", "Salão de Beleza"];

// ─── API CALL (usa rota interna — API key fica segura no servidor) ─────────────
async function callAPI(messages, systemPrompt) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await res.json();
  return (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
}

export default function App() {
  const [view, setView] = useState("admin");
  const [kb, setKb] = useState(DEFAULT_KB);
  const [activeTab, setActiveTab] = useState("empresa");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);

  const saveKb = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  async function startChat() {
    setChatStarted(true);
    setLoading(true);
    try {
      const reply = await callAPI([{ role: "user", content: "Olá" }], buildSystemPrompt(kb));
      setMessages([{ role: "user", content: "Olá" }, { role: "assistant", content: reply }]);
    } catch {
      setMessages([{ role: "assistant", content: `Olá! Sou ${kb.personalidade.nome} da ${kb.empresa.nome}. Como posso ajudar?` }]);
    } finally { setLoading(false); }
  }

  const goChat = () => {
    setView("chat");
    if (!chatStarted) startChat();
  };

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{height:100%;overflow:hidden;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#dde1e7;border-radius:4px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
        input:focus,textarea:focus,select:focus{outline:none!important;border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,0.1)!important;}
      `}</style>

      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.brand}>
          <div style={S.brandIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={S.brandName}>AgentBuilder</span>
          <span style={S.beta}>BETA</span>
        </div>
        <div style={S.navPills}>
          {[["admin","⚙️","Painel Admin"],["chat","💬","Testar Agente"]].map(([v,ic,lb])=>(
            <button key={v} style={{...S.pill,...(view===v?S.pillOn:{})}}
              onClick={()=>v==="chat"?goChat():setView(v)}>
              {ic} {lb}
            </button>
          ))}
        </div>
        <div style={S.agentBadge}>
          <span style={S.agentDot}/>{kb.personalidade.nome} · {kb.empresa.nome}
        </div>
      </nav>

      {view==="admin"
        ? <Admin kb={kb} setKb={setKb} activeTab={activeTab} setActiveTab={setActiveTab} onSave={saveKb} saved={saved}/>
        : <Chat kb={kb} messages={messages} setMessages={setMessages} input={input} setInput={setInput}
            loading={loading} setLoading={setLoading} chatStarted={chatStarted} setChatStarted={setChatStarted}
            onReset={()=>{setMessages([]);setChatStarted(false);}}/>
      }
    </div>
  );
}

/* ── ADMIN ── */
function Admin({ kb, setKb, activeTab, setActiveTab, onSave, saved }) {
  const tabs = [
    {id:"empresa",ic:"🏢",lb:"Empresa"},
    {id:"persona",ic:"🤖",lb:"Personalidade"},
    {id:"servicos",ic:"📋",lb:"Serviços"},
    {id:"equipe",ic:"👥",lb:"Equipe"},
    {id:"faq",ic:"💡",lb:"FAQ"},
  ];
  return (
    <div style={S.adminWrap}>
      <aside style={S.sidebar}>
        <p style={S.sideHead}>BASE DE CONHECIMENTO</p>
        {tabs.map(t=>(
          <button key={t.id} style={{...S.sideBtn,...(activeTab===t.id?S.sideBtnOn:{})}} onClick={()=>setActiveTab(t.id)}>
            <span>{t.ic}</span><span style={{flex:1,textAlign:"left"}}>{t.lb}</span>
            {activeTab===t.id&&<span style={S.sideBar}/>}
          </button>
        ))}
        <div style={{flex:1}}/>
        <button style={{...S.saveBtn,background:saved?"#22c55e":"#6366f1"}} onClick={onSave}>
          {saved?"✓ Salvo!":"💾 Salvar"}
        </button>
        <p style={S.sideNote}>Alterações refletem no agente em tempo real</p>
      </aside>
      <main style={S.adminMain}>
        {activeTab==="empresa"  && <EmpresaTab  kb={kb} setKb={setKb}/>}
        {activeTab==="persona"  && <PersonaTab  kb={kb} setKb={setKb}/>}
        {activeTab==="servicos" && <ServicosTab kb={kb} setKb={setKb}/>}
        {activeTab==="equipe"   && <EquipeTab   kb={kb} setKb={setKb}/>}
        {activeTab==="faq"      && <FaqTab      kb={kb} setKb={setKb}/>}
      </main>
    </div>
  );
}

function EmpresaTab({kb,setKb}){
  const u=(k,v)=>setKb(p=>({...p,empresa:{...p.empresa,[k]:v}}));
  return(
    <Shell title="🏢 Informações da Empresa" desc="Dados que o agente usa para se apresentar e responder dúvidas.">
      <Row><Field label="Nome da Empresa" value={kb.empresa.nome} onChange={v=>u("nome",v)}/>
        <div style={F.group}><label style={F.label}>Segmento</label>
          <select style={F.select} value={kb.empresa.segmento} onChange={e=>u("segmento",e.target.value)}>
            {SEGMENTS.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </Row>
      <Field label="Descrição" value={kb.empresa.descricao} onChange={v=>u("descricao",v)} multi/>
      <Row><Field label="📍 Endereço" value={kb.empresa.endereco} onChange={v=>u("endereco",v)}/><Field label="⏰ Horários" value={kb.empresa.horarios} onChange={v=>u("horarios",v)}/></Row>
      <Row><Field label="📞 Telefone" value={kb.empresa.telefone} onChange={v=>u("telefone",v)}/><Field label="💬 WhatsApp" value={kb.empresa.whatsapp} onChange={v=>u("whatsapp",v)}/><Field label="🌐 Site" value={kb.empresa.site} onChange={v=>u("site",v)}/></Row>
    </Shell>
  );
}

function PersonaTab({kb,setKb}){
  const u=(k,v)=>setKb(p=>({...p,personalidade:{...p.personalidade,[k]:v}}));
  return(
    <Shell title="🤖 Personalidade do Agente" desc="Defina como seu agente se chama, fala e se comporta.">
      <Field label="Nome do Agente" value={kb.personalidade.nome} onChange={v=>u("nome",v)}/>
      <div style={F.group}><label style={F.label}>Tom de Voz</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {TONES.map(t=><button key={t} style={{...F.toneBtn,...(kb.personalidade.tom===t?F.toneBtnOn:{})}} onClick={()=>u("tom",t)}>{t}</button>)}
        </div>
      </div>
      <Field label="Instruções Especiais" value={kb.personalidade.instrucoes} onChange={v=>u("instrucoes",v)} multi placeholder="Ex: Nunca prometa prazos sem confirmar..."/>
      <div style={F.preview}>
        <p style={F.previewLb}>PREVIEW DO PROMPT</p>
        <p style={F.previewTxt}>Você é <b>{kb.personalidade.nome}</b>, assistente virtual da <b>{kb.empresa.nome}</b>. Tom: <b>{kb.personalidade.tom}</b>. {kb.personalidade.instrucoes}</p>
      </div>
    </Shell>
  );
}

function ServicosTab({kb,setKb}){
  const add=()=>setKb(p=>({...p,servicos:[...p.servicos,{id:Date.now(),nome:"",descricao:"",preco:"",duracao:""}]}));
  const u=(id,k,v)=>setKb(p=>({...p,servicos:p.servicos.map(s=>s.id===id?{...s,[k]:v}:s)}));
  const del=id=>setKb(p=>({...p,servicos:p.servicos.filter(s=>s.id!==id)}));
  return(
    <Shell title="📋 Serviços & Produtos" desc="Cadastre o que sua empresa oferece.">
      {kb.servicos.map(sv=>(
        <Card key={sv.id} onDel={()=>del(sv.id)} label={sv.nome||"Novo serviço"}>
          <Row><Field label="Nome" value={sv.nome} onChange={v=>u(sv.id,"nome",v)}/><Field label="Descrição" value={sv.descricao} onChange={v=>u(sv.id,"descricao",v)}/></Row>
          <Row><Field label="Preço" value={sv.preco} onChange={v=>u(sv.id,"preco",v)} placeholder="R$ 0,00"/><Field label="Duração" value={sv.duracao} onChange={v=>u(sv.id,"duracao",v)} placeholder="Ex: 30 min"/></Row>
        </Card>
      ))}
      <AddBtn onClick={add} label="+ Adicionar Serviço"/>
    </Shell>
  );
}

function EquipeTab({kb,setKb}){
  const add=()=>setKb(p=>({...p,equipe:[...p.equipe,{id:Date.now(),nome:"",especialidade:"",crm:"",bio:""}]}));
  const u=(id,k,v)=>setKb(p=>({...p,equipe:p.equipe.map(e=>e.id===id?{...e,[k]:v}:e)}));
  const del=id=>setKb(p=>({...p,equipe:p.equipe.filter(e=>e.id!==id)}));
  return(
    <Shell title="👥 Equipe" desc="Profissionais que o agente pode apresentar.">
      {kb.equipe.map(em=>(
        <Card key={em.id} onDel={()=>del(em.id)} label={em.nome||"Novo profissional"}>
          <Row><Field label="Nome" value={em.nome} onChange={v=>u(em.id,"nome",v)}/><Field label="Especialidade" value={em.especialidade} onChange={v=>u(em.id,"especialidade",v)}/></Row>
          <Row><Field label="Registro" value={em.crm} onChange={v=>u(em.id,"crm",v)} placeholder="CRM, OAB..."/><Field label="Mini Bio" value={em.bio} onChange={v=>u(em.id,"bio",v)}/></Row>
        </Card>
      ))}
      <AddBtn onClick={add} label="+ Adicionar Profissional"/>
    </Shell>
  );
}

function FaqTab({kb,setKb}){
  const add=()=>setKb(p=>({...p,faqs:[...p.faqs,{id:Date.now(),pergunta:"",resposta:""}]}));
  const u=(id,k,v)=>setKb(p=>({...p,faqs:p.faqs.map(f=>f.id===id?{...f,[k]:v}:f)}));
  const del=id=>setKb(p=>({...p,faqs:p.faqs.filter(f=>f.id!==id)}));
  return(
    <Shell title="💡 Perguntas Frequentes" desc="Treine o agente com as dúvidas mais comuns dos seus clientes.">
      {kb.faqs.map((faq,i)=>(
        <Card key={faq.id} onDel={()=>del(faq.id)} label={`Q${i+1}: ${faq.pergunta||"Nova pergunta"}`}>
          <Field label="❓ Pergunta" value={faq.pergunta} onChange={v=>u(faq.id,"pergunta",v)} placeholder="Ex: Vocês trabalham aos domingos?"/>
          <Field label="✅ Resposta" multi value={faq.resposta} onChange={v=>u(faq.id,"resposta",v)} placeholder="Ex: Não, atendemos de segunda a sábado..."/>
        </Card>
      ))}
      <AddBtn onClick={add} label="+ Adicionar Pergunta"/>
    </Shell>
  );
}

/* ── CHAT ── */
function Chat({kb,messages,setMessages,input,setInput,loading,setLoading,chatStarted,setChatStarted,onReset}){
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,loading]);

  const send=async(text)=>{
    if(!text.trim()||loading)return;
    const um={role:"user",content:text};
    const upd=[...messages,um];
    setMessages(upd);setInput("");setLoading(true);
    try{
      const reply=await callAPI(upd.map(m=>({role:m.role,content:m.content})),buildSystemPrompt(kb));
      setMessages([...upd,{role:"assistant",content:reply||"Não consegui processar."}]);
    }catch{
      setMessages([...upd,{role:"assistant",content:"Erro de conexão. Tente novamente."}]);
    }finally{setLoading(false);}
  };

  return(
    <div style={S.chatWrap}>
      <aside style={S.chatInfo}>
        <p style={S.sideHead}>AGENTE ATIVO</p>
        <div style={S.agentCard}>
          <div style={S.agentAv}>{kb.personalidade.nome[0]}</div>
          <p style={{fontWeight:700,fontSize:15,color:"#0f172a"}}>{kb.personalidade.nome}</p>
          <p style={{fontSize:11,color:"#64748b"}}>{kb.empresa.nome}</p>
          <span style={{fontSize:11,color:"#6366f1",background:"#eef2ff",padding:"2px 10px",borderRadius:20,marginTop:2}}>Tom: {kb.personalidade.tom}</span>
        </div>
        <p style={{...S.sideHead,marginTop:14}}>CONHECIMENTO</p>
        <div style={{display:"flex",gap:8,marginBottom:4}}>
          {[["FAQs",kb.faqs.length],["Serviços",kb.servicos.length],["Equipe",kb.equipe.length]].map(([lb,n])=>(
            <div key={lb} style={{flex:1,background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"8px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <span style={{fontWeight:700,fontSize:17,color:"#6366f1"}}>{n}</span>
              <span style={{fontSize:9,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em"}}>{lb}</span>
            </div>
          ))}
        </div>
        <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"10px 12px",fontSize:11,color:"#78350f",lineHeight:1.6}}>
          💡 Edite no Painel Admin e teste aqui em tempo real
        </div>
        <button style={{marginTop:"auto",padding:"9px",border:"1.5px solid #e2e8f0",background:"white",borderRadius:8,fontSize:12,color:"#64748b",cursor:"pointer",width:"100%"}} onClick={onReset}>
          🔄 Reiniciar conversa
        </button>
      </aside>

      <div style={S.chatBox}>
        <div style={S.chatHead}>
          <div style={S.agentAv2}>{kb.personalidade.nome[0]}</div>
          <div>
            <p style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{kb.personalidade.nome}</p>
            <p style={{fontSize:11,color:"#22c55e",display:"flex",alignItems:"center",gap:5}}>
              <span style={{width:6,height:6,background:"#22c55e",borderRadius:"50%",display:"inline-block"}}/>Online agora
            </p>
          </div>
        </div>
        <div style={S.msgArea}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:8,alignItems:"flex-end",animation:"fadeUp 0.3s ease"}}>
              {m.role==="assistant"&&<div style={S.agentAv2}>{kb.personalidade.nome[0]}</div>}
              <div style={m.role==="user"?S.uBub:S.aBub}>
                <p style={{fontSize:13,lineHeight:1.65,whiteSpace:"pre-wrap",color:"inherit"}}>{m.content}</p>
              </div>
            </div>
          ))}
          {loading&&(
            <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
              <div style={S.agentAv2}>{kb.personalidade.nome[0]}</div>
              <div style={S.aBub}>
                <div style={{display:"flex",gap:5}}>
                  {[0,0.18,0.36].map((d,i)=><span key={i} style={{width:7,height:7,borderRadius:"50%",background:"#6366f1",display:"inline-block",animation:`blink 1s ${d}s ease-in-out infinite`}}/>)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
        <div style={S.inputArea}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(input);}}}
            placeholder={`Fale com ${kb.personalidade.nome}...`}
            style={S.ta} rows={1} disabled={loading}/>
          <button style={{...S.sendBtn,opacity:!input.trim()||loading?0.4:1}} onClick={()=>send(input)} disabled={!input.trim()||loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── SHARED UI ── */
function Shell({title,desc,children}){
  return(
    <div style={{maxWidth:820,animation:"fadeUp 0.3s ease"}}>
      <p style={{fontWeight:700,fontSize:20,color:"#0f172a",marginBottom:4}}>{title}</p>
      <p style={{fontSize:13,color:"#64748b",marginBottom:24,lineHeight:1.6}}>{desc}</p>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>{children}</div>
    </div>
  );
}
function Row({children}){return <div style={{display:"grid",gridTemplateColumns:`repeat(${Array.isArray(children)?children.length:1},1fr)`,gap:12}}>{children}</div>;}
function Field({label,value,onChange,multi,placeholder}){
  return(
    <div style={F.group}>
      <label style={F.label}>{label}</label>
      {multi
        ?<textarea style={F.ta} value={value} onChange={e=>onChange(e.target.value)} rows={3} placeholder={placeholder}/>
        :<input style={F.inp} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>
      }
    </div>
  );
}
function Card({children,onDel,label}){
  return(
    <div style={{background:"white",border:"1.5px solid #e2e8f0",borderRadius:12,padding:"16px 18px",display:"flex",flexDirection:"column",gap:12,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:12,fontWeight:600,color:"#94a3b8"}}>{label}</span>
        <button style={{width:26,height:26,border:"none",background:"#fee2e2",color:"#ef4444",borderRadius:6,cursor:"pointer",fontSize:12}} onClick={onDel}>✕</button>
      </div>
      {children}
    </div>
  );
}
function AddBtn({onClick,label}){
  return <button style={{padding:"10px 18px",border:"2px dashed #cbd5e1",background:"transparent",borderRadius:10,color:"#64748b",fontSize:13,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:500}} onClick={onClick}>{label}</button>;
}

const F={
  group:{display:"flex",flexDirection:"column",gap:5},
  label:{fontSize:12,fontWeight:600,color:"#374151",letterSpacing:"0.02em"},
  inp:{padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#1e293b",background:"white",fontFamily:"'Outfit',sans-serif",transition:"all 0.2s"},
  ta:{padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#1e293b",background:"white",resize:"vertical",fontFamily:"'Outfit',sans-serif",lineHeight:1.6,transition:"all 0.2s"},
  select:{padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#1e293b",background:"white",cursor:"pointer",fontFamily:"'Outfit',sans-serif"},
  toneBtn:{padding:"6px 14px",border:"1.5px solid #e2e8f0",borderRadius:20,fontSize:12,cursor:"pointer",background:"white",color:"#64748b",fontFamily:"'Outfit',sans-serif",transition:"all 0.2s"},
  toneBtnOn:{background:"#eef2ff",borderColor:"#6366f1",color:"#6366f1",fontWeight:600},
  preview:{background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:10,padding:"14px 16px"},
  previewLb:{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8},
  previewTxt:{fontSize:13,color:"#475569",lineHeight:1.7},
};

const S={
  root:{height:"100vh",background:"#f1f5f9",fontFamily:"'Outfit',sans-serif",display:"flex",flexDirection:"column",overflow:"hidden"},
  nav:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",height:52,background:"white",borderBottom:"1px solid #e2e8f0",flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"},
  brand:{display:"flex",alignItems:"center",gap:8},
  brandIcon:{width:30,height:30,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"},
  brandName:{fontWeight:700,fontSize:15,color:"#1e293b"},
  beta:{fontSize:9,background:"#6366f1",color:"white",padding:"2px 6px",borderRadius:4,fontWeight:700,letterSpacing:"0.08em"},
  navPills:{display:"flex",gap:4,background:"#f1f5f9",borderRadius:10,padding:3},
  pill:{padding:"6px 14px",borderRadius:7,border:"none",background:"transparent",color:"#64748b",fontSize:13,fontWeight:500,cursor:"pointer"},
  pillOn:{background:"white",color:"#1e293b",boxShadow:"0 1px 4px rgba(0,0,0,0.09)",fontWeight:600},
  agentBadge:{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#6366f1",background:"#eef2ff",padding:"4px 12px",borderRadius:20,fontWeight:500},
  agentDot:{width:6,height:6,background:"#22c55e",borderRadius:"50%",display:"inline-block"},
  adminWrap:{display:"flex",flex:1,overflow:"hidden"},
  sidebar:{width:210,background:"white",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",padding:"14px 10px",gap:3,flexShrink:0,overflowY:"auto"},
  sideHead:{fontSize:9,fontWeight:700,color:"#94a3b8",letterSpacing:"0.12em",textTransform:"uppercase",padding:"6px 8px 10px"},
  sideBtn:{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,border:"none",background:"transparent",color:"#64748b",fontSize:12,cursor:"pointer",position:"relative",fontFamily:"'Outfit',sans-serif",fontWeight:400},
  sideBtnOn:{background:"#eef2ff",color:"#6366f1",fontWeight:600},
  sideBar:{position:"absolute",right:0,top:"20%",width:3,height:"60%",background:"#6366f1",borderRadius:2},
  saveBtn:{padding:"9px",borderRadius:8,border:"none",color:"white",fontSize:13,fontWeight:600,cursor:"pointer",transition:"background 0.3s",marginTop:8},
  sideNote:{fontSize:10,color:"#94a3b8",textAlign:"center",lineHeight:1.5,marginTop:4},
  adminMain:{flex:1,overflowY:"auto",padding:"28px 36px",background:"#f8fafc"},
  chatWrap:{display:"flex",flex:1,overflow:"hidden"},
  chatInfo:{width:210,background:"white",borderRight:"1px solid #e2e8f0",padding:"16px 14px",display:"flex",flexDirection:"column",gap:10,flexShrink:0,overflowY:"auto"},
  agentCard:{background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:12,padding:"14px",display:"flex",flexDirection:"column",alignItems:"center",gap:5},
  agentAv:{width:44,height:44,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:18,flexShrink:0},
  agentAv2:{width:28,height:28,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:12,flexShrink:0},
  chatBox:{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:"#f8fafc"},
  chatHead:{background:"white",borderBottom:"1px solid #e2e8f0",padding:"12px 18px",display:"flex",gap:10,alignItems:"center",flexShrink:0},
  msgArea:{flex:1,overflowY:"auto",padding:"18px",display:"flex",flexDirection:"column",gap:10},
  uBub:{background:"linear-gradient(135deg,#6366f1,#7c3aed)",borderRadius:"16px 16px 4px 16px",padding:"10px 14px",maxWidth:"72%",boxShadow:"0 4px 14px rgba(99,102,241,0.22)",color:"white"},
  aBub:{background:"white",border:"1.5px solid #e2e8f0",borderRadius:"4px 16px 16px 16px",padding:"10px 14px",maxWidth:"75%",boxShadow:"0 1px 6px rgba(0,0,0,0.05)",color:"#1e293b"},
  inputArea:{padding:"10px 14px",background:"white",borderTop:"1px solid #e2e8f0",display:"flex",gap:8,alignItems:"flex-end",flexShrink:0},
  ta:{flex:1,border:"1.5px solid #e2e8f0",borderRadius:10,padding:"9px 13px",fontSize:13,fontFamily:"'Outfit',sans-serif",resize:"none",color:"#1e293b",background:"#f8fafc",maxHeight:100,overflowY:"auto",transition:"all 0.2s"},
  sendBtn:{width:38,height:38,background:"linear-gradient(135deg,#6366f1,#7c3aed)",border:"none",borderRadius:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 12px rgba(99,102,241,0.3)",transition:"all 0.2s"},
};
