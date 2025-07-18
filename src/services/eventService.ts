import { GetEventType, UpdateEventType } from "../structs/eventStructs";
import { EVENT_TYPE, Notices, Polls, USER_ROLE } from "@prisma/client";
import { buildSearchCondition } from "../lib/searchCondition";
import NotFoundError from "@/errors/NotFoundError";
import { updateEvent } from "@/repositories/eventRepository";
import {
  findPollsForEvent,
  updatePollForEvent,
} from "@/repositories/pollRepository";
import noticeRepository from "@/repositories/noticeRepository";

async function getEventList(data: GetEventType) {
  const monthStart = new Date(data.year, data.month - 1, 1);
  const monthEnd = new Date(data.year, data.month, 0);
  const additionalCondition = {
    AND: [
      {
        startDate: {
          lte: monthEnd,
        },
      },
      {
        endDate: {
          gte: monthStart,
        },
      },
    ],
  };

  //dummy page params
  const searchCondition = await buildSearchCondition(1, 11, undefined, {
    apartmentId: data.apartmentId,
    ...additionalCondition,
  });

  const polls = await findPollsForEvent({
    where: searchCondition.whereCondition,
  });
  const notices = await noticeRepository.getList({
    where: searchCondition.whereCondition,
  });

  return { polls, notices };
}

async function editEvent(body: UpdateEventType) {
  let result: Polls | Notices;
  if (body.boardType === EVENT_TYPE.POLL) {
    result = await updatePollForEvent(body.boardId, {
      startDate: body.startDate,
      endDate: body.endDate,
    });
    if (!result.eventId) {
      throw new NotFoundError("Poll or Event", body.boardId);
    }
    await updateEvent(result.eventId, { isActive: true });
  } else {
    result = await noticeRepository.update(body.boardId, {
      startDate: body.startDate,
      endDate: body.endDate,
    });
    if (!result.eventId) {
      throw new NotFoundError("Notice or Event", body.boardId);
    }
    await updateEvent(result.eventId, { isActive: true });
  }
  return result;
}

async function removeEvent(eventId: string) {
  return await updateEvent(eventId, { isActive: false });
}

export default {
  editEvent,
  getEventList,
  removeEvent,
};
