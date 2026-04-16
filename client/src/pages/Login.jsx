import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import { api } from '../api';
import LanguageSelector from '../components/LanguageSelector';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError(t('error_required'));
      return;
    }
    try {
      const res = await api.login(form);
      if (res.token) {
        Cookies.set('admin_token', res.token, { expires: 1 });
        navigate('/');
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <LanguageSelector />
        </div>
        <h2 style={{ marginBottom: '2rem' }}>{t('login_title')}</h2>

        {error && <div style={{ color: 'var(--color-cooldown)', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">{t('username')}</label>
            <input 
              className="form-input" 
              value={form.username} 
              onChange={e => setForm({...form, username: e.target.value})} 
              autoFocus
            />
          </div>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <label className="form-label">{t('password')}</label>
            <input 
              type="password"
              className="form-input" 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            {t('login')}
          </button>
        </form>
      </div>
    </div>
  );
}
