export { default as SubmissionsTable } from "./ui/SubmissionsTable.vue";
export type { Submission } from "./model/types";
export {
  truncateText,
  getStatusLabel,
  getStatusSeverity,
} from "./model/useSubmissionsTable";
