<template>
  <div class="email-link-flow">
    <EmailLinkForm
      v-if="step === 'email'"
      :loading="linkLoading"
      :show-back-button="showBackButton"
      :on-back="onBack"
      @submit="handleLinkSubmit"
    />

    <EmailLinkCodeForm
      v-else
      :email="linkData.email"
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
import EmailLinkForm from "./EmailLinkForm.vue";
import EmailLinkCodeForm from "./EmailLinkCodeForm.vue";
import { useEmailLink } from "../model/useEmailLink";
import { useEmailLinkCode } from "../model/useEmailLinkCode";
import type {
  EmailLinkFlowProps,
  EmailLinkFormData,
  EmailLinkCodeFormData,
  EmailLinkStep,
} from "../model/types";

const props = withDefaults(defineProps<EmailLinkFlowProps>(), {
  showBackButton: false,
  onBack: undefined,
  onSuccess: undefined,
});

const step = ref<EmailLinkStep>("email");
const linkData = ref<EmailLinkFormData>({
  email: "",
});

const { loading: linkLoading, handleSubmit: handleLinkSubmitInternal } =
  useEmailLink();

let codeComposable: ReturnType<typeof useEmailLinkCode> | null = null;

watch(
  () => linkData.value.email,
  (email) => {
    if (email && step.value === "code") {
      codeComposable = useEmailLinkCode(email);
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

const handleLinkSubmit = async (data: EmailLinkFormData) => {
  await handleLinkSubmitInternal(() => {
    linkData.value = data;
    step.value = "code";
    codeComposable = useEmailLinkCode(data.email);
  });
};

const handleCodeSubmit = async (data: EmailLinkCodeFormData) => {
  if (!codeComposable) return;

  await codeComposable.handleSubmit(data.code, data.password, props.onSuccess);
};

const handleResend = async () => {
  if (!codeComposable) return;
  await codeComposable.handleResend();
};
</script>

<style scoped>
.email-link-flow {
  width: 100%;
}
</style>
