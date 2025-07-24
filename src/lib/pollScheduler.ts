import { updatePollForEvent } from "@/repositories/pollRepository";
import noticeService from "@/services/noticeService";
import { NOTICE_CATEGORY, POLL_STATUS } from "@prisma/client";
import { M } from "@upstash/redis/zmscore-BshEAkn7";
import cron, { ScheduledTask } from "node-cron";

type JobMap = Map<string, ScheduledTask>;
const jobs: JobMap = new Map();

export async function schedulePollStatus(
  pollId: string,
  startDate: Date,
  endDate: Date
) {
  // 기존 작업 삭제
  cancelPollJobs(pollId);
  if (process.env.NODE_ENV === "production") {
    // 시작 시간에 RUNNING으로 변경
    const startJob = cron.schedule(getCronExpression(startDate), async () => {
      await updatePollForEvent(pollId, {
        status: POLL_STATUS.IN_PROGRESS,
      });
    });

    // 종료 시간에 ENDED로 변경
    const endJob = cron.schedule(getCronExpression(endDate), async () => {
      const poll = await updatePollForEvent(pollId, {
        status: POLL_STATUS.CLOSED,
      });
      await noticeService.createNotice(
        {
          category: NOTICE_CATEGORY.RESIDENT_VOTE,
          title: poll.title,
          content:
            poll.content +
            poll.pollOptions
              .map((option) => `\n- ${option.title} : ${option.votes.length}`)
              .join(""),
          isPinned: false,
        },
        poll.userId,
        poll.apartmentId,
        false
      );
    });

    // Map에 저장
    jobs.set(`${pollId}-start`, startJob);
    jobs.set(`${pollId}-end`, endJob);
  }
}

export function cancelPollJobs(pollId: string) {
  // start, end 작업 모두 중지
  const startKey = `${pollId}-start`;
  const endKey = `${pollId}-end`;

  [startKey, endKey].forEach((key) => {
    const job = jobs.get(key);
    if (job) {
      job.stop();
      jobs.delete(key);
    }
  });
}

// Date → Cron Expression 변환
function getCronExpression(date: Date): string {
  return `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
}
