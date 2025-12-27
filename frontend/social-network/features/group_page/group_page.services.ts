// group_page.services.ts
// Minimal service stubs for group_page
import { http } from "@/libs/apiFetch"
import { GroupMember, GroupMembersResponse, RsvpResponse, EventRsvpResponse } from './types'

interface CreateEventPayload {
    title: string
    description: string
    startAt: string
    endAt: string
    location: string
}

export const GroupService = {
    async getGroupMembers(groupId: number, limit = 10, lastItemId?: number): Promise<GroupMember[]> {
        try {
            const params = new URLSearchParams();
            params.set("limit", String(limit));
            if (lastItemId !== undefined) {
                params.set("lastItemId", String(lastItemId));
            }
            const response = await http.get<GroupMembersResponse>(
                `/api/v1/groups/${groupId}/members?${params.toString()}`
            );
            if (!response?.members) return [];
            return response.members;
        } catch (error) {
            console.error(`Failed to fetch members for group ${groupId}:`, error);
            return [];
        }
    },

    async getEventRsvp(groupId: number, eventId: number): Promise<EventRsvpResponse | null> {
        try {
            const response = await http.get<EventRsvpResponse>(
                `/api/v1/groups/${groupId}/events/${eventId}/rsvp`
            );
            if (!response) return null;
            return response;
        } catch (error) {
            console.error(`Failed to fetch RSVP for event ${eventId} in group ${groupId}:`, error);
            return null;
        }
    },

    async rsvpToEvent(
        groupId: number,
        eventId: number,
        option: 'going' | 'not_going'
    ): Promise<RsvpResponse | null> {
        try {
            const response = await http.post<RsvpResponse>(
                `/api/v1/groups/${groupId}/events/${eventId}/rsvp`,
                {
                    option
                },
                {
                    throwOnError: false,
                    redirectOnError: false
                }
            );
            return response;
        } catch (error) {
            console.error('Failed to RSVP to event:', error);
            return null;
        }
    },

    async createGroupEvent(groupId: number, payload: CreateEventPayload): Promise<any> {
        try {
            const response = await http.post(
                `/api/v1/groups/${groupId}/events`,
                {
                    title: payload.title,
                    description: payload.description,
                    startAt: payload.startAt,
                    endAt: payload.endAt,
                    location: payload.location
                }
            );
            return response;
        } catch (error) {
            console.error(`Failed to create event for group ${groupId}:`, error);
            return null;
        }
    },

    async fetchGroupPage(): Promise<null> {
        // replace with real API call
        return null;
    }
}