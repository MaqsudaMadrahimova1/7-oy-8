import { Update, Start, On, Hears, Action } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { AppService } from './app.service';


const ADMIN_TELEGRAM_ID = 5733540092; 

@Update()
export class AppUpdate {
  constructor(private readonly appService: AppService) {}


  @Start()
  async onStart(ctx: Context) {
    const from = ctx.update['message']?.from || ctx.from;
    const firstName = from?.first_name || 'Mehmon';

    const buttons = this.appService.getButtons();

    await ctx.reply(
      `Assalomu alaykum, ${firstName}! 🍔 Fastfood botimizga xush kelibsiz.\n\nIltimos, telefon raqamingizni yuboring:`,
      { reply_markup: buttons.getPhone },
    );
  }
  

  @On('contact')
  async onContact(ctx: any) {
    const contact = ctx.message.contact;

     const user = await this.appService.saveUser({
      telegramId: ctx.from.id,
      firstName: ctx.from.first_name,
      phoneNumber: contact.phone_number,
    });
    const adminMsg = `🆕 *Yangi foydalanuvchi!*\n\n` +
                   `👤 Ism: ${ctx.from.first_name}\n` +
                   `📞 Tel: ${contact.phone_number}\n` +
                   `🆔 ID: ${ctx.from.id}`;
  
  await ctx.telegram.sendMessage(ADMIN_TELEGRAM_ID, adminMsg, { parse_mode: 'Markdown' });

    await ctx.reply('✅ Rahmat! Endi lokatsiyangizni yuboring:', {
      reply_markup: this.appService.getButtons().getLocation,
    });
  }


  @On('location')
  async onLocation(ctx: any) {
    const location = ctx.message.location;

    await this.appService.saveUser({
      telegramId: ctx.from.id,
      location: location,
    });

    const buttons = this.appService.getButtons();
    await ctx.reply(
      "📍 Lokatsiya qabul qilindi!\n\nQuyidagi menyu bo'limlaridan birini tanlang:",
      { reply_markup: buttons.mainMenu },
    );
  }

  @Hears(['🥤 Ichimliklar', '🍔 Yeguliklar', '🍰 Shirinliklar'])
  async handleMenu(ctx: any) {
    const category = ctx.message.text;
    const products = this.appService.getProducts(category);

    if (products.length === 0) {
      return ctx.reply("😔 Hozircha bu bo'limda mahsulotlar mavjud emas.");
    }

    await ctx.reply(`${category} bo'limi:`);

    for (const item of products) {
      try {
       
        await ctx.replyWithPhoto(item.photo_url, {
          caption:
            `🏷 *Nomi:* ${item.name}\n` +
            `💰 *Narxi:* ${item.price.toLocaleString()} so'm\n` +
            `🌿 *Tarkibi:* ${item.ingredients}`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🛒 Savatchaga qo\'shish', callback_data: `buy_${item.id}` }],
            ],
          },
        });
      } catch (err) {
        
        console.error(`Rasm yuklanmadi [${item.name}]:`, err.message);
        await ctx.reply(
          `🏷 *Nomi:* ${item.name}\n` +
          `💰 *Narxi:* ${item.price.toLocaleString()} so'm\n` +
          `🌿 *Tarkibi:* ${item.ingredients}\n` +
          `⚠️ Rasm yuklanmadi`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🛒 Savatchaga qo\'shish', callback_data: `buy_${item.id}` }],
              ],
            },
          },
        );
      }
    }
  }


  @Action(/buy_(.+)/)
  async onBuy(ctx: any) {
    const productId = ctx.match[1];
    // DIQQAT: getProducts emas, getProductById ishlatiladi
    const product = this.appService.getProductById(productId);

    await ctx.answerCbQuery(`✅ ${product?.name || 'Mahsulot'} savatchaga qo'shildi!`);

    const productName = product
      ? `${product.name} — ${product.price.toLocaleString()} so'm`
      : `ID: ${productId}`;

    await ctx.reply(
      `🛒 *Tanlangan mahsulot:*\n${productName}\n\nBuyurtmani tasdiqlaysizmi?`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ Tasdiqlash', callback_data: `confirm_${productId}` }],
            [{ text: '❌ Bekor qilish', callback_data: 'back_to_menu' }],
          ],
        },
      },
    );
  }

  @Action(/confirm_(.+)/)
  async onConfirm(ctx: any) {
    await ctx.answerCbQuery();

    const productId = ctx.match[1];
    // BU YERDA HAM: getProductById ishlatiladi
    const product = this.appService.getProductById(productId);
    const user = await this.appService.getUser(ctx.from.id);

    const orderDetails =
      `🆕 *YANGI BUYURTMA!*\n\n` +
      `👤 Ism: ${user?.firstName || ctx.from.first_name}\n` +
      `📞 Tel: ${user?.phoneNumber || 'Noma\'lum'}\n` +
      `🍔 Mahsulot: ${product?.name || productId}\n` +
      `💰 Narx: ${product?.price?.toLocaleString() || '?'} so'm\n` +
      `📍 Lokatsiya: ${
        user?.location
          ? `https://maps.google.com/?q=${user.location.latitude},${user.location.longitude}`
          : 'Noma\'lum'
      }`;

    try {
      await ctx.telegram.sendMessage(ADMIN_TELEGRAM_ID, orderDetails, {
        parse_mode: 'Markdown',
      });

      await ctx.reply(
        '🎉 Rahmat! Buyurtmangiz qabul qilindi.\n' +
        '🚚 Tez orada kuryer siz bilan bog\'lanadi!',
        { reply_markup: this.appService.getButtons().mainMenu },
      );
    } catch (err) {
      console.error('Admin ga xabar yuborishda xato:', err.message);
      await ctx.reply(
        '⚠️ Buyurtmangiz qabul qilindi, lekin texnik muammo yuz berdi.',
      );
    }
  }
}