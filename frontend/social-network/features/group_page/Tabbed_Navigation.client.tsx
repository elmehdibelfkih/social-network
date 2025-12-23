"use client";

import { useState } from 'react';
import styles from './TabbedNavigation.module.css';
import { useRouter } from "next/navigation"

export default function TabbedNavigation({ id, eventCount, memberscount }: { id: string, eventCount: number, memberscount: number }) {
  const [activeTab, setActiveTab] = useState('posts');
  const router = useRouter();

  const tabs = [
    { id: 'posts', label: 'Posts', route: `/groups/${id}/posts` },
    { id: 'events', label: 'Events', count: eventCount, route: `/groups/${id}/events` },
    { id: 'members', label: 'Members', count: memberscount, route: `/groups/${id}/members` },
    { id: 'chat', label: 'Chat', count: memberscount, route: `/groups/${id}/chat` }
  ];

  const redirect = (route: string) => {
    router.push(route);
  }

  return (
    <div className={styles.contentWrapper}>
      <div role="tablist" aria-orientation="horizontal" className={styles.tabList}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-content`}
            onClick={() => {
              setActiveTab(tab.id);
              redirect(tab.route);
            }}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
          >
            {tab.label}
            {tab.count !== undefined && ` (${tab.count})`}
          </button>
        ))}
      </div>
    </div>
  );
}