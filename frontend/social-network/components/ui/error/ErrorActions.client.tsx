// components/ErrorActions.client.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './ErrorPage.module.css';

export default function ErrorActions({ fallbackPath = '/' }: { fallbackPath?: string }) {
  const router = useRouter();

  function goHome() {
    router.replace(fallbackPath);
  }

  function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.replace(fallbackPath);
    }
  }

  function retry() {
    // refresh will re-run server components / data fetching on current route
    router.refresh();
  }

  return (
    <div className={styles.actionRow} role="group" aria-label="Error actions">
      <button onClick={retry} className={`${styles.btn} ${styles.btnPrimary}`} aria-label="Retry">Retry</button>
      <button onClick={goBack} className={`${styles.btn} ${styles.btnOutline}`} aria-label="Back">Back</button>
      <button onClick={goHome} className={`${styles.btn} ${styles.btnGhost}`} aria-label="Home">Home</button>
    </div>
  );
}
