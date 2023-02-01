import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import axios, { AxiosError } from "axios";
import http from "http";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN || "";

const bot = new TelegramBot(token, { polling: true });
const banTimeMs = 10 * 60 * 1000;

interface IBotRequestParams {
  url: string;
  data: unknown;
}
const baseURL = `https://api.telegram.org/bot${token}/`;
const botRequest = (params: IBotRequestParams) => {
  const { url, data } = params;
  return axios.request({
    method: "POST",
    baseURL,
    url,
    data,
  });
};

const host = "localhost";
const port = process.env.PORT || 8080;
const server = http.createServer();
server.listen(+port, host, () => {
  bot.on("message", async (msg) => {
    try {
      const chatId = msg.chat.id;
      if (msg.from && msg.dice?.emoji === "🏀") {
        await botRequest({
          url: "deleteMessage",
          data: { chat_id: chatId, message_id: msg.message_id },
        });
        console.log("Message deleted... 🗑️");
        const untilDate = Date.now() + banTimeMs;
        await botRequest({
          url: "sendMessage",
          data: {
            chat_id: chatId,
            text: `${
              msg.from.first_name
            } забанен(-a) за баскетбол до ${new Date(
              untilDate
            ).toLocaleTimeString("ru-RU")}`,
          },
        });
        console.log("Replied... 💬");
        await botRequest({
          url: "banChatMember",
          data: {
            chat_id: chatId,
            user_id: msg.from.id,
            until_date: untilDate,
            revoke_messages: false,
          },
        });
        console.log("User banned... 🚫");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          console.error(error.response.data);
        } else {
          console.error("Server did not respond...");
        }
      } else if (error instanceof Error) {
        console.error(error.message);
      }
    }
  });

  console.log("Bot started... 🚀");
});
