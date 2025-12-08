export const truncateText = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + "..." : text;
};

export const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: "Ожидает",
    APPROVED: "Одобрена",
    REJECTED: "Отклонена",
    NEEDS_REVISION: "Требует доработки",
  };
  return labels[status] || status;
};

export const getStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
    NEEDS_REVISION: "info",
  };
  return severities[status] || "info";
};
