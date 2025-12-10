import type { ReactNode } from "react";
import { GroupService } from "./group_card.services"
import { Group } from "./types"

interface GroupCardServerProps {
  children?: ReactNode;
}

export default async function GroupCardServer({ groups }: { groups: Group[] }) {
  return (
    <div className="group_card">
      {groups.map((group) => (
        <div key={group.groupId} className="single_group_card">
          <h3>{group.title}</h3>
          <p>{group.description}</p>
          <p>Members: {group.memberCount}</p>
          <small>Created at: {group.createdAt}</small>

          {/* Show events if they exist */}
          {group.events && group.events.length > 0 && (
            <div className="group_events">
              <h4>Events</h4>
              {group.events.map((event) => (
                <div key={event.event_id} className="single_event">
                  <p><strong>{event.title}</strong></p>
                  <p>{event.description}</p>
                  <small>Starts: {event.startAt}</small>
                </div>
              ))}
            </div>
          )}
          
        </div>
      ))}
    </div>
  );
}
