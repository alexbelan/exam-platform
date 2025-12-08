<template>
  <div class="password-reset-flow">
    <PasswordResetForm
      v-if="step === 'email'"
      :loading="resetLoading"
      :show-back-button="showBackButton"
      :on-back="onBack"
      @submit="handleResetSubmit"
    />

    <PasswordResetCodeForm
      v-else
      :email="resetData.email"
      :loading="codeLoading"
      :can-resend="canResend"
      :resend-countdown="resendCountdown"
      @submit="handleCodeSubmit"
      @resend="handleResend"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import PasswordResetForm from "./PasswordResetForm.vue";
import PasswordResetCodeForm from "./PasswordResetCodeForm.vue";
import { usePasswordReset } from "../model/usePasswordReset";
import { usePasswordResetCode } from "../model/usePasswordResetCode";
import type {
  PasswordResetFlowProps,
  PasswordResetFormData,
  PasswordResetCodeFormData,
  PasswordResetStep,
} from "../model/types";

const props = withDefaults(defineProps<PasswordResetFlowProps>(), {
  showBackButton: false,
  onBack: undefined,
  onSuccess: undefined,
});

const step = ref<PasswordResetStep>("email");
const resetData = ref<PasswordResetFormData>({
  email: "",
});

const { loading: resetLoading, handleSubmit: handleResetSubmitInternal } =
  usePasswordReset();

let codeComposable: ReturnType<typeof usePasswordResetCode> | null = null;

watch(
  () => resetData.value.email,
  (email) => {
    if (email && step.value === "code") {
      codeComposable = usePasswordResetCode(email);
    }
  },
  { immediate: true },
);

const codeLoading = computed(() => {
  return codeComposable?.loading.value ?? false;
});

const canResend = computed(() => {
  return codeComposable?.canResend.value ?? false;
});

const resendCountdown = computed(() => {
  return codeComposable?.resendCountdown.value ?? 0;
});

const handleResetSubmit = async (data: PasswordResetFormData) => {
  await handleResetSubmitInternal(() => {
    resetData.value = data;
    step.value = "code";
    codeComposable = usePasswordResetCode(data.email);
  });
};

const handleCodeSubmit = async (data: PasswordResetCodeFormData) => {
  if (!codeComposable) return;

  await codeComposable.handleSubmit(
    data.code,
    data.newPassword,
    props.onSuccess,
  );
};
</script>

<style scoped>
.password-reset-flow {
  width: 100%;
}
</style>
