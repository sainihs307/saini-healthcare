import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavItem { label: string; path: string; icon: string; }
interface LayoutProps { children: React.ReactNode; navItems: NavItem[]; role: 'doctor' | 'staff' | 'patient'; }

const themes = {
  doctor:  { primary: '#2563EB', light: '#EFF6FF', text: '#1D4ED8', soft: '#DBEAFE', gradient: 'linear-gradient(135deg, #1e3a8a, #2563EB)' },
  staff:   { primary: '#7C3AED', light: '#F5F3FF', text: '#6D28D9', soft: '#EDE9FE', gradient: 'linear-gradient(135deg, #4c1d95, #7C3AED)' },
  patient: { primary: '#059669', light: '#ECFDF5', text: '#047857', soft: '#D1FAE5', gradient: 'linear-gradient(135deg, #064e3b, #059669)' },
};

const Layout: React.FC<LayoutProps> = ({ children, navItems, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const t = themes[role];
  const [open, setOpen] = useState(false);
  const [isMd, setIsMd] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handler = () => setIsMd(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const SidebarInner = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#1a1f2e' }}>
      <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ width:36, height:36, background:t.primary, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'white' }}>SH</div>
          <div>
            <div style={{ color:'white', fontWeight:700, fontSize:13 }}>Saini Healthcare</div>
            <div style={{ color:'#94a3b8', fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>{role} portal</div>
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 12px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, background:t.primary, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'white', flexShrink:0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ color:'#e2e8f0', fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
            <div style={{ color:'#64748b', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email || user?.phone}</div>
          </div>
        </div>
      </div>

      <nav style={{ flex:1, padding:'12px 10px', overflowY:'auto' }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => { navigate(item.path); setOpen(false); }}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:9, marginBottom:2, background: active ? `${t.primary}22` : 'transparent', color: active ? t.soft : '#94a3b8', fontWeight: active ? 600 : 400, fontSize:13, border:'none', cursor:'pointer', textAlign:'left', transition:'all 0.15s', borderLeft: active ? `3px solid ${t.primary}` : '3px solid transparent' }}>
              <span style={{ fontSize:16 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding:'10px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => { logout(); navigate('/login'); }}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:9, background:'transparent', color:'#64748b', fontSize:13, fontWeight:500, border:'none', cursor:'pointer', transition:'all 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as any).style.background='rgba(239,68,68,0.1)'; (e.currentTarget as any).style.color='#f87171'; }}
          onMouseLeave={e => { (e.currentTarget as any).style.background='transparent'; (e.currentTarget as any).style.color='#64748b'; }}>
          🚪 Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f1f5f9', fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Desktop sidebar */}
      {isMd && (
        <aside style={{ width:240, position:'fixed', top:0, left:0, bottom:0, zIndex:30, boxShadow:'2px 0 12px rgba(0,0,0,0.15)' }}>
          <SidebarInner />
        </aside>
      )}

      {/* Mobile overlay */}
      {!isMd && open && (
        <div style={{ position:'fixed', inset:0, zIndex:40 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} onClick={() => setOpen(false)} />
          <aside style={{ position:'absolute', left:0, top:0, bottom:0, width:240 }}>
            <SidebarInner />
          </aside>
        </div>
      )}

      {/* Main */}
      <main style={{ flex:1, marginLeft: isMd ? 240 : 0, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        <header style={{ background:'white', borderBottom:'1px solid #e2e8f0', height:56, padding:'0 28px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:20, boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          {!isMd && (
            <button onClick={() => setOpen(true)} style={{ border:'none', background:'none', fontSize:22, cursor:'pointer', padding:'4px 8px' }}>☰</button>
          )}
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20, background:t.soft, color:t.text, textTransform:'capitalize' }}>{role}</span>
            <div style={{ width:32, height:32, background:t.primary, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'white' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <div style={{ flex:1, padding:'28px 32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
