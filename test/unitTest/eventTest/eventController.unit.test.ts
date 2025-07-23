import {
  getEventList,
  editEvent,
  removeEvent,
} from "@/controllers/eventController";
import eventService from "@/services/eventService";
import { USER_ROLE } from "@prisma/client";
import { ResponseEventDTO, ResponseEventListDTO } from "@/dto/eventDTO";
import removeSuccessMessage from "@/lib/responseJson/removeSuccess";

jest.mock("@/services/eventService");
jest.mock("@/dto/eventDTO");
jest.mock("@/lib/responseJson/removeSuccess");

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const mockUser = (
  role: USER_ROLE,
  userId = "user-uuid",
  apartmentId = "apt-uuid"
) => ({
  user: {
    role,
    userId,
    apartmentId,
  },
});

describe("Event Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getEventList", () => {
    it("should throw ForbiddenError if apartmentId mismatch", async () => {
      const req: any = {
        query: {
          apartmentId: "wrong-apt-id",
          year: "2025",
          month: "7",
        },
        ...mockUser(USER_ROLE.USER, "user-uuid", "apt-uuid"),
      };
      const res = mockResponse();

      await expect(getEventList(req, res)).rejects.toThrow();
    });

    it("should call eventService.getEventList and send ResponseEventListDTO", async () => {
      const dataFromCreate = {
        year: 2025,
        month: 7,
        apartmentId: "apt-uuid",
      };

      const req: any = {
        query: dataFromCreate,
        ...mockUser(USER_ROLE.USER),
      };
      const res = mockResponse();

      jest
        .spyOn(require("superstruct"), "create")
        .mockReturnValue(dataFromCreate);

      const mockResult = { polls: [], notices: [] };
      (eventService.getEventList as jest.Mock).mockResolvedValue(mockResult);
      (ResponseEventListDTO as jest.Mock).mockImplementation(() => ({}));

      await getEventList(req, res);

      expect(eventService.getEventList).toHaveBeenCalledWith(dataFromCreate);
      expect(ResponseEventListDTO).toHaveBeenCalledWith(mockResult);
      expect(res.send).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe("editEvent", () => {
    it("should call eventService.editEvent and send ResponseEventDTO", async () => {
      const dataFromCreate = {
        boardType: "POLL",
        boardId: "event-uuid",
        startDate: "2025-07-01",
        endDate: "2025-07-15",
      };

      const req: any = {
        query: dataFromCreate,
        ...mockUser(USER_ROLE.ADMIN),
      };
      const res = mockResponse();

      jest
        .spyOn(require("superstruct"), "create")
        .mockReturnValue(dataFromCreate);

      const mockEvent = { id: "event-uuid" };
      (eventService.editEvent as jest.Mock).mockResolvedValue(mockEvent);
      (ResponseEventDTO as jest.Mock).mockImplementation(() => ({}));

      await editEvent(req, res);

      expect(eventService.editEvent).toHaveBeenCalledWith(
        dataFromCreate,
        "user-uuid"
      );
      expect(ResponseEventDTO).toHaveBeenCalledWith(mockEvent);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe("removeEvent", () => {
    it("should call eventService.removeEvent and send removeSuccessMessage", async () => {
      const eventId = "event-uuid";
      const req: any = {
        params: { eventId },
        ...mockUser(USER_ROLE.ADMIN),
      };
      const res = mockResponse();

      jest.spyOn(require("superstruct"), "create").mockReturnValue({ eventId });
      (eventService.removeEvent as jest.Mock).mockResolvedValue({});
      (removeSuccessMessage as jest.Mock).mockImplementation(() => ({}));

      await removeEvent(req, res);

      expect(eventService.removeEvent).toHaveBeenCalledWith(
        eventId,
        "user-uuid"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(removeSuccessMessage).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});
