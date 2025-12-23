"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import CreateGroupModal from "./creat_group.client";
import GroupCardClient from "./group_card.client";
import { GroupService } from "./group_card.services";
import { Group, CreateGroupPayload } from "./types";
import styles from './styles.module.css';

interface GroupsPageClientProps {
  initialMyGroups: Group[];
  initialDiscoverGroups: Group[];
}

type TabType = 'my-groups' | 'discover';

export default function GroupsPageClient({ 
  initialMyGroups, 
  initialDiscoverGroups 
}: GroupsPageClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('my-groups');
  
  // My Groups state
  const [myGroups, setMyGroups] = useState<Group[]>(initialMyGroups);
  const [myGroupsOffset, setMyGroupsOffset] = useState(initialMyGroups.length);
  const [isLoadingMyGroups, setIsLoadingMyGroups] = useState(false);
  const [hasMoreMyGroups, setHasMoreMyGroups] = useState(initialMyGroups.length === 10);
  
  // Discover Groups state
  const [discoverGroups, setDiscoverGroups] = useState<Group[]>(initialDiscoverGroups);
  const [lastDiscoverGroupId, setLastDiscoverGroupId] = useState<number | undefined>(
    initialDiscoverGroups.length > 0 
      ? initialDiscoverGroups[initialDiscoverGroups.length - 1].groupId 
      : undefined
  );
  const [isLoadingDiscover, setIsLoadingDiscover] = useState(false);
  const [hasMoreDiscover, setHasMoreDiscover] = useState(initialDiscoverGroups.length === 10);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Intersection Observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  async function handleSubmit(payload: CreateGroupPayload) {
    try {
      const newGroup = await GroupService.createGroup(payload);
      console.log("Group created:", newGroup);
      
      // Refresh both lists
      setIsRefreshing(true);
      const [updatedMyGroups, updatedDiscoverGroups] = await Promise.all([
        GroupService.getMyGroups(10, 0),
        GroupService.getOthersGroups(10, 0)
      ]);
      
      setMyGroups(updatedMyGroups);
      setMyGroupsOffset(updatedMyGroups.length);
      setHasMoreMyGroups(updatedMyGroups.length === 10);
      
      setDiscoverGroups(updatedDiscoverGroups);
      setLastDiscoverGroupId(
        updatedDiscoverGroups.length > 0 
          ? updatedDiscoverGroups[updatedDiscoverGroups.length - 1].groupId 
          : undefined
      );
      setHasMoreDiscover(updatedDiscoverGroups.length === 10);
      
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsRefreshing(false);
    }
  }

  const loadMoreMyGroups = useCallback(async () => {
    if (isLoadingMyGroups || !hasMoreMyGroups) return;
    
    setIsLoadingMyGroups(true);
    try {
      const moreGroups = await GroupService.getMyGroups(10, myGroupsOffset);
      
      if (moreGroups.length === 0) {
        setHasMoreMyGroups(false);
      } else {
        setMyGroups(prev => [...prev, ...moreGroups]);
        setMyGroupsOffset(prev => prev + moreGroups.length);
        setHasMoreMyGroups(moreGroups.length === 10);
      }
    } catch (error) {
      console.error("Failed to load more groups:", error);
    } finally {
      setIsLoadingMyGroups(false);
    }
  }, [isLoadingMyGroups, hasMoreMyGroups, myGroupsOffset]);

  const loadMoreDiscoverGroups = useCallback(async () => {
    if (isLoadingDiscover || !hasMoreDiscover || !lastDiscoverGroupId) return;
    
    setIsLoadingDiscover(true);
    try {
      const moreGroups = await GroupService.getOthersGroups(10, lastDiscoverGroupId);
      
      if (moreGroups.length === 0) {
        setHasMoreDiscover(false);
      } else {
        setDiscoverGroups(prev => [...prev, ...moreGroups]);
        setLastDiscoverGroupId(moreGroups[moreGroups.length - 1].groupId);
        setHasMoreDiscover(moreGroups.length === 10);
      }
    } catch (error) {
      console.error("Failed to load more groups:", error);
    } finally {
      setIsLoadingDiscover(false);
    }
  }, [isLoadingDiscover, hasMoreDiscover, lastDiscoverGroupId]);

  // Handle joining a group
  async function handleJoinGroup(groupId: number) {
    try {
      await GroupService.joinGroup(groupId);
      
      // Remove from discover and add to my groups
      const joinedGroup = discoverGroups.find(g => g.groupId === groupId);
      if (joinedGroup) {
        setDiscoverGroups(prev => prev.filter(g => g.groupId !== groupId));
        setMyGroups(prev => [joinedGroup, ...prev]);
      }
    } catch (error) {
      console.error("Failed to join group:", error);
    }
  }

  // Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (activeTab === 'my-groups') {
            loadMoreMyGroups();
          } else {
            loadMoreDiscoverGroups();
          }
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [activeTab, loadMoreMyGroups, loadMoreDiscoverGroups]);

  const currentGroups = activeTab === 'my-groups' ? myGroups : discoverGroups;
  const isLoading = activeTab === 'my-groups' ? isLoadingMyGroups : isLoadingDiscover;
  const hasMore = activeTab === 'my-groups' ? hasMoreMyGroups : hasMoreDiscover;

  return (
    <div className={styles.groups_container}>
      <div className={styles.group_page_header}>
        <h1 className={styles.group_title}>Groups</h1>
        <button className={styles.btn_creat_group} onClick={() => setIsOpen(true)}>
          Create Group
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs_container}>
        <button
          className={`${styles.tab} ${activeTab === 'my-groups' ? styles.tab_active : ''}`}
          onClick={() => setActiveTab('my-groups')}
        >
          My Groups ({myGroups.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'discover' ? styles.tab_active : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          Discover
        </button>
      </div>

      <CreateGroupModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />

      {isRefreshing && <div className={styles.loading}>Refreshing groups...</div>}

      <GroupCardClient 
        groups={currentGroups} 
        isMyGroups={activeTab === 'my-groups'}
        onJoinGroup={handleJoinGroup}
      />

      {/* Infinite scroll sentinel */}
      {hasMore && !isRefreshing && (
        <div ref={observerTarget} className={styles.observer_sentinel}>
          {isLoading && <div className={styles.loading}>Loading more groups...</div>}
        </div>
      )}

      {/* No more groups message */}
      {!hasMore && currentGroups.length > 0 && !isRefreshing && (
        <div className={styles.no_more_groups}>
          No more groups to show
        </div>
      )}

      {/* Empty state */}
      {!hasMore && currentGroups.length === 0 && !isRefreshing && (
        <div className={styles.empty_state}>
          {activeTab === 'my-groups' 
            ? 'You haven\'t joined any groups yet. Create one or discover groups to join!' 
            : 'No groups to discover at the moment.'}
        </div>
      )}
    </div>
  );
}