export default defineNuxtPlugin(() => {
  if (process.client) {
    // Подключаем Telegram Web App SDK
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    document.head.appendChild(script);
  }
});
