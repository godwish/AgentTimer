import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <select 
        value={i18n.language} 
        onChange={changeLanguage}
        style={{
          padding: '4px 8px',
          borderRadius: '6px',
          background: 'rgba(255,255,255,0.1)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-color)',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        <option value="ko" style={{color: 'black'}}>🇰🇷 한국어</option>
        <option value="en" style={{color: 'black'}}>🇺🇸 English</option>
        <option value="ja" style={{color: 'black'}}>🇯🇵 日本語</option>
      </select>
    </div>
  );
}
