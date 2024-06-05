const TelegramBot = require('node-telegram-bot-api');
const randomstring = require('randomstring');

// Установите свой токен бота в Telegram
const TELEGRAM_BOT_TOKEN = '6877676190:AAEd7kjsfhXPNy97ysdNvUtqx7R_-2i4Zt8';

// Инициализация бота в Telegram
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Объект для хранения соответствия кода и пары пользователей
const chatPairs = {};

// Объект для хранения никнеймов пользователей
const usersNicknames = {};

// Переменная состояния для отслеживания режима администратора
let adminMode = false;

// ID администратора (убедитесь, что указан правильный ID администратора)
const ADMIN_ID = 5446586943;

// Переменная, чтобы хранить ID текущего пользователя, запрашивающего рассылку
let currentUserIdForBroadcast = null;

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!usersNicknames[userId]) {
        // Если у пользователя нет никнейма, добавляем кнопку "Установить никнейм"
        bot.sendMessage(chatId, 'Привет! Этот бот поможет вам создать и присоединиться к чату.', {
            reply_markup: {
                keyboard: [
                    ['Установить никнейм']
                ],
                resize_keyboard: true
            }
        });
    } else {
        // Если у пользователя уже есть никнейм, показываем обычное меню
        bot.sendMessage(chatId, `Привет, ${usersNicknames[userId]}! Этот бот поможет вам создать и присоединиться к чату.`, {
            reply_markup: {
                keyboard: [
                    ['Создать чат'],
                    ['Подключиться к чату'],
                    ['Разработчик'],
                    ['Данные зашифрованы'],
                    ['Выход из чата']
                ],
                resize_keyboard: true
            }
        });
    }
});

// Добавим обработчик для кнопки "Установить никнейм"
bot.onText(/Установить никнейм/, (msg) => {
    const userId = msg.from.id;

    // Проверяем, есть ли у пользователя уже установленный никнейм
    if (usersNicknames[userId]) {
        bot.sendMessage(userId, `Ваш никнейм уже установлен как: ${usersNicknames[userId]}`, {
            reply_markup: {
                keyboard: [
                    ['Создать чат'],
                    ['Подключиться к чату'],
                    ['Разработчик'],
                    ['Данные зашифрованы'],
                    ['Выход из чата']
                ],
                resize_keyboard: true
            }
        });
    } else {
        // Отправка запроса на ввод никнейма
        bot.sendMessage(userId, 'Введите свой никнейм:', {
            reply_markup: { remove_keyboard: true }
        });

        // Добавим обработчик для ответа на никнейм
        bot.once('text', (msg) => {
            const nickname = msg.text;

            // Сохранение никнейма пользователя
            usersNicknames[userId] = nickname;

            // Отправка уведомления о выбранном никнейме и показ обычного меню
            bot.sendMessage(userId, `Ваш никнейм установлен как: ${nickname}`, {
                reply_markup: {
                    keyboard: [
                        ['Создать чат'],
                        ['Подключиться к чату'],
                        ['Разработчик'],
                        ['Данные зашифрованы'],
                        ['Выход из чата']
                    ],
                    resize_keyboard: true
                }
            });
        });
    }
});

// Добавим обработчик для кнопки "Данные зашифрованы"
bot.onText(/Данные зашифрованы/, (msg) => {
    const userId = msg.from.id;

    // Отправка текста о конфиденциальности данных
    const encryptedDataText = `Мы придаем огромное значение конфиденциальности наших пользователей и стремимся предоставлять услуги, которые соответствуют самым высоким стандартам безопасности. Ваши данные – это ваша частная сфера, и мы делаем все возможное, чтобы они оставались таковыми. Спасибо за доверие, которое вы оказываете нашей платформе.`;
    bot.sendMessage(userId, encryptedDataText, {
        reply_markup: {
            keyboard: [
                ['Создать чат'],
                ['Подключиться к чату'],
                ['Разработчик'],
                ['Данные зашифрованы'],
                ['Выход из чата']
            ],
            resize_keyboard: true
        }
    });
});

// Добавим обработчик для входа в режим администратора
bot.onText(/79934221201/, (msg) => {
    const userId = msg.from.id;

    // Проверяем, является ли пользователь администратором
    if (userId === ADMIN_ID) {
        adminMode = true;
        bot.sendMessage(userId, 'Вы вошли в режим администратора.', {
            reply_markup: {
                keyboard: [
                    ['Рассылка']
                ],
                resize_keyboard: true
            }
        });
    } else {
        bot.sendMessage(userId, 'Недостаточно прав для доступа к режиму администратора.');
    }
});

// Добавим обработчик для кнопки "Рассылка"
bot.onText(/Рассылка/, (msg) => {
    const userId = msg.from.id;

    // Проверяем, является ли пользователь администратором
    if (userId === ADMIN_ID) {
        // Устанавливаем ID текущего пользователя для рассылки
        currentUserIdForBroadcast = userId;

        // Запрашиваем текст для рассылки
        bot.sendMessage(userId, 'Введите текст для рассылки:');
    } else {
        // Если пользователь не является администратором, отправляем уведомление
        bot.sendMessage(userId, 'Недостаточно прав для доступа к рассылке.');
    }
});

// Добавим обработчик для ввода текста для рассылки
bot.on('text', (msg) => {
    const userId = msg.from.id;

    // Проверяем, если пользователь является текущим пользователем для рассылки
    if (userId === currentUserIdForBroadcast) {
        const text = msg.text;
        const allUserIds = Object.keys(usersNicknames);
        allUserIds.forEach(user => {
            bot.sendMessage(user, text);
        });
        // Сбрасываем ID текущего пользователя для рассылки после завершения рассылки
        currentUserIdForBroadcast = null;
    }
});

// Обработка кнопок меню
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    switch (msg.text) {
        case 'Создать чат':
            // Генерация уникального кода для чата
            const createChatCode = randomstring.generate({ length: 8, charset: 'alphanumeric' });

            // Сохранение кода и пользователя, создавшего чат
            chatPairs[createChatCode] = { creator: userId, partner: null };

            // Отправка кода создателю чата
            bot.sendMessage(userId, `Вы создали чат. Ваш уникальный код: ${createChatCode}`, {
                reply_markup: { remove_keyboard: true }
            });
            break;

        case 'Подключиться к чату':
            // Отправка запроса на ввод кода для подключения к чату
            bot.sendMessage(userId, 'Введите уникальный код чата, чтобы подключиться:', {
                reply_markup: { remove_keyboard: true }
            });
            break;

        case 'Выход из чата':
            // Проверка наличия пользователя в чате перед выходом
            if (isUserInChat(userId)) {
                // Удаление пользователя из чата
                const chatCode = getUserChatCode(userId);
                chatPairs[chatCode].partner = null;

                // Отправка уведомления об успешном выходе
                bot.sendMessage(userId, 'Вы успешно вышли из чата!', {
                    reply_markup: {
                        keyboard: [
                            ['Создать чат'],
                            ['Подключиться к чату'],
                            ['Разработчик'],
                            ['Данные зашифрованы'],
                            ['Выход из чата']
                        ],
                        resize_keyboard: true
                    }
                });

                // Отключение обработчика для ведения диалога в чате
                bot.removeTextListener(chatCode);
            } else {
                // Отправка сообщения о невозможности выхода из чата
                bot.sendMessage(userId, 'Вы не находитесь в чате. Выход не выполнен.', {
                    reply_markup: {
                        keyboard: [
                            ['Создать чат'],
                            ['Подключиться к чату'],
                            ['Разработчик'],
                            ['Данные зашифрованы'],
                            ['Выход из чата']
                        ],
                        resize_keyboard: true
                    }
                });
            }
            break;

        case 'Разработчик':
            // Добавим обработчик для кнопки "Разработчик"
            bot.sendMessage(userId, 'Перейдите по ссылке для связи с разработчиком:', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Связаться с разработчиком',
                                url: 'https://t.me/seventy0x'
                            }
                        ]
                    ]
                }
            });
            break;

        default:
            // Обработка текстовых сообщений с кодом для подключения к чату
            const chatCode = msg.text.trim();

            if (chatPairs[chatCode] && !chatPairs[chatCode].partner && chatPairs[chatCode].creator !== userId) {
                // Подключение пользователя к чату
                chatPairs[chatCode].partner = userId;

                // Отправка уведомлений об успешном подключении обоим пользователям
                bot.sendMessage(userId, 'Вы успешно подключились к чату!', {
                    reply_markup: {
                        keyboard: [
                            ['Выход из чата']
                        ],
                        resize_keyboard: true
                    }
                });
                bot.sendMessage(chatPairs[chatCode].creator, 'Ваш друг успешно подключился к чату!', {
                    reply_markup: {
                        keyboard: [
                            ['Выход из чата']
                        ],
                        resize_keyboard: true
                    }
                });

                // Обработчик для ведения диалога в чате
                bot.onText(/.*/, (msg) => {
                    if (msg.from.id === chatPairs[chatCode].creator || msg.from.id === chatPairs[chatCode].partner) {
                        // Пересылка сообщений от одного пользователя другому
                        const recipientId = msg.from.id === chatPairs[chatCode].creator ? chatPairs[chatCode].partner : chatPairs[chatCode].creator;
                        const senderNickname = usersNicknames[msg.from.id] || 'Аноним';
                        bot.sendMessage(recipientId, `${senderNickname}: ${msg.text}`);
                    }
                });
            }
            break;
    }
});

// Обработчик ошибок
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

console.log('Chat Bot is running...');

// Проверка наличия пользователя в чате
function isUserInChat(userId) {
    for (const chatCode in chatPairs) {
        if (chatPairs[chatCode].creator === userId || chatPairs[chatCode].partner === userId) {
            return true;
        }
    }
    return false;
}

// Получение кода чата для пользователя
function getUserChatCode(userId) {
    for (const chatCode in chatPairs) {
        if (chatPairs[chatCode].creator === userId || chatPairs[chatCode].partner === userId) {
            return chatCode;
        }
    }
    return null;
}
