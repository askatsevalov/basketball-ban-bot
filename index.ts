import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN || "";

const bot = new TelegramBot(token, { polling: true });
const banTimeMs = 10 * 60 * 1000;

interface IBotRequestParams {
  url: string;
  data: unknown;
}
const baseURL = `https://api.telegram.org/bot${token}/`;
const botRequest = ({ url, data }: IBotRequestParams) => {
  return axios.request({
    method: "POST",
    baseURL,
    url,
    data,
  });
};

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;
    console.log("msg > ", msg);
    if (msg.from && msg.dice?.emoji === "🏀") {
      console.log("!BAN!");
      await botRequest({
        url: "deleteMessage",
        data: { chat_id: chatId, message_id: msg.message_id },
      });
      console.log("Message deleted");
      const untilDate = Date.now() + banTimeMs;
      await botRequest({
        url: "sendMessage",
        data: {
          chat_id: chatId,
          text: `${msg.from.first_name} забанен(-a) за баскетбол до ${new Date(
            untilDate
          ).toLocaleTimeString("ru-RU")}`,
        },
      });
      console.log("Replied");
      await botRequest({
        url: "banChatMember",
        data: {
          chat_id: chatId,
          user_id: msg.from.id,
          until_date: untilDate,
          revoke_messages: false,
        },
      });
      console.log("User banned");
    }
  } catch (err) {
    console.error(err);
  }
});

console.log("Bot started...");
