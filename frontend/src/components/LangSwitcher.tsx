import { useLanguage } from '../context/LanguageContext';

export function LangSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="lang-switcher">
      <button
        className={`lang-btn ${lang === 'FR' ? 'active' : ''}`}
        onClick={() => setLang('FR')}
      >FR</button>
      <button
        className={`lang-btn ${lang === 'EN' ? 'active' : ''}`}
        onClick={() => setLang('EN')}
      >EN</button>
    </div>
  );
}
