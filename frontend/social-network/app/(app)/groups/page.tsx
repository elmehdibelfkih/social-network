<<<<<<< HEAD
"use client";

import { useState, useEffect } from "react";
import { GroupCards } from "@/components/ui/group-card/group-card";
import { Search, Plus } from "lucide-react";

interface Group {
  groupId: number;
  title: string;
  description: string;
  avatarId?: number;
  creatorId: number;
  memberCount: number;
  status: 'accepted' | 'pending' | 'declined' | null;
  chatId?: number;
  createdAt: string;
  upcomingEvent?: {
    title: string;
    date: string;
  };
}

// DEMO DATA - Remove this when backend is ready
const DEMO_GROUPS: Group[] = [
  {
    groupId: 1,
    title: "Photography Enthusiasts",
    description: "A community for photographers to share tips, tricks, and their best shots!",
    memberCount: 2,
    status: 'accepted',
    creatorId: 123,
    createdAt: "2025-10-24T23:15:00Z",
    upcomingEvent: {
      title: "Monthly Photo Walk",
      date: "2025-10-20T10:00:00Z"
    }
  },
  {
    groupId: 2,
    title: "Coffee Lovers Club",
    description: "For everyone who believes that coffee is not just a drink, it's a lifestyle!",
    memberCount: 2,
    status: 'accepted',
    creatorId: 456,
    createdAt: "2025-10-24T23:45:00Z"
  },
  {
    groupId: 3,
    title: "Hiking Adventures",
    description: "Join us to explore the best hiking trails and share your outdoor experiences.",
    memberCount: 1,
    status: null,
    creatorId: 789,
    createdAt: "2025-10-25T10:00:00Z",
    upcomingEvent: {
      title: "Weekend Mountain Hike",
      date: "2025-10-18T07:00:00Z"
    }
  },
  {
    groupId: 4,
    title: "Tech Innovators",
    description: "Discuss the latest in technology, programming, and innovation.",
    memberCount: 0,
    status: null,
    creatorId: 101,
    createdAt: "2025-10-25T12:00:00Z"
  },
  {
    groupId: 5,
    title: "Book Club Elite",
    description: "A cozy space for book lovers to discuss their favorite reads and discover new ones.",
    memberCount: 15,
    status: 'accepted',
    creatorId: 202,
    createdAt: "2025-10-26T14:00:00Z",
    upcomingEvent: {
      title: "Monthly Book Discussion",
      date: "2025-11-05T18:00:00Z"
    }
  },
  {
    groupId: 6,
    title: "Fitness Warriors",
    description: "Get fit together! Share workout routines, tips, and motivation.",
    memberCount: 8,
    status: null,
    creatorId: 303,
    createdAt: "2025-10-27T09:00:00Z"
  }
];

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'myGroups' | 'discover'>('myGroups');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGroups();
  }, [activeTab]);

  const fetchGroups = async () => {
    try {
      setLoading(true);

      await new Promise(resolve => setTimeout(resolve, 500));

      const filteredData = activeTab === 'myGroups' 
        ? DEMO_GROUPS.filter(g => g.status === 'accepted')
        : DEMO_GROUPS;

      setGroups(filteredData);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    console.log("Joining group:", groupId);
    alert(`Joined group ${groupId}! (Demo)`);

    setGroups(prev =>
      prev.map(g =>
        g.groupId === groupId
          ? { ...g, status: "accepted" as const, memberCount: g.memberCount + 1 }
          : g
      )
    );
  };

  const handleViewGroup = (groupId: number) => {
    alert(`Viewing group ${groupId} (Demo)`);
  };

  const handleInviteUsers = (groupId: number) => {
    alert(`Invite users to group ${groupId} (Demo)`);
  };

  const handleCreateGroup = () => {
    alert("Create group feature (Demo)");
  };

  const myGroupsCount = groups.filter(g => g.status === "accepted").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
        <button
          onClick={handleCreateGroup}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Group
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("myGroups")}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === "myGroups"
              ? "text-purple-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          My Groups ({myGroupsCount})
          {activeTab === "myGroups" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab("discover")}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === "discover"
              ? "text-purple-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Discover
          {activeTab === "discover" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
          )}
        </button>
      </div>

      {/* Group Cards */}
      <GroupCards
        groups={groups}
        onJoinGroup={handleJoinGroup}
        onViewGroup={handleViewGroup}
        onInviteUsers={handleInviteUsers}
      />

      {/* Empty State */}
      {groups.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No groups found</p>
          {activeTab === "myGroups" && (
            <p className="text-gray-400 text-sm mt-2">
              Join some groups to see them here
            </p>
          )}
        </div>
      )}
    </div>
  );
}
=======
import { getUserId } from '@/libs/helpers';

export default async function GroupePage({ children }: { children: React.ReactNode }) {
  const userId = await getUserId()

  return (
    <>
      <h1 />
      {children}
    </>
  );
}
>>>>>>> main
