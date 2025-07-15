import { prisma } from "@/lib/prisma";
import { $Enums } from "@prisma/client";

// 일정 관련
export const createEvent = async (data: {
  eventType: $Enums.EVENT_TYPE;
  isActive: boolean;
}) => {
  return await prisma.events.create({ data });
};

export const editEvent = async (
  eventId: string,
  data: { isActive?: boolean }
) => {
  return await prisma.events.update({
    where: { id: eventId },
    data,
  });
};

export const deleteEventById = async (eventId: string) => {
  return await prisma.events.delete({ where: { id: eventId } });
};
