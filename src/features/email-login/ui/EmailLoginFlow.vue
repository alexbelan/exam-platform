<template>
  <div class="email-login-flow">
    <EmailLoginForm
      v-if="step === 'email'"
      :loading="loading"
      :show-back-button="showBackButton"
      :on-back="onBack"
      @submit="handleEmailSubmit"
    />

    <EmailLoginCodeForm
      v-else
      :email="email"
      :loading="loading"
      :can-resend="canResend"
      :resend-countdown="resendCountdown"
      @submit="handleCodeSubmit"
      @resend="handleResend"
    />
  </div>
</template>

<script setup lang="ts">
import EmailLoginForm from "./EmailLoginForm.vue";
import EmailLoginCodeForm from "./EmailLoginCodeForm.vue";
import { useEmailLogin } from "../model/useEmailLogin";
import type { EmailLoginFormProps } from "../model/types";

const props = withDefaults(defineProps<EmailLoginFormProps>(), {
  showBackButton: false,
  onBack: undefined,
  onSuccess: undefined,
});

const {
  step,
  email,
  loading,
  canResend,
  resendCountdown,
  handleSendCode,
  handleVerifyCode,
  handleResend: handleResendInternal,
} = useEmailLogin();

const handleEmailSubmit = async (emailValue: string) => {
  await handleSendCode(emailValue);
};

const handleCodeSubmit = async (code: string) => {
  await handleVerifyCode(code, props.onSuccess);
};

const handleResend = async () => {
  await handleResendInternal();
};
</script>

<style scoped>
.email-login-flow {
  width: 100%;
}
</style>
