import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Telegraf, Markup } from 'telegraf';
import https = require('node:https');
import * as crypto from 'crypto';


@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf;
  private users: { id: number; username: string }[] = [];

  logger = new Logger('TelegramService');
  private iv = crypto.randomBytes(16);
  private secretKey = process.env.TELEGRAM_BOT_TOKEN!.split(":")[1].slice(0,32).padEnd(32,'0').substring(0,32);
  
  onModuleInit() {
    const agent = new https.Agent({ family: 4 });
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!, { telegram: { agent } });

    this.bot.start((ctx) => {
      const userId = ctx.from.id;
      const username = ctx.from.username || ctx.from.first_name;

      if (!this.users.find(u => u.id === userId)) {
        this.users.push({ id: userId, username });
      }

        try {

          // 32byte secretkey (256bit)
          
          const plain = userId.toString();
          const enc = this.encrypt(plain, this.secretKey, this.iv);

          ctx.reply("Welcome to BeatSwap", Markup.inlineKeyboard([
            [Markup.button.url("Connect Now", `https://beatswap.io/oracle?id=${enc}`)],
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

  encrypt(text, secretKey, iv) {
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

    const encrypted = Buffer.concat([
      iv,
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);

    return encrypted.toString('base64');
  }

  decrypt(base64Text) {
    const encrypted = Buffer.from(base64Text, 'base64');
    const iv = encrypted.slice(0, 16); 
    const data = encrypted.slice(16);

    const decipher = crypto.createDecipheriv('aes-256-cbc', this.secretKey, iv);
    let decrypted = decipher.update(data);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  }

}

