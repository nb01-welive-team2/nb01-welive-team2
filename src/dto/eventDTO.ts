import { EVENT_TYPE, Events, Notices, Polls } from "@prisma/client";

import { NOTICE_CATEGORY } from "@prisma/client";

export class ResponseEventDTO {
  id: string;
  start: Date;
  end: Date;
  title: string;
  category: NOTICE_CATEGORY;
  type: EVENT_TYPE;

  constructor(result: Polls | Notices) {
    this.id = result.id;
    this.start = result.startDate;
    this.end = result.endDate;
    this.title = result.title;
    if ("category" in result) {
      // Notice
      this.category = result.category;
      this.type = EVENT_TYPE.NOTICE;
    } else {
      // Polls
      this.category = NOTICE_CATEGORY.RESIDENT_VOTE;
      this.type = EVENT_TYPE.POLL;
    }
  }
}

export function ResponseEventListDTO(result: {
  notices: (Notices & { event: Events })[];
  polls: (Polls & { event: Events })[];
}) {
  let eventList = [];
  for (const notice of result.notices) {
    if (notice.event.isActive && notice.event.eventType === EVENT_TYPE.NOTICE) {
      eventList.push({
        id: notice.id,
        start: notice.startDate,
        end: notice.endDate,
        title: notice.title,
        category: notice.category,
        type: notice.event.eventType,
      });
    }
  }
  for (const poll of result.polls) {
    if (poll.event.isActive && poll.event.eventType === EVENT_TYPE.POLL) {
      eventList.push({
        id: poll.id,
        start: poll.startDate,
        end: poll.endDate,
        title: poll.title,
        category: NOTICE_CATEGORY.RESIDENT_VOTE, //스웨거에서 이렇게 쓰고있음
        type: poll.event.eventType,
      });
    }
  }
  return eventList;
}
