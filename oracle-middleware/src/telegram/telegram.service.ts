import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Telegraf, Markup } from 'telegraf';
import https = require('node:https');
import * as path from "path";
import * as fs from "fs";
import { AppService } from '../app.service';
import { InlineKeyboard, Context, InputFile } from "grammy";
import * as crypto from 'crypto';


@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf;
  private users: { id: number; username: string }[] = [];

  private readonly logger = new Logger(TelegramService.name);
  private iv = crypto.randomBytes(16); // 16바이트 초기화 벡터 생성
  
  onModuleInit() {
    const agent = new https.Agent({ family: 4 });
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!, { telegram: { agent } });

    // /start 명령어 처리
    this.bot.start((ctx) => {
      const userId = ctx.from.id;
      const username = ctx.from.username || ctx.from.first_name;

      if (!this.users.find(u => u.id === userId)) {
        this.users.push({ id: userId, username });
      }

        try {
          // 1. 이미지 파일 경로 설정 및 존재 여부 확인
          // const imagePath = path.join(__dirname, "..", "assets", "miniapp_telegram.png");
          // if (!fs.existsSync(imagePath)) {
          //   this.logger.error(`이미지 파일을 찾을 수 없습니다: ${imagePath}`);
          // }

          // 32바이트짜리 시크릿 키 (256bit)
          const secretKey = process.env.TELEGRAM_BOT_TOKEN!.split(":")[1].slice(0,32).padEnd(32,'0').substring(0,32);
          // 16바이트 초기화 벡터 (CBC모드에 필요)
          
          console.log("secretKey:", secretKey);
          // // 사용 예제
          const plain = userId.toString();
          const enc = this.encrypt(plain,secretKey, this.iv);
          const dec = this.decrypt(enc, secretKey);

          console.log("원문:", plain);
          console.log("암호화:", enc);
          console.log("복호화:", dec);

          ctx.reply("Welcome to BeatSwap", Markup.inlineKeyboard([
            [Markup.button.url("Connect Now", `https://beatswap.io/?id=${enc}`)],
          ]));

          // 4. 최종적으로 환영 메시지와 함께 이미지 및 키보드 전송 (한 번만)
          // await ctx.replyWithPhoto({
          //       source: fs.createReadStream(imagePath),{
          //       caption: welcomeMessage,  
          //       parse_mode: "HTML",
          //       reply_markup: this.createMainKeyboard(),
          //     });
          } catch (error) {
            this.logger.error("start_command error:", error);
          }
    });

    // // // Long polling 모드로 실행 (Webhook 필요 없음)
    // this.bot.launch({ dropPendingUpdates: true });
  }

  onModuleDestroy() {
    this.bot.stop();
  }

  getUsers(name: string) {
    return this.users;
  }

//   createMainKeyboard = (): InlineKeyboard => {
//   return new InlineKeyboard()
//     .url("BeatSwap Login", "https://beatswap.io/callback?principal=asdasdasdasd")
//     // .row() // 새로운 줄에 버튼 추가
//     // .url("guide", "https://hanchain.gitbook.io/hanchain/musikhan-ecosystem/tune-to-earn-app/telegram-mini-app")
//     // .row() // 새로운 줄에 버튼 추가
//     // .url("rights & licenses", "https://hanchain.gitbook.io/hanchain/rights-and-licenses")
//     // .row() // 새로운 줄에 버튼 추가
//     // .url("terms of service", "https://hanchain.gitbook.io/hanchain/musikhan-ecosystem/tune-to-earn-app/musikhan-terms-of-service");
// };

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

