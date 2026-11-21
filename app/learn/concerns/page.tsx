import { PageIntro } from '@/components/UI';
import { ConcernDirectory } from './ConcernDirectory';
import styles from './concerns.module.css';

export const metadata = {
  title: 'Browse by concern',
  description: 'Find lessons, worksheets, and evidence notes for everyday psychological concerns and named conditions.',
  alternates: { canonical: '/learn/concerns/' },
};

export default function Page() {
  return <div className={styles.page}>
    <PageIntro scene="curriculum" eyebrow="LEARN" title="Browse by concern"
      description="Start with something you’re experiencing, or look up a condition to find the research behind it." />
    <ConcernDirectory />
  </div>;
}
