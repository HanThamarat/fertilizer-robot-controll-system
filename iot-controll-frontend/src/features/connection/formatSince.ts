export const formatSince = (since: number) =>
  new Date(since).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
