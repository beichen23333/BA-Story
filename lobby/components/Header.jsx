import React from "react";
import { LANGUAGES } from "../../public/texts.js";

export function Header({ t, language, setLanguage, voiceLanguage, setVoiceLanguage, userName, setUserName, isClubDetail = false }) {
  return (
    <header className="topbar">
      <div className="page-title">{t.pageTitle}</div>
      <div className="language-control">
        <label htmlFor="page-language">{t.interfaceLanguageLabel}</label>
        <select id="page-language" aria-label={t.languageLabel} value={language} onChange={(event) => setLanguage(event.target.value)}>
          {LANGUAGES.map((item) => <option key={item.code} value={item.code}>{t[`languageName_${item.code}`] || item.label}</option>)}
        </select>
      </div>
      <div className="language-control voice-language-control">
        <label htmlFor="story-voice-language">{t.voiceLanguageLabel}</label>
        <select id="story-voice-language" aria-label={t.voiceLanguageLabel} value={voiceLanguage} onChange={(event) => setVoiceLanguage(event.target.value)}>
          {[{ code: "cn", label: t.voiceCn }, { code: "jp", label: t.voiceJp }, { code: "kr", label: t.voiceKr }].map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
        </select>
      </div>
      <div className="username-control">
        <label htmlFor="story-user-name">{t.userNameLabel}</label>
        <input id="story-user-name" aria-label={t.userNameLabel} type="text" maxLength={40} value={userName} onChange={(event) => setUserName(event.target.value)} placeholder={t.userNamePlaceholder || "sensei"} />
      </div>
    </header>
  );
}
