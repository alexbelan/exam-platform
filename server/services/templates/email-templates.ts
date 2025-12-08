/**
 * Получить название компании из конфигурации
 */
function getCompanyName(): string {
  const runtimeConfig = useRuntimeConfig();
  return String(runtimeConfig.companyName || "Компания");
}

/**
 * Шаблон письма с кодом верификации для регистрации
 */
export function getRegistrationVerificationTemplate(
  code: string,
  firstName?: string,
) {
  const greeting = firstName ? `Здравствуйте, ${firstName}!` : "Здравствуйте!";
  const companyName = getCompanyName();

  return {
    subject: "Код подтверждения регистрации",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .code {
              background-color: #f4f4f4;
              border: 2px dashed #333;
              padding: 20px;
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 30px 0;
              font-family: monospace;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>Добро пожаловать в ${companyName}!</h1>
          <p>${greeting}</p>
          <p>Для завершения регистрации используйте следующий код подтверждения:</p>
          <div class="code">${code}</div>
          <p>Этот код действителен в течение 10 минут.</p>
          <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
          <div class="footer">
            <p>С уважением,<br>Команда ${companyName}</p>
          </div>
        </body>
      </html>
    `,
    text: `
Добро пожаловать в ${companyName}!

${greeting}

Для завершения регистрации используйте следующий код подтверждения:

${code}

Этот код действителен в течение 10 минут.

Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.

С уважением,
Команда ${companyName}
    `.trim(),
  };
}

/**
 * Шаблон письма с кодом верификации для входа
 */
export function getLoginVerificationTemplate(code: string) {
  const companyName = getCompanyName();

  return {
    subject: "Код для входа в аккаунт",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .code {
              background-color: #f4f4f4;
              border: 2px dashed #333;
              padding: 20px;
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 30px 0;
              font-family: monospace;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>Код для входа</h1>
          <p>Здравствуйте!</p>
          <p>Для входа в ваш аккаунт используйте следующий код:</p>
          <div class="code">${code}</div>
          <p>Этот код действителен в течение 10 минут.</p>
          <div class="warning">
            <strong>⚠️ Внимание:</strong> Если вы не запрашивали код для входа, немедленно измените пароль вашего аккаунта.
          </div>
          <div class="footer">
            <p>С уважением,<br>Команда ${companyName}</p>
          </div>
        </body>
      </html>
    `,
    text: `
Код для входа

Здравствуйте!

Для входа в ваш аккаунт используйте следующий код:

${code}

Этот код действителен в течение 10 минут.

⚠️ Внимание: Если вы не запрашивали код для входа, немедленно измените пароль вашего аккаунта.

С уважением,
Команда ${companyName}
    `.trim(),
  };
}

/**
 * Шаблон письма с кодом для сброса пароля
 */
export function getPasswordResetTemplate(code: string) {
  const companyName = getCompanyName();

  return {
    subject: "Восстановление пароля",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .code {
              background-color: #f4f4f4;
              border: 2px dashed #333;
              padding: 20px;
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 30px 0;
              font-family: monospace;
            }
            .warning {
              background-color: #f8d7da;
              border-left: 4px solid #dc3545;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>Восстановление пароля</h1>
          <p>Здравствуйте!</p>
          <p>Вы запросили восстановление пароля для вашего аккаунта. Используйте следующий код для сброса пароля:</p>
          <div class="code">${code}</div>
          <p>Этот код действителен в течение 10 минут.</p>
          <div class="warning">
            <strong>⚠️ Внимание:</strong> Если вы не запрашивали восстановление пароля, проигнорируйте это письмо. Ваш пароль останется без изменений.
          </div>
          <div class="footer">
            <p>С уважением,<br>Команда ${companyName}</p>
          </div>
        </body>
      </html>
    `,
    text: `
Восстановление пароля

Здравствуйте!

Вы запросили восстановление пароля для вашего аккаунта. Используйте следующий код для сброса пароля:

${code}

Этот код действителен в течение 10 минут.

⚠️ Внимание: Если вы не запрашивали восстановление пароля, проигнорируйте это письмо. Ваш пароль останется без изменений.

С уважением,
Команда ${companyName}
    `.trim(),
  };
}

/**
 * Шаблон письма с кодом для изменения email
 */
export function getEmailChangeTemplate(code: string, newEmail: string) {
  const companyName = getCompanyName();

  return {
    subject: "Подтверждение изменения email",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .code {
              background-color: #f4f4f4;
              border: 2px dashed #333;
              padding: 20px;
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 30px 0;
              font-family: monospace;
            }
            .info {
              background-color: #d1ecf1;
              border-left: 4px solid #0c5460;
              padding: 15px;
              margin: 20px 0;
            }
            .warning {
              background-color: #f8d7da;
              border-left: 4px solid #dc3545;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>Подтверждение изменения email</h1>
          <p>Здравствуйте!</p>
          <p>Вы запросили изменение email адреса вашего аккаунта на:</p>
          <div class="info">
            <strong>Новый email:</strong> ${newEmail}
          </div>
          <p>Для подтверждения изменения используйте следующий код:</p>
          <div class="code">${code}</div>
          <p>Этот код действителен в течение 10 минут.</p>
          <div class="warning">
            <strong>⚠️ Внимание:</strong> Если вы не запрашивали изменение email, проигнорируйте это письмо. Ваш email останется без изменений.
          </div>
          <div class="footer">
            <p>С уважением,<br>Команда ${companyName}</p>
          </div>
        </body>
      </html>
    `,
    text: `
Подтверждение изменения email

Здравствуйте!

Вы запросили изменение email адреса вашего аккаунта на:

Новый email: ${newEmail}

Для подтверждения изменения используйте следующий код:

${code}

Этот код действителен в течение 10 минут.

⚠️ Внимание: Если вы не запрашивали изменение email, проигнорируйте это письмо. Ваш email останется без изменений.

С уважением,
Команда ${companyName}
    `.trim(),
  };
}
