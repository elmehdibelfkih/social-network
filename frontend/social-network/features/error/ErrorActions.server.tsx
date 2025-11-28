import ErrorActions from "./ErrorActions.client";
import styles from './ErrorPage.module.css';


type SearchParams = {
  status?: string;
  title?: string;
  msg?: string;
  desc?: string;
};

function safeDecode(s?: string) {
  if (!s) return '';
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export default function ErrComponent({ searchParams }: { searchParams?: SearchParams }) {
    const status = safeDecode(searchParams?.status) || 'unknown';
  const title = safeDecode(searchParams?.title) || 'Something went wrong';
  const message = safeDecode(searchParams?.msg) || '';
  const description = safeDecode(searchParams?.desc) || '';

  return (
    <main className={styles.root} role="main" aria-labelledby="error-title">
      <div className={styles.card}>

        <header className={styles.header}>
          <div className={styles.iconWrap} aria-hidden>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="var(--primary-purple)" strokeWidth="1.5" />
              <path d="M12 8v5" stroke="var(--white)" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M12 15h.01" stroke="var(--white)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>

          <div className={styles.titleGroup}>
            <h1 id="error-title" className={styles.title}>{title}</h1>
            <p className={styles.status}>Status {status}</p>
          </div>
        </header>

        <section className={styles.body}>
          {message && <p className={styles.message}>{message}</p>}
          {description && <p className={styles.description}>{description}</p>}
        </section>

        <footer className={styles.actions}>
          <ErrorActions fallbackPath="/" />
        </footer>
      </div>
    </main>
  );
    
}