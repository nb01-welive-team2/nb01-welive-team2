// test/unitTest/eventRepository.unit.test.ts
import { prisma } from "@/lib/prisma";
import {
  createEvent,
  updateEvent,
  deleteEventById,
} from "@/repositories/eventRepository";
import { EVENT_TYPE } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    events: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("eventRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createEvent", () => {
    it("should call prisma.events.create with correct data and return result", async () => {
      const input = { eventType: EVENT_TYPE.NOTICE, isActive: true };
      const expectedResult = { id: "event-uuid", ...input };

      (prisma.events.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await createEvent(input);

      expect(prisma.events.create).toHaveBeenCalledWith({ data: input });
      expect(result).toBe(expectedResult);
    });
  });

  describe("updateEvent", () => {
    it("should call prisma.events.update with correct params and return result", async () => {
      const eventId = "event-uuid";
      const data = { isActive: false };
      const expectedResult = {
        id: eventId,
        eventType: EVENT_TYPE.NOTICE,
        isActive: false,
      };

      (prisma.events.update as jest.Mock).mockResolvedValue(expectedResult);

      const result = await updateEvent(eventId, data);

      expect(prisma.events.update).toHaveBeenCalledWith({
        where: { id: eventId },
        data,
      });
      expect(result).toBe(expectedResult);
    });
  });

  describe("deleteEventById", () => {
    it("should call prisma.events.delete with correct id and return result", async () => {
      const eventId = "event-uuid";
      const expectedResult = { id: eventId };

      (prisma.events.delete as jest.Mock).mockResolvedValue(expectedResult);

      const result = await deleteEventById(eventId);

      expect(prisma.events.delete).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(result).toBe(expectedResult);
    });
  });
});
