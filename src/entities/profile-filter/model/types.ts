import type { ProfileContentFilter } from "@entities/profile-state";

export interface ProfileFilterProps {
  modelValue: ProfileContentFilter;
}

export interface ProfileFilterEmits {
  (e: "update:modelValue", value: ProfileContentFilter): void;
}

