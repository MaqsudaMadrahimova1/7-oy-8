import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  ingredients: string;
  photo_url: string;
}

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 1. Foydalanuvchini olish (findOneBy ishlatildi)
  async getUser(telegramId: number): Promise<User | null> {
    return await this.userRepository.findOneBy({ 
      telegramId: String(telegramId) as any 
    });
  }

  // 2. Mahsulotni ID orqali topish
  getProductById(productId: string): Product | undefined {
    const allProducts = [
      ...this.getProducts('🥤 Ichimliklar'),
      ...this.getProducts('🍔 Yeguliklar'),
      ...this.getProducts('🍰 Shirinliklar')
    ];
    return allProducts.find(p => p.id === productId);
  }

  // 3. Kategoriyalar bo'yicha mahsulotlar
  getProducts(category: string): Product[] {
    const products: Product[] = [
      {
        id: 'cola',
        name: 'Coca-Cola 1.5L',
        price: 15000,
        category: '🥤 Ichimliklar',
        ingredients: 'Gazlangan suv, shakar, karamel.',
        photo_url: 'https://picsum.photos/200/300?random=1'
      },
      {
        id: 'burger',
        name: 'Chizburger',
        price: 35000,
        category: '🍔 Yeguliklar',
        ingredients: 'Mol go\'shti, pishloq, bodring, maxsus sous.',
        photo_url: 'https://picsum.photos/200/300?random=2'
      },
      {
        id: 'cake',
        name: 'Medovik',
        price: 25000,
        category: '🍰 Shirinliklar',
        ingredients: 'Asal, qaymoqli krem, un.',
        photo_url: 'https://picsum.photos/200/300?random=3'
      }
    ];
    return products.filter(p => p.category === category);
  }

  // 4. Tugmalar
  getButtons() {
    return {
      getPhone: {
        keyboard: [[{ text: "📞 Telefon raqamni yuborish", request_contact: true }]],
        resize_keyboard: true,
      },
      getLocation: {
        keyboard: [[{ text: "📍 Lokatsiyani yuborish", request_location: true }]],
        resize_keyboard: true,
      },
      mainMenu: {
        keyboard: [
          [{ text: "🥤 Ichimliklar" }, { text: "🍔 Yeguliklar" }],
          [{ text: "🍰 Shirinliklar" }]
        ],
        resize_keyboard: true,
      },
    };
  }

  // 5. Foydalanuvchini saqlash (findOneBy va update xatolari tuzatildi)
  async saveUser(data: Partial<User>) {
    const user = await this.userRepository.findOneBy({ 
      telegramId: String(data.telegramId) as any 
    });
    
    if (user) {
      return await this.userRepository.update(user.id, data);
    }
    return await this.userRepository.save(data);
  }
}