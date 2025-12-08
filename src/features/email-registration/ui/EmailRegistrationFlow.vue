<template>
  <div class="email-registration-flow">
    <EmailRegistrationForm
      v-if="step === 'registration'"
      :loading="registrationLoading"
      :show-back-button="showBackButton"
      :on-back="onBack"
      @submit="handleRegistrationSubmit"
    />

    <EmailVerificationForm
      v-else
      :email="registrationData.email"
      :loading="verificationLoading"
      :can-resend="canResend"
      :resend-countdown="resendCountdown"
      @submit="handleVerificationSubmit"
      @resend="handleResend"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import EmailRegistrationForm from "./EmailRegistrationForm.vue";
import EmailVerificationForm from "./EmailVerificationForm.vue";
import { useEmailRegistration } from "../model/useEmailRegistration";
import { useEmailVerification } from "../model/useEmailVerification";
import type {
  EmailRegistrationFlowProps,
  EmailRegistrationFormData,
  RegistrationStep,
} from "../model/types";

const props = withDefaults(defineProps<EmailRegistrationFlowProps>(), {
  showBackButton: false,
  onBack: undefined,
  onSuccess: undefined,
});

const step = ref<RegistrationStep>("registration");
const registrationData = ref<EmailRegistrationFormData>({
  email: "",
  firstName: "",
  lastName: "",
});

const {
  loading: registrationLoading,
  handleSubmit: handleRegistrationSubmitInternal,
} = useEmailRegistration();

let verificationComposable: ReturnType<typeof useEmailVerification> | null =
  null;

watch(
  () => registrationData.value.email,
  (email) => {
    if (email && step.value === "verification") {
      verificationComposable = useEmailVerification(email);
    }
  },
  { immediate: true },
);

const verificationLoading = computed(() => {
  return verificationComposable?.loading.value ?? false;
});

const canResend = computed(() => {
  return verificationComposable?.canResend.value ?? false;
});

const resendCountdown = computed(() => {
  return verificationComposable?.resendCountdown.value ?? 0;
});

const handleRegistrationSubmit = async (data: EmailRegistrationFormData) => {
  await handleRegistrationSubmitInternal(() => {
    registrationData.value = data;
    step.value = "verification";
    verificationComposable = useEmailVerification(data.email);
  });
};

const handleVerificationSubmit = async () => {
  if (!verificationComposable) return;

  await verificationComposable.handleSubmit(
    registrationData.value.firstName,
    registrationData.value.lastName,
    props.onSuccess,
  );
};

const handleResend = async () => {
  if (!verificationComposable) return;
  await verificationComposable.handleResend();
};
</script>

<style scoped>
.email-registration-flow {
  width: 100%;
}
</style>
