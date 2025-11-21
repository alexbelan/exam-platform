export default defineEventHandler(async (event) => {
  console.log("Test API called with method:", event.method);

  if (event.method !== "POST") {
    return { error: "Method not allowed", method: event.method };
  }

  try {
    const body = await readBody(event);
    console.log("Test API body:", body);

    return {
      success: true,
      message: "Test API works",
      receivedData: body,
    };
  } catch (error) {
    console.error("Error reading body:", error);
    return {
      error: "Failed to read body",
      details: error.message,
    };
  }
});
