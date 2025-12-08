import { trpc } from "#shared/lib/trpc";

export const useAsyncEmailLink = () => {
  const sendEmailLinkCode = async (email: string) => {
    return await trpc.auth.sendEmailLinkCode.mutate({ email });
  };

  const linkEmailWithCode = async (
    email: string,
    code: string,
    password: string,
  ) => {
    return await trpc.auth.linkEmailWithCode.mutate({
      email,
      code,
      password,
    });
  };

  const resendCode = async (email: string) => {
    return await trpc.auth.resendCode.mutate({
      email,
      type: "email_link",
    });
  };

  return {
    sendEmailLinkCode,
    linkEmailWithCode,
    resendCode,
  };
};
