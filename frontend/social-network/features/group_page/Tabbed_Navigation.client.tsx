"use client";
// group_page.client.tsx
// Minimal client component

// export default function GroupPageClient() {
//   return <div className="group_page">{/* client UI: GroupPageClient */}</div>;
// }

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import styles from './TabbedNavigation.module.css';
import {useRouter} from "next/navigation"

export default function TabbedNavigation({id}: {id: string}) {
  const [activeTab, setActiveTab] = useState('posts');
  const router = useRouter();

  const tabs = [
    { id: 'posts', label: 'Posts', route: `/groups/${id}/posts` },
    { id: 'chat', label: 'Chat', icon: MessageSquare, route: `/groups/${id}/chat` },
    { id: 'events', label: 'Events', badge: 2, route: `/groups/${id}/events` },
    { id: 'members', label: 'Members', count: 2, route: `/groups/${id}/members` }
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
              {tab.icon && <tab.icon className={styles.tabIcon} />}
              {tab.label}
              {tab.count && ` (${tab.count})`}
              {tab.badge && (
                <span className={styles.tabBadge}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>
  );
}