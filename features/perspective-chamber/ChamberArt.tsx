import styles from './Chamber.module.css';

/** Ornamental geometry, not a measured brain pathway or an assessment. */
export function ChamberVault() {
  return <svg className={styles.vault} viewBox="0 0 1200 460" fill="none" preserveAspectRatio="none" aria-hidden="true">
    <path d="M16 446V170Q16 16 180 16H1020Q1184 16 1184 170V446M29 446V172Q29 29 182 29H1018Q1171 29 1171 172V446" />
    <path d="M45 400V185Q45 46 190 46M1155 400V185Q1155 46 1010 46M16 220H48M1152 220H1184M16 230H48M1152 230H1184" />
    <path d="M570 16l30 16 30-16M600 7v42M592 25l8 12 8-12M65 310v40m-10-20h20M1135 310v40m-10-20h20" />
  </svg>;
}
export function LensAstrolabe({ active }: { active: number }) {
  return <svg className={styles.astrolabe} viewBox="0 0 600 360" fill="none" aria-hidden="true">
    <defs><radialGradient id="chamber-light"><stop stopColor="#F4DDA6" stopOpacity=".3" /><stop offset="1" stopColor="#DBB86B" stopOpacity="0" /></radialGradient></defs>
    <ellipse cx="300" cy="180" rx="230" ry="164" fill="url(#chamber-light)" stroke="none" />
    <circle cx="300" cy="180" r="147" /><circle cx="300" cy="180" r="139" /><circle cx="300" cy="180" r="103" />
    <ellipse cx="300" cy="180" rx="226" ry="89" transform="rotate(-24 300 180)" /><ellipse cx="300" cy="180" rx="226" ry="89" transform="rotate(24 300 180)" />
    {Array.from({length:48},(_,i)=><path key={i} d={`M300 33v${i%4===0?12:5}`} transform={`rotate(${i*7.5} 300 180)`} />)}
    <path d="M300 122l16 42 42 16-42 16-16 42-16-42-42-16 42-16z" />
    <g className={styles.litRoute} key={active}><path d={`M300 180L${[140,460,140,460][active]} ${[76,76,284,284][active]}`} /><circle cx={[140,460,140,460][active]} cy={[76,76,284,284][active]} r="8" /></g>
  </svg>;
}
