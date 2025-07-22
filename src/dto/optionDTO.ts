import CommonError from "@/errors/CommonError";
import { PollOptions, Polls } from "@prisma/client";

import { NOTICE_CATEGORY } from "@prisma/client";

export class ResponseOptionDTO {
  message: string;
  updatedOption: {
    id: string;
    title: string;
    votes: number;
  };

  constructor(
    option: PollOptions & {
      poll: Polls & {
        pollOptions: (PollOptions & { _count?: { votes: number } })[];
      };
    },
    message: string
  ) {
    this.message = message;
    const optionId = option.id;
    const updatedOption = option.poll.pollOptions.find(
      (pollOption) => pollOption.id === optionId
    );
    if (!updatedOption) {
      throw new CommonError("Option not found", 500);
    }
    this.updatedOption = {
      id: updatedOption.id,
      title: updatedOption.title,
      votes: updatedOption._count?.votes || 0,
    };
  }
}

export class ResponseWinnerOptionDTO {
  message: string;
  updatedOption: {
    id: string;
    title: string;
    votes: number;
  };
  winnerOption: {
    id: string;
    title: string;
    votes: number;
  };
  options: {
    id: string;
    title: string;
    votes: number;
  }[];

  constructor(
    option: PollOptions & {
      poll: Polls & {
        pollOptions: (PollOptions & { _count?: { votes: number } })[];
      };
    },
    message: string
  ) {
    this.message = message;
    const optionId = option.id;
    const updatedOption = option.poll.pollOptions.find(
      (pollOption) => pollOption.id === optionId
    );
    if (!updatedOption) {
      throw new CommonError("Option not found", 500);
    }
    this.updatedOption = {
      id: updatedOption.id,
      title: updatedOption.title,
      votes: updatedOption._count?.votes || 0,
    };
    const winnerOption = option.poll.pollOptions.reduce((prev, current) => {
      return (prev._count?.votes || 0) > (current._count?.votes || 0)
        ? prev
        : current;
    });
    this.winnerOption = {
      id: winnerOption.id,
      title: winnerOption.title,
      votes: winnerOption._count?.votes || 0,
    };
    this.options = option.poll.pollOptions.map((pollOption) => ({
      id: pollOption.id,
      title: pollOption.title,
      votes: pollOption._count?.votes || 0,
    }));
  }
}
