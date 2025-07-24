import eventService from "@/services/eventService";
import { buildSearchCondition } from "@/lib/searchCondition";
import {
  findPollById,
  findPollsForEvent,
  updatePollForEvent,
} from "@/repositories/pollRepository";
import noticeRepository from "@/repositories/noticeRepository";
import { updateEvent } from "@/repositories/eventRepository";
import NotFoundError from "@/errors/NotFoundError";
import ForbiddenError from "@/errors/ForbiddenError";
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
    it("should update a poll event when user owns the poll", async () => {
      const body = {
        boardType: EVENT_TYPE.POLL,
        boardId: "poll-uuid",
        startDate: "2025-07-01T00:00:00.000Z",
        endDate: "2025-07-15T00:00:00.000Z",
      };
      const userId = "user-uuid";

      const pollMock = { id: body.boardId, userId: userId };
      (findPollById as jest.Mock).mockResolvedValue(pollMock);

      const updatedPoll = { id: body.boardId, eventId: "event-uuid" };
      (updatePollForEvent as jest.Mock).mockResolvedValue(updatedPoll);
      (updateEvent as jest.Mock).mockResolvedValue({
        id: "event-uuid",
        isActive: true,
      });

      const result = await eventService.editEvent(body, userId);

      expect(findPollById).toHaveBeenCalledWith(body.boardId);
      expect(updatePollForEvent).toHaveBeenCalledWith(body.boardId, {
        startDate: body.startDate,
        endDate: body.endDate,
      });
      expect(updateEvent).toHaveBeenCalledWith(updatedPoll.eventId, {
        isActive: true,
      });
      expect(result).toBe(updatedPoll);
    });

    it("should throw ForbiddenError if user does not own the poll", async () => {
      const body = {
        boardType: EVENT_TYPE.POLL,
        boardId: "poll-uuid",
        startDate: "2025-07-01T00:00:00.000Z",
        endDate: "2025-07-15T00:00:00.000Z",
      };

      (findPollById as jest.Mock).mockResolvedValue({
        id: body.boardId,
        userId: "other-user-id",
      });

      await expect(eventService.editEvent(body, "user-uuid")).rejects.toThrow(
        ForbiddenError
      );

      expect(updatePollForEvent).not.toHaveBeenCalled();
      expect(updateEvent).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError if poll update returns no eventId", async () => {
      const body = {
        boardType: EVENT_TYPE.POLL,
        boardId: "poll-uuid",
        startDate: "2025-07-01T00:00:00.000Z",
        endDate: "2025-07-15T00:00:00.000Z",
      };

      (findPollById as jest.Mock).mockResolvedValue({
        id: body.boardId,
        userId: "user-uuid",
      });
      (updatePollForEvent as jest.Mock).mockResolvedValue({
        id: body.boardId,
        eventId: null,
      });

      await expect(eventService.editEvent(body, "user-uuid")).rejects.toThrow(
        NotFoundError
      );
    });

    it("should update a notice event when user owns the notice", async () => {
      const body = {
        boardType: EVENT_TYPE.NOTICE,
        boardId: "notice-uuid",
        startDate: "2025-07-01T00:00:00.000Z",
        endDate: "2025-07-15T00:00:00.000Z",
      };
      const userId = "user-uuid";

      (noticeRepository.findById as jest.Mock).mockResolvedValue({
        id: body.boardId,
        userId: userId,
      });

      const updatedNotice = { id: body.boardId, eventId: "event-uuid" };
      (noticeRepository.update as jest.Mock).mockResolvedValue(updatedNotice);
      (updateEvent as jest.Mock).mockResolvedValue({
        id: "event-uuid",
        isActive: true,
      });

      const result = await eventService.editEvent(body, userId);

      expect(noticeRepository.findById).toHaveBeenCalledWith(body.boardId);
      expect(noticeRepository.update).toHaveBeenCalledWith(body.boardId, {
        startDate: body.startDate,
        endDate: body.endDate,
      });
      expect(updateEvent).toHaveBeenCalledWith(updatedNotice.eventId, {
        isActive: true,
      });
      expect(result).toBe(updatedNotice);
    });

    it("should throw ForbiddenError if user does not own the notice", async () => {
      const body = {
        boardType: EVENT_TYPE.NOTICE,
        boardId: "notice-uuid",
        startDate: "2025-07-01T00:00:00.000Z",
        endDate: "2025-07-15T00:00:00.000Z",
      };

      (noticeRepository.findById as jest.Mock).mockResolvedValue({
        id: body.boardId,
        userId: "other-user-id",
      });

      await expect(eventService.editEvent(body, "user-uuid")).rejects.toThrow(
        ForbiddenError
      );

      expect(noticeRepository.update).not.toHaveBeenCalled();
      expect(updateEvent).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError if notice update returns no eventId", async () => {
      const body = {
        boardType: EVENT_TYPE.NOTICE,
        boardId: "notice-uuid",
        startDate: "2025-07-01T00:00:00.000Z",
        endDate: "2025-07-15T00:00:00.000Z",
      };

      (noticeRepository.findById as jest.Mock).mockResolvedValue({
        id: body.boardId,
        userId: "user-uuid",
      });
      (noticeRepository.update as jest.Mock).mockResolvedValue({
        id: body.boardId,
        eventId: null,
      });

      await expect(eventService.editEvent(body, "user-uuid")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("removeEvent", () => {
    it("should set event isActive to false", async () => {
      const eventId = "event-uuid";
      const updatedEvent = { id: eventId, isActive: false };

      (updateEvent as jest.Mock).mockResolvedValue(updatedEvent);

      const result = await eventService.removeEvent(eventId, "user-uuid");

      expect(updateEvent).toHaveBeenCalledWith(eventId, { isActive: false });
      expect(result).toBe(updatedEvent);
    });
  });
});
