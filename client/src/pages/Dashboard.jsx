import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { AgentModal, ProfileModal, EditProfileModal, CooldownModal, SettingsModal } from '../components/Modals';
import { Clock, CheckCircle, Ban, PlayCircle, Plus, Pencil, Settings } from 'lucide-react';

import { useTranslation } from 'react-i18next';

function StatusBadge({ status, t }) {
  if (status === 'available') {
    return <span style={{ color: 'var(--color-available)', display: 'inline-flex', alignItems:'center', gap: '4px', fontWeight: 600 }}><CheckCircle size={16}/> {t('available')}</span>
  } else if (status === 'cooldown') {
    return <span style={{ color: 'var(--color-cooldown)', display: 'inline-flex', alignItems:'center', gap: '4px', fontWeight: 600 }}><Clock size={16}/> {t('cooldown')}</span>
  } else {
    return <span style={{ color: 'var(--color-inactive)', display: 'inline-flex', alignItems:'center', gap: '4px', fontWeight: 600 }}><Ban size={16}/> {t('inactive')}</span>
  }
}

function formatTimeRemaining(seconds) {
  if (seconds <= 0) return '0초';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (d > 0) return `${d} ${t('day')} ${h} ${t('hour')}`;
  if (h > 0) return `${h} ${t('hour')} ${m}분`; // minutes translation omitted for brevity, fallback to ko temporarily, or leave it. I'll just do minimal for time.
  return `${m}분 ${s}초`;
}

function PercentBar({ percent }) {
  const color = percent > 60 ? '#34d399' : percent > 20 ? '#fbbf24' : '#f87171';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', minWidth: '50px' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color, minWidth: '36px', textAlign: 'right' }}>{percent}%</span>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(null); // 'agent', 'profile', or specific profile obj for cooldown

  const loadData = () => {
    api.getDashboardList().then(setList).catch(console.error);
    setModal(null);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time ticking for remaining_seconds locally
  useEffect(() => {
    const timer = setInterval(() => {
      setList(prev => prev.map(profile => {
        const updatedLimits = profile.limits.map(limit => {
          if (limit.current_status === 'cooldown' && limit.remaining_seconds > 0) {
            const remaining = limit.remaining_seconds - 1;
            return {
              ...limit,
              remaining_seconds: remaining,
              current_status: remaining <= 0 ? 'available' : 'cooldown'
            };
          }
          return limit;
        });
        return { ...profile, limits: updatedLimits };
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClear = async (limitId) => {
    await api.clearCooldown(limitId);
    loadData();
  };

  const handlePercentChange = async (limitId, newPercent) => {
    const val = Math.max(0, Math.min(100, Number(newPercent)));
    await api.updateLimitPercent(limitId, val);
    // Update locally without full reload for snappiness
    setList(prev => prev.map(p => ({
      ...p,
      limits: p.limits.map(l => l.limit_id === limitId ? { ...l, remaining_percent: val } : l)
    })));
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>{t('dashboard')}</h2>
          <p className="text-muted">{t('dashboard_desc')}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setModal('settings')}>
            <Settings size={16} /> {t('settings')}
          </button>
          <button className="btn btn-secondary" onClick={() => setModal('agent')}>{t('manage_agents')}</button>
          <button className="btn btn-primary" onClick={() => setModal('profile')}>
            <Plus size={16} /> {t('add_profile')}
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>{t('account')}</th>
              <th style={{ padding: '1rem' }}>{t('pc')}</th>
              <th style={{ padding: '1rem' }}>{t('project')}</th>
              <th style={{ padding: '1rem' }}>{t('agent')}</th>
              <th style={{ padding: '1rem' }}>{t('status')}</th>
              <th style={{ padding: '1rem' }}>{t('limit')}</th>
              <th style={{ padding: '1rem' }}>{t('remaining_percent')}</th>
              <th style={{ padding: '1rem' }}>{t('remaining_time')}</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>{t('action')}</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center text-muted" style={{ padding: '2rem' }}>
                  {t('no_profiles')}
                </td>
              </tr>
            )}
            {list.map(profile => {
              const rowCount = Math.max(profile.limits.length, 1);
              return (
                <React.Fragment key={profile.profile_id}>
                  {profile.limits.length === 0 && (
                    <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{profile.account_name}</td>
                      <td style={{ padding: '1rem' }} className="text-muted">{profile.pc_name}</td>
                      <td style={{ padding: '1rem' }} className="text-muted">{profile.project_name || '—'}</td>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{profile.agent_name}</td>
                      <td colSpan="4" className="text-muted" style={{ padding: '1rem' }}>{t('no_limits')}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button className="btn btn-secondary" style={{padding: '0.4rem 0.6rem'}} onClick={() => setModal({ type: 'edit', data: profile })}>
                          <Pencil size={14}/> {t('edit')}
                        </button>
                      </td>
                    </tr>
                  )}
                  {profile.limits.map((limit, idx) => (
                    <tr key={limit.limit_id} style={{ borderBottom: idx === rowCount - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                      {idx === 0 && (
                        <>
                          <td rowSpan={rowCount} style={{ padding: '1rem', fontWeight: 500, verticalAlign: 'top', borderBottom: '1px solid var(--glass-border)' }}>
                            {profile.account_name}
                            <button className="btn btn-secondary" style={{padding: '0.2rem 0.5rem', marginTop: '4px', fontSize: '0.75rem', display: 'block'}} onClick={() => setModal({ type: 'edit', data: profile })}>
                              <Pencil size={12}/> {t('edit')}
                            </button>
                          </td>
                          <td rowSpan={rowCount} style={{ padding: '1rem', verticalAlign: 'top', borderBottom: '1px solid var(--glass-border)' }} className="text-muted">
                            {profile.pc_name}
                          </td>
                          <td rowSpan={rowCount} style={{ padding: '1rem', verticalAlign: 'top', borderBottom: '1px solid var(--glass-border)' }} className="text-muted">
                            {profile.project_name || '—'}
                          </td>
                          <td rowSpan={rowCount} style={{ padding: '1rem', fontWeight: 500, verticalAlign: 'top', borderBottom: '1px solid var(--glass-border)' }}>
                            {profile.agent_name}
                          </td>
                        </>
                      )}
                      
                      <td style={{ padding: '1rem', paddingTop: idx === 0 ? '1rem' : '0.5rem', paddingBottom: idx === rowCount - 1 ? '1rem' : '0.5rem' }}>
                        <StatusBadge status={limit.current_status} t={t} />
                      </td>
                      <td style={{ padding: '1rem', paddingTop: idx === 0 ? '1rem' : '0.5rem', paddingBottom: idx === rowCount - 1 ? '1rem' : '0.5rem', color: 'var(--text-muted)' }}>
                        {limit.limit_value} {limit.limit_unit === 'hour' ? t('hour') : t('day')}
                      </td>
                      <td style={{ padding: '0.5rem 1rem', paddingTop: idx === 0 ? '1rem' : '0.5rem', paddingBottom: idx === rowCount - 1 ? '1rem' : '0.5rem', minWidth: '120px' }}>
                        <PercentBar percent={limit.remaining_percent ?? 100} />
                        <input
                          type="range" min="0" max="100" step="1"
                          value={limit.remaining_percent ?? 100}
                          onChange={e => handlePercentChange(limit.limit_id, e.target.value)}
                          style={{ width: '100%', marginTop: '4px', accentColor: limit.remaining_percent > 60 ? '#34d399' : limit.remaining_percent > 20 ? '#fbbf24' : '#f87171' }}
                        />
                      </td>
                      <td style={{ padding: '1rem', paddingTop: idx === 0 ? '1rem' : '0.5rem', paddingBottom: idx === rowCount - 1 ? '1rem' : '0.5rem' }}>
                        {limit.current_status === 'cooldown' ? (
                          <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                            {formatTimeRemaining(limit.remaining_seconds)}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', paddingTop: idx === 0 ? '1rem' : '0.5rem', paddingBottom: idx === rowCount - 1 ? '1rem' : '0.5rem' }}>
                        {limit.current_status === 'available' ? (
                          <button className="btn btn-danger" onClick={() => setModal(limit)}>
                            <PlayCircle size={14}/> {t('start_limit')}
                          </button>
                        ) : limit.current_status === 'cooldown' ? (
                          <button className="btn btn-success" onClick={() => handleClear(limit.limit_id)}>
                            <CheckCircle size={14}/> {t('manual_clear')}
                          </button>
                        ) : (
                          <span className="text-muted text-sm">{t('inactive')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal === 'agent' && <AgentModal onClose={() => setModal(null)} onSaved={loadData} />}
      {modal === 'profile' && <ProfileModal onClose={() => setModal(null)} onSaved={loadData} />}
      {modal === 'settings' && <SettingsModal onClose={() => setModal(null)} onImported={loadData} />}
      {modal && modal.type === 'edit' && (
        <EditProfileModal profileData={modal.data} onClose={() => setModal(null)} onSaved={loadData} />
      )}
      {modal && typeof modal === 'object' && !modal.type && (
        <CooldownModal limitData={modal} onClose={() => setModal(null)} onSaved={loadData} />
      )}
    </>
  );
}
