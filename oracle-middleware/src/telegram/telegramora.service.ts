import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Telegraf, Markup } from 'telegraf';
import https = require('node:https');
import * as crypto from 'crypto';


@Injectable()
export class TelegramServiceOra implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf;
  private users: { id: number; username: string }[] = [];

  private readonly logger = new Logger(TelegramServiceOra.name);
  private iv = crypto.randomBytes(16);
  
  onModuleInit() {
    const agent = new https.Agent({ family: 4 });
    this.bot = new Telegraf(process.env.TELEGRAM_ORABOT_TOKEN!, { telegram: { agent } });

    this.bot.start((ctx) => {
      const userId = ctx.from.id;
      const username = ctx.from.username || ctx.from.first_name;

      if (!this.users.find(u => u.id === userId)) {
        this.users.push({ id: userId, username });
      }

        try {


          // 32byte secretkey
          const secretKey = process.env.TELEGRAM_ORABOT_TOKEN!.split(":")[1].slice(0,32).padEnd(32,'0').substring(0,32);
          
          console.log("secretKey:", secretKey);
          const plain = userId.toString();
          const enc = this.encrypt(plain,secretKey, this.iv);
          const dec = this.decrypt(enc, secretKey);

          ctx.reply("Welcome to Oracle", Markup.inlineKeyboard([
            [Markup.button.url("Connect Now", `https://oracle.beatswap.io/?id=${enc}`)],
          ]));


          } catch (error) {
            this.logger.error("start_command error:", error);
          }
    });

    this.bot.launch({ dropPendingUpdates: true });
  }

  onModuleDestroy() {
    this.bot.stop();
  }

  getUsers(name: string) {
    return this.users;
  }


  encrypt(text,secretKey,iv) {
      const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
      let encrypted = cipher.update(text, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      return encrypted;
  };

  decrypt(encryptedText, secretKey) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, this.iv);
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  };

}

