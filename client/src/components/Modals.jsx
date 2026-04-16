import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LanguageSelector from './LanguageSelector';

export function AgentModal({ onClose, onSaved }) {
  const [agents, setAgents] = useState([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const loadAgents = () => api.getAgents().then(setAgents);
  useEffect(() => { loadAgents(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await api.createAgent({ name: newName, description: newDesc });
    setNewName(''); setNewDesc('');
    loadAgents();
  };

  const handleUpdate = async (id) => {
    await api.updateAgent(id, { name: editName, description: editDesc });
    setEditId(null);
    loadAgents();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" 에이전트를 삭제하시겠습니까?\n이 에이전트를 사용하는 프로필이 있으면 오류가 발생할 수 있습니다.`)) return;
    await api.deleteAgent(id);
    loadAgents();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <h2 className="mb-6">에이전트 관리</h2>

        {/* Agent List */}
        <div style={{ marginBottom: '1.5rem' }}>
          {agents.length === 0 && <p className="text-muted text-sm">등록된 에이전트가 없습니다.</p>}
          {agents.map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '0.6rem 0', borderBottom: '1px solid var(--glass-border)'
            }}>
              {editId === a.id ? (
                <>
                  <input className="form-input" style={{ flex: 2 }} value={editName} onChange={e => setEditName(e.target.value)} />
                  <input className="form-input" style={{ flex: 2 }} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="설명" />
                  <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem' }} onClick={() => handleUpdate(a.id)}>저장</button>
                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem' }} onClick={() => setEditId(null)}>취소</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 2, fontWeight: 500 }}>{a.name}</span>
                  <span className="text-muted text-sm" style={{ flex: 2 }}>{a.description || '—'}</span>
                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setEditId(a.id); setEditName(a.name); setEditDesc(a.description || ''); }}>수정</button>
                  <button className="btn btn-danger" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDelete(a.id, a.name)}>삭제</button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add new agent */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <label className="form-label" style={{ marginBottom: '0.5rem' }}>새 에이전트 추가</label>
          <div className="flex gap-2">
            <input className="form-input" style={{ flex: 1 }} value={newName} onChange={e => setNewName(e.target.value)} placeholder="이름 (예: Codex)" />
            <input className="form-input" style={{ flex: 1 }} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="설명 (선택)" />
            <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={handleAdd}>추가</button>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="btn btn-secondary" onClick={() => { onSaved(); onClose(); }}>닫기</button>
        </div>
      </div>
    </div>
  );
}

export function ProfileModal({ onClose, onSaved }) {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({ account_name: '', pc_name: '', project_name: '', agent_id: '', memo: '' });
  const [limits, setLimits] = useState([{ limit_value: 1, limit_unit: 'hour' }]);

  useEffect(() => {
    api.getAgents().then(data => {
      setAgents(data);
      if (data.length > 0) setForm(f => ({ ...f, agent_id: data[0].id }));
    });
  }, []);

  const save = async () => {
    if (!form.account_name || !form.pc_name || !form.agent_id) return alert('필수 항목을 입력하세요.');
    await api.createProfile({ 
      ...form, 
      limits: limits.map(l => ({ ...l, limit_value: Number(l.limit_value) })) 
    });
    onSaved();
  };

  const addLimit = () => setLimits([...limits, { limit_value: 1, limit_unit: 'hour' }]);
  const removeLimit = index => setLimits(limits.filter((_, i) => i !== index));

  const updateLimit = (index, field, value) => {
    const newLimits = [...limits];
    newLimits[index][field] = value;
    setLimits(newLimits);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="mb-6">새 제한 프로필 추가</h2>
        
        <div className="flex gap-4">
          <div className="form-group" style={{flex: 1}}>
            <label className="form-label">계정 이름</label>
            <input className="form-input" value={form.account_name} onChange={e => setForm({...form, account_name: e.target.value})} placeholder="계정 1" />
          </div>
          <div className="form-group" style={{flex: 1}}>
            <label className="form-label">PC 이름</label>
            <input className="form-input" value={form.pc_name} onChange={e => setForm({...form, pc_name: e.target.value})} placeholder="메인 PC" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">프로젝트</label>
          <input className="form-input" value={form.project_name} onChange={e => setForm({...form, project_name: e.target.value})} placeholder="프로젝트 이름 (선택)" />
        </div>

        <div className="form-group">
          <label className="form-label">에이전트</label>
          <select className="form-select" value={form.agent_id} onChange={e => setForm({...form, agent_id: e.target.value})}>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div className="form-group mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="form-label mb-0">제한 조건 (다중 가능)</label>
            <button className="btn btn-secondary" style={{padding: '0.2rem 0.5rem'}} onClick={addLimit}>+ 조건 추가</button>
          </div>
          {limits.map((limit, i) => (
            <div className="flex gap-2 items-center mb-2" key={i}>
              <input type="number" className="form-input" style={{flex: 1}} value={limit.limit_value} onChange={e => updateLimit(i, 'limit_value', e.target.value)} />
              <select className="form-select" style={{flex: 1}} value={limit.limit_unit} onChange={e => updateLimit(i, 'limit_unit', e.target.value)}>
                <option value="hour">시간</option>
                <option value="day">일</option>
              </select>
              {limits.length > 1 && (
                <button className="btn btn-danger" style={{padding: '0.625rem'}} onClick={() => removeLimit(i)}>X</button>
              )}
            </div>
          ))}
        </div>

        <div className="form-group mb-6">
          <label className="form-label">메모 (선택)</label>
          <input className="form-input" value={form.memo} onChange={e => setForm({...form, memo: e.target.value})} />
        </div>

        <div className="flex justify-between">
          <button className="btn btn-secondary" onClick={onClose}>취소</button>
          <button className="btn btn-primary" onClick={save}>프로필 저장</button>
        </div>
      </div>
    </div>
  );
}

export function EditProfileModal({ profileData, onClose, onSaved }) {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({ account_name: '', pc_name: '', project_name: '', agent_id: '', memo: '' });
  const [limits, setLimits] = useState([]);

  useEffect(() => {
    api.getAgents().then(setAgents);
    setForm({
      account_name: profileData.account_name,
      pc_name: profileData.pc_name,
      project_name: profileData.project_name || '',
      agent_id: profileData.agent_id || '',
      memo: profileData.memo || ''
    });
    setLimits(
      profileData.limits.map(l => ({ limit_value: l.limit_value, limit_unit: l.limit_unit }))
    );
  }, [profileData]);

  // Once agents load, resolve agent_id from agent_name if needed
  useEffect(() => {
    if (agents.length > 0 && !form.agent_id) {
      const match = agents.find(a => a.name === profileData.agent_name);
      if (match) setForm(f => ({ ...f, agent_id: match.id }));
    }
  }, [agents]);

  const save = async () => {
    if (!form.account_name || !form.pc_name) return alert('필수 항목을 입력하세요.');
    await api.updateProfile(profileData.profile_id, {
      ...form,
      is_active: 1,
      limits: limits.map(l => ({ ...l, limit_value: Number(l.limit_value) }))
    });
    onSaved();
  };

  const handleDelete = async () => {
    if (!confirm('이 프로필을 삭제하시겠습니까? 관련 제한 조건과 쿨다운도 모두 삭제됩니다.')) return;
    await api.deleteProfile(profileData.profile_id);
    onSaved();
  };

  const addLimit = () => setLimits([...limits, { limit_value: 1, limit_unit: 'hour' }]);
  const removeLimit = index => setLimits(limits.filter((_, i) => i !== index));
  const updateLimit = (index, field, value) => {
    const newLimits = [...limits];
    newLimits[index][field] = value;
    setLimits(newLimits);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="mb-6">프로필 수정</h2>
        
        <div className="flex gap-4">
          <div className="form-group" style={{flex: 1}}>
            <label className="form-label">계정 이름</label>
            <input className="form-input" value={form.account_name} onChange={e => setForm({...form, account_name: e.target.value})} />
          </div>
          <div className="form-group" style={{flex: 1}}>
            <label className="form-label">PC 이름</label>
            <input className="form-input" value={form.pc_name} onChange={e => setForm({...form, pc_name: e.target.value})} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">프로젝트</label>
          <input className="form-input" value={form.project_name} onChange={e => setForm({...form, project_name: e.target.value})} placeholder="프로젝트 이름 (선택)" />
        </div>

        <div className="form-group">
          <label className="form-label">에이전트</label>
          <select className="form-select" value={form.agent_id} onChange={e => setForm({...form, agent_id: e.target.value})}>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div className="form-group mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="form-label mb-0">제한 조건 (다중 가능)</label>
            <button className="btn btn-secondary" style={{padding: '0.2rem 0.5rem'}} onClick={addLimit}>+ 조건 추가</button>
          </div>
          {limits.map((limit, i) => (
            <div className="flex gap-2 items-center mb-2" key={i}>
              <input type="number" className="form-input" style={{flex: 1}} value={limit.limit_value} onChange={e => updateLimit(i, 'limit_value', e.target.value)} />
              <select className="form-select" style={{flex: 1}} value={limit.limit_unit} onChange={e => updateLimit(i, 'limit_unit', e.target.value)}>
                <option value="hour">시간</option>
                <option value="day">일</option>
              </select>
              {limits.length > 1 && (
                <button className="btn btn-danger" style={{padding: '0.625rem'}} onClick={() => removeLimit(i)}>X</button>
              )}
            </div>
          ))}
        </div>

        <div className="form-group mb-6">
          <label className="form-label">메모 (선택)</label>
          <input className="form-input" value={form.memo} onChange={e => setForm({...form, memo: e.target.value})} />
        </div>

        <div className="flex justify-between">
          <button className="btn btn-danger" onClick={handleDelete}>프로필 삭제</button>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={onClose}>취소</button>
            <button className="btn btn-primary" onClick={save}>수정 저장</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CooldownModal({ limitData, onClose, onSaved }) {
  const [inputType, setInputType] = useState('duration');
  const [endsAt, setEndsAt] = useState('');
  const [duration, setDuration] = useState({ d: 0, h: 0, m: 0 });
  const [note, setNote] = useState('');

  useEffect(() => {
    const now = new Date();
    if (limitData.limit_unit === 'hour') {
      now.setHours(now.getHours() + limitData.limit_value);
      setDuration({ d: 0, h: limitData.limit_value, m: 0 });
    } else if (limitData.limit_unit === 'day') {
      now.setDate(now.getDate() + limitData.limit_value);
      setDuration({ d: limitData.limit_value, h: 0, m: 0 });
    }
    setEndsAt(new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  }, [limitData]);

  const save = async () => {
    let isoDate;
    if (inputType === 'datetime') {
      isoDate = new Date(endsAt).toISOString();
    } else {
      const now = new Date();
      now.setDate(now.getDate() + Number(duration.d));
      now.setHours(now.getHours() + Number(duration.h));
      now.setMinutes(now.getMinutes() + Number(duration.m));
      isoDate = now.toISOString();
    }
    await api.startCooldown({ limit_id: limitData.limit_id, ends_at: isoDate, note });
    onSaved();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="mb-2">제한 설정 (리셋 목표지정)</h2>
        <p className="text-muted text-sm mb-6">
          선택된 조건: <b>{limitData.limit_value} {limitData.limit_unit === 'hour' ? '시간' : '일'}</b> (기준)
        </p>

        <div className="flex gap-2 mb-4">
          <button className={`btn ${inputType === 'duration' ? 'btn-primary' : 'btn-secondary'}`} style={{flex: 1}} onClick={() => setInputType('duration')}>남은 시간 입력</button>
          <button className={`btn ${inputType === 'datetime' ? 'btn-primary' : 'btn-secondary'}`} style={{flex: 1}} onClick={() => setInputType('datetime')}>목표 일시 입력</button>
        </div>

        {inputType === 'duration' ? (
          <div className="form-group">
            <label className="form-label">리셋까지 얼마나 남았나요?</label>
            <div className="flex gap-2 items-center">
              <input type="number" className="form-input" min="0" value={duration.d} onChange={e => setDuration({...duration, d: e.target.value})} style={{width: '70px'}} />일
              <input type="number" className="form-input" min="0" max="23" value={duration.h} onChange={e => setDuration({...duration, h: e.target.value})} style={{width: '70px'}} />시간
              <input type="number" className="form-input" min="0" max="59" value={duration.m} onChange={e => setDuration({...duration, m: e.target.value})} style={{width: '70px'}} />분
            </div>
            <small className="text-muted" style={{ display: 'block', marginTop: '4px' }}>AI가 알려준 남은 시간을 입력하세요. (예: Refreshes in 6 days, 1 hour)</small>
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">리셋 예정 일시 (직접 지정)</label>
            <input type="datetime-local" className="form-input" value={endsAt} onChange={e => setEndsAt(e.target.value)} />
            <small className="text-muted" style={{ display: 'block', marginTop: '4px' }}>지정하신 시각에 도달하면 제한이 풀립니다.</small>
          </div>
        )}

        <div className="form-group mb-6 mt-4">
          <label className="form-label">메모 (선택)</label>
          <input className="form-input" value={note} onChange={e => setNote(e.target.value)} placeholder="왜 제한이 시작되었나요?" />
        </div>

        <div className="flex justify-between">
          <button className="btn btn-secondary" onClick={onClose}>취소</button>
          <button className="btn btn-danger" onClick={save}>제한 시작</button>
        </div>
      </div>
    </div>
  );
}

export function SettingsModal({ onClose, onImported }) {
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', msg: '' }

  const handleExport = async () => {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agent-timer-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus({ type: 'success', msg: '데이터를 성공적으로 내보냈습니다.' });
    } catch (e) {
      setStatus({ type: 'error', msg: '내보내기 실패: ' + e.message });
    }
  };

  const processFile = async (file) => {
    if (!file || !file.name.endsWith('.json')) {
      setStatus({ type: 'error', msg: 'JSON 파일만 업로드 가능합니다.' });
      return;
    }
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.agents && !data.profiles) {
        setStatus({ type: 'error', msg: '올바른 백업 파일이 아닙니다.' });
        return;
      }
      if (!confirm('기존 데이터를 모두 덮어씁니다. 계속하시겠습니까?')) return;
      const result = await api.importData(data);
      setStatus({ type: 'success', msg: `가져오기 완료! 에이전트 ${result.imported.agents}개, 프로필 ${result.imported.profiles}개, 조건 ${result.imported.profile_limits}개 복원됨.` });
      if (onImported) onImported();
    } catch (e) {
      setStatus({ type: 'error', msg: '가져오기 실패: ' + e.message });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="mb-6">⚙ 설정</h2>

        <div className="form-group mb-6">
          <label className="form-label">언어 설정 (Language)</label>
          <div style={{ marginTop: '0.5rem' }}>
            <LanguageSelector />
          </div>
        </div>

        <div className="form-group mb-6">
          <label className="form-label">데이터 내보내기</label>
          <p className="text-muted text-sm mb-2">모든 에이전트, 프로필, 제한 조건, 쿨다운 데이터를 JSON 파일로 저장합니다.</p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleExport}>
            📦 JSON 내보내기
          </button>
        </div>

        <div className="form-group mb-6">
          <label className="form-label">데이터 가져오기</label>
          <p className="text-muted text-sm mb-2">백업한 JSON 파일을 아래에 드래그하거나 클릭하여 업로드하세요. 기존 데이터는 덮어씌워집니다.</p>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('import-file-input').click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--glass-border)'}`,
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? 'rgba(96, 165, 250, 0.1)' : 'rgba(255,255,255,0.03)',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📂</div>
            <div className="text-muted">JSON 파일을 여기에 드래그하거나 클릭하세요</div>
          </div>
          <input id="import-file-input" type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileInput} />
        </div>

        {status && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            background: status.type === 'success' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
            color: status.type === 'success' ? '#34d399' : '#f87171',
            fontSize: '0.875rem'
          }}>
            {status.msg}
          </div>
        )}

        <div className="flex justify-end">
          <button className="btn btn-secondary" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}
