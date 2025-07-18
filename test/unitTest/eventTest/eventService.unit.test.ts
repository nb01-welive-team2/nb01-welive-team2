import eventService from "@/services/eventService";
import { buildSearchCondition } from "@/lib/searchCondition";
import {
  findPollsForEvent,
  updatePollForEvent,
} from "@/repositories/pollRepository";
import noticeRepository from "@/repositories/noticeRepository";
import { updateEvent } from "@/repositories/eventRepository";
import NotFoundError from "@/errors/NotFoundError";
import { EVENT_TYPE } from "@prisma/client";

jest.mock("@/lib/searchCondition");
jest.mock("@/repositories/pollRepository");
jest.mock("@/repositories/noticeRepository");
jest.mock("@/repositories/eventRepository");

describe("eventService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getEventList", () => {
    it("should return polls and notices filtered by date and apartment", async () => {
      const input = { year: 2025, month: 7, apartmentId: "apt-uuid" };

      const dummyWhereCondition = { dummy: "condition" };
      (buildSearchCondition as jest.Mock).mockResolvedValue({
        whereCondition: dummyWhereCondition,
      });

      const pollsMock = [{ id: "poll1" }, { id: "poll2" }];
      const noticesMock = [{ id: "notice1" }, { id: "notice2" }];

      (findPollsForEvent as jest.Mock).mockResolvedValue(pollsMock);
      (noticeRepository.getList as jest.Mock).mockResolvedValue(noticesMock);

      const result = await eventService.getEventList(input);

      expect(buildSearchCondition).toHaveBeenCalledWith(
        1,
        11,
        undefined,
        expect.objectContaining({
          apartmentId: input.apartmentId,
          AND: expect.any(Array),
        })
      );
      expect(findPollsForEvent).toHaveBeenCalledWith({
        where: dummyWhereCondition,
      });
      expect(noticeRepository.getList).toHaveBeenCalledWith({
        where: dummyWhereCondition,
      });
      expect(result).toEqual({ polls: pollsMock, notices: noticesMock });
    });
  });

  describe("editEvent", () => {
    it("should update a poll event and activate event", async () => {
      const body = {
        boardType: EVENT_TYPE.POLL,
        boardId: "poll-uuid",
        startDate: "2025-07-01T00:00:00.000Z",
        endDate: "2025-07-15T00:00:00.000Z",
      };

      const updatedPoll = { id: body.boardId, eventId: "event-uuid" };
      (updatePollForEvent as jest.Mock).mockResolvedValue(updatedPoll);
      (updateEvent as jest.Mock).mockResolvedValue({
        id: "event-uuid",
        isActive: true,
      });

      const result = await eventService.editEvent(body);

      expect(updatePollForEvent).toHaveBeenCalledWith(body.boardId, {
        startDate: body.startDate,
        endDate: body.endDate,
      });
      expect(updateEvent).toHaveBeenCalledWith(updatedPoll.eventId, {
        isActive: true,
      });
      expect(result).toBe(updatedPoll);
    });

    it("should throw NotFoundError if poll update returns no eventId", async () => {
      const body = {
        boardType: EVENT_TYPE.POLL,
        boardId: "poll-uuid",
        startDate: "2025-07-01T00:00:00.000Z",
        endDate: "2025-07-15T00:00:00.000Z",
      };

      (updatePollForEvent as jest.Mock).mockResolvedValue({
        id: body.boardId,
        eventId: null,
      });

      await expect(eventService.editEvent(body)).rejects.toThrow(NotFoundError);

      expect(updatePollForEvent).toHaveBeenCalled();
      expect(updateEvent).not.toHaveBeenCalled();
    });

    it("should update a notice event and activate event", async () => {
      const body = {
        boardType: EVENT_TYPE.NOTICE,
        boardId: "notice-uuid",
        startDate: "2025-07-01T00:00:00.000Z",
        endDate: "2025-07-15T00:00:00.000Z",
      };

      const updatedNotice = { id: body.boardId, eventId: "event-uuid" };
      (noticeRepository.update as jest.Mock).mockResolvedValue(updatedNotice);
      (updateEvent as jest.Mock).mockResolvedValue({
        id: "event-uuid",
        isActive: true,
      });

      const result = await eventService.editEvent(body);

      expect(noticeRepository.update).toHaveBeenCalledWith(body.boardId, {
        startDate: body.startDate,
        endDate: body.endDate,
      });
      expect(updateEvent).toHaveBeenCalledWith(updatedNotice.eventId, {
        isActive: true,
      });
      expect(result).toBe(updatedNotice);
    });

    it("should throw NotFoundError if notice update returns no eventId", async () => {
      const body = {
        boardType: EVENT_TYPE.NOTICE,
        boardId: "notice-uuid",
        startDate: "2025-07-01T00:00:00.000Z",
        endDate: "2025-07-15T00:00:00.000Z",
      };

      (noticeRepository.update as jest.Mock).mockResolvedValue({
        id: body.boardId,
        eventId: null,
      });

      await expect(eventService.editEvent(body)).rejects.toThrow(NotFoundError);

      expect(noticeRepository.update).toHaveBeenCalled();
      expect(updateEvent).not.toHaveBeenCalled();
    });
  });

  describe("removeEvent", () => {
    it("should set event isActive to false", async () => {
      const eventId = "event-uuid";
      const updatedEvent = { id: eventId, isActive: false };

      (updateEvent as jest.Mock).mockResolvedValue(updatedEvent);

      const result = await eventService.removeEvent(eventId);

      expect(updateEvent).toHaveBeenCalledWith(eventId, { isActive: false });
      expect(result).toBe(updatedEvent);
    });
  });
});
