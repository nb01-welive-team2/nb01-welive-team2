import type { ServerResponse } from "http";

export const sseConnections = new Map<string, ServerResponse>();

export const sendNotificationToUser = (userId: string, payload: any) => {
  const connection = sseConnections.get(userId);
  if (connection) {
    connection.write(`data: ${JSON.stringify(payload)}\n\n`);
  }
};
