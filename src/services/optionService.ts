import optionRepository from "../repositories/optionRepository";
import { VoteBodyType } from "../structs/optionStructs";
import NotFoundError from "@/errors/NotFoundError";
import ForbiddenError from "@/errors/ForbiddenError";

async function createVote(
  optionId: string,
  userId: string,
  apartmentId: string
) {
  const pollOption = await optionRepository.findPollByOptionId(optionId);
  if (!pollOption) {
    throw new NotFoundError("PollOption", optionId);
  }
  if (pollOption.poll.apartmentId !== apartmentId) {
    throw new ForbiddenError(
      "You do not have permission to create an option for this poll."
    );
  }
  for (const option of pollOption.poll.pollOptions) {
    if (option.id === optionId) continue;

    if (option.votes.some((vote) => vote.userId === userId)) {
      throw new ForbiddenError(
        "You have already voted for another option in this poll."
      );
    }
  }
  await optionRepository.create({
    user: { connect: { id: userId } },
    option: { connect: { id: optionId } },
  });
  return await optionRepository.findPollByOptionId(optionId);
}

async function removeVote(optionId: string, userId: string) {
  await optionRepository.deleteById(optionId, userId);
  return await optionRepository.findPollByOptionId(optionId);
}

export default {
  createVote,
  removeVote,
};
