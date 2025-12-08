import { trpc } from "#shared/lib/trpc";

export const useAsyncEmailRegistration = () => {
  const sendRegistrationCode = async (data: {
    email: string;
    firstName?: string;
    lastName?: string;
  }) => {
    return await trpc.auth.sendRegistrationCode.mutate({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    });
  };

  const verifyRegistrationCode = async (data: {
    email: string;
    code: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    return await trpc.auth.verifyRegistrationCode.mutate({
      email: data.email,
      code: data.code,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    });
  };

  const resendCode = async (email: string) => {
    return await trpc.auth.resendCode.mutate({
      email,
      type: "registration",
    });
  };

  return {
    sendRegistrationCode,
    verifyRegistrationCode,
    resendCode,
  };
};
