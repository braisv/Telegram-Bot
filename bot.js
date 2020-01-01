const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const parser = require('./parser.js');
 
require('dotenv').config();
 
const token = process.env.TELEGRAM_TOKEN;
let bot;
 
if (process.env.NODE_ENV === 'production') {
   bot = new TelegramBot(token);
   bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
   bot = new TelegramBot(token, { polling: true });
}
 
bot.onText(/\/word (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const word = match[1];
    axios
      .get(`https://wordsapiv1.p.mashape.com/words/${word}/definitions`)
      .then(response => {
        const parsedHtml = parser(response.data);
        bot.sendMessage(chatId, parsedHtml, { parse_mode: 'HTML' });
      })
      .catch(error => {
        const errorText = error.response.status === 404 ? `No definition found for the word: <b>${word}</b>` : `<b>An error occured, please try again later</b>`;
        bot.sendMessage(chatId, errorText, { parse_mode:'HTML'})
      });
  });