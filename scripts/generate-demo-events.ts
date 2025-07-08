import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config();

// Demo event data inspired by real Vietnamese events
const DEMO_EVENTS = [
  {
    eventName: 'Liveshow Hà Anh Tuấn - Trời Sao Đêm Nay',
    eventDescription:
      'Liveshow âm nhạc đặc biệt với những ca khúc hit của Hà Anh Tuấn. Một đêm nhạc đầy cảm xúc với sự tham gia của dàn nhạc giao hưởng và các nghệ sĩ khách mời.',
    categories: ['music'],
    categoriesIds: ['fc981c1b-485d-497d-b539-b8e73c4376bb'],
    eventType: 'OFFLINE',
    status: 'PUBLISHED',
    orgName: 'Công ty Giải trí Hà Anh Tuấn',
    orgDescription: 'Công ty tổ chức sự kiện âm nhạc chuyên nghiệp',
    orgLogoUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    eventLogoUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    eventBannerUrl:
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&h=600&fit=crop',
    venueName: 'Cung Văn hóa Hữu nghị Việt Xô',
    cityId: 1, // Hanoi
    wardId: 1, // Sample ward
    street: '91 Trần Hưng Đạo',
    latitude: 21.0285,
    longitude: 105.8542,
    formattedAddress: '91 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội, Vietnam',
    placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    organizationId: 'demo-org-1',
    shows: [
      {
        startTime: new Date('2025-02-15T19:30:00Z'),
        endTime: new Date('2025-02-15T22:00:00Z'),
        ticketTypes: [
          {
            name: 'VIP',
            price: 2500000,
            isFree: false,
            quantity: 100,
            minTicketPurchase: 1,
            maxTicketPurchase: 4,
            description: 'Ghế VIP hàng đầu, tặng kèm poster có chữ ký',
            imageUrl:
              'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 25,
            startTime: new Date('2025-01-10T09:00:00Z'),
            endTime: new Date('2025-02-15T17:00:00Z'),
          },
          {
            name: 'Hạng A',
            price: 1800000,
            isFree: false,
            quantity: 200,
            minTicketPurchase: 1,
            maxTicketPurchase: 6,
            description: 'Ghế hạng A, vị trí đẹp',
            imageUrl:
              'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 45,
            startTime: new Date('2025-01-10T09:00:00Z'),
            endTime: new Date('2025-02-15T17:00:00Z'),
          },
          {
            name: 'Hạng B',
            price: 1200000,
            isFree: false,
            quantity: 300,
            minTicketPurchase: 1,
            maxTicketPurchase: 8,
            description: 'Ghế hạng B, giá cả phải chăng',
            imageUrl:
              'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 89,
            startTime: new Date('2025-01-10T09:00:00Z'),
            endTime: new Date('2025-02-15T17:00:00Z'),
          },
        ],
      },
    ],
    setting: {
      url: 'ha-anh-tuan-liveshow-2025',
      maximumAttendees: 600,
      ageRestriction: 'ALL_AGES',
      messageAttendees: 'Vui lòng đến sớm 30 phút để làm thủ tục check-in',
      isPrivate: false,
      eventDescription:
        'Liveshow âm nhạc đặc biệt với những ca khúc hit của Hà Anh Tuấn',
      isRefundable: true,
    },
    paymentInfo: {
      bankAccount: 'Vietcombank',
      bankAccountName: 'Công ty Giải trí Hà Anh Tuấn',
      bankAccountNumber: '0123456789',
      bankOffice: 'Chi nhánh Hoàn Kiếm',
      businessType: 'COMPANY',
      name: 'Công ty Giải trí Hà Anh Tuấn',
      address: '91 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
      taxNumber: '0123456789',
    },
  },
  {
    eventName: 'Hội chợ Công nghệ Việt Nam 2025',
    eventDescription:
      'Hội chợ công nghệ lớn nhất Việt Nam với sự tham gia của hàng trăm doanh nghiệp công nghệ hàng đầu. Trải nghiệm những sản phẩm công nghệ mới nhất, tham gia các workshop và hội thảo chuyên môn.',
    categories: ['technology'],
    categoriesIds: ['9671bdf8-484e-4922-8835-cc800cc7ba3f'],
    eventType: 'OFFLINE',
    status: 'PUBLISHED',
    orgName: 'Hiệp hội Công nghệ Việt Nam',
    orgDescription: 'Tổ chức hàng đầu về công nghệ tại Việt Nam',
    orgLogoUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
    eventLogoUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
    eventBannerUrl:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop',
    venueName: 'Trung tâm Hội chợ Triển lãm Sài Gòn',
    cityId: 79, // Ho Chi Minh City
    wardId: 25747, // Ward Thu Dau Mot
    street: '799 Nguyễn Văn Linh',
    latitude: 10.7769,
    longitude: 106.7009,
    formattedAddress:
      '799 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh',
    placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY5',
    organizationId: 'demo-org-2',
    shows: [
      {
        startTime: new Date('2025-03-20T08:00:00Z'),
        endTime: new Date('2025-03-20T18:00:00Z'),
        ticketTypes: [
          {
            name: 'Vé tham quan miễn phí',
            price: 0,
            isFree: true,
            quantity: 5000,
            minTicketPurchase: 1,
            maxTicketPurchase: 4,
            description: 'Vé tham quan miễn phí cho tất cả khách tham quan',
            imageUrl:
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 1234,
            startTime: new Date('2025-02-01T00:00:00Z'),
            endTime: new Date('2025-03-20T07:00:00Z'),
          },
          {
            name: 'Workshop Premium',
            price: 500000,
            isFree: false,
            quantity: 100,
            minTicketPurchase: 1,
            maxTicketPurchase: 2,
            description: 'Tham gia workshop chuyên sâu với các chuyên gia',
            imageUrl:
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 67,
            startTime: new Date('2025-02-01T00:00:00Z'),
            endTime: new Date('2025-03-20T07:00:00Z'),
          },
        ],
      },
      {
        startTime: new Date('2025-03-21T08:00:00Z'),
        endTime: new Date('2025-03-21T18:00:00Z'),
        ticketTypes: [
          {
            name: 'Vé tham quan miễn phí',
            price: 0,
            isFree: true,
            quantity: 5000,
            minTicketPurchase: 1,
            maxTicketPurchase: 4,
            description: 'Vé tham quan miễn phí cho tất cả khách tham quan',
            imageUrl:
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 1456,
            startTime: new Date('2025-02-01T00:00:00Z'),
            endTime: new Date('2025-03-21T07:00:00Z'),
          },
        ],
      },
    ],
    setting: {
      url: 'hoi-cho-cong-nghe-viet-nam-2025',
      maximumAttendees: 10000,
      ageRestriction: 'ALL_AGES',
      messageAttendees: 'Mang theo CMND/CCCD để đăng ký tham gia',
      isPrivate: false,
      eventDescription: 'Hội chợ công nghệ lớn nhất Việt Nam năm 2025',
      isRefundable: false,
    },
    paymentInfo: {
      bankAccount: 'Techcombank',
      bankAccountName: 'Hiệp hội Công nghệ Việt Nam',
      bankAccountNumber: '9876543210',
      bankOffice: 'Chi nhánh TP. Hồ Chí Minh',
      businessType: 'COMPANY',
      name: 'Hiệp hội Công nghệ Việt Nam',
      address: '799 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
      taxNumber: '9876543210',
    },
  },
  {
    eventName: 'Giải Marathon Hà Nội 2025',
    eventDescription:
      'Giải chạy marathon quốc tế tại Hà Nội với các cự ly 5km, 10km, 21km và 42km. Tham gia cùng hàng nghìn vận động viên từ khắp nơi trên thế giới.',
    categories: ['sport'],
    categoriesIds: ['4247769b-251e-4909-8c89-3af54d648374'],
    eventType: 'OFFLINE',
    status: 'PUBLISHED',
    orgName: 'Liên đoàn Điền kinh Việt Nam',
    orgDescription: 'Tổ chức thể thao chuyên nghiệp',
    orgLogoUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    eventLogoUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    eventBannerUrl:
      'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=1200&h=600&fit=crop',
    venueName: 'Quảng trường Đông Kinh Nghĩa Thục',
    cityId: 1, // Hanoi
    wardId: 1, // Sample ward
    street: 'Phố Đinh Tiên Hoàng',
    latitude: 21.0285,
    longitude: 105.8542,
    formattedAddress: 'Phố Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội, Vietnam',
    placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY6',
    organizationId: 'demo-org-3',
    shows: [
      {
        startTime: new Date('2025-04-06T05:00:00Z'),
        endTime: new Date('2025-04-06T12:00:00Z'),
        ticketTypes: [
          {
            name: 'Marathon 42km',
            price: 800000,
            isFree: false,
            quantity: 1000,
            minTicketPurchase: 1,
            maxTicketPurchase: 1,
            description: 'Cự ly marathon 42km dành cho VĐV chuyên nghiệp',
            imageUrl:
              'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 456,
            startTime: new Date('2025-01-15T00:00:00Z'),
            endTime: new Date('2025-04-05T23:59:00Z'),
          },
          {
            name: 'Half Marathon 21km',
            price: 600000,
            isFree: false,
            quantity: 1500,
            minTicketPurchase: 1,
            maxTicketPurchase: 1,
            description: 'Cự ly half marathon 21km',
            imageUrl:
              'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 789,
            startTime: new Date('2025-01-15T00:00:00Z'),
            endTime: new Date('2025-04-05T23:59:00Z'),
          },
          {
            name: 'Fun Run 10km',
            price: 400000,
            isFree: false,
            quantity: 2000,
            minTicketPurchase: 1,
            maxTicketPurchase: 1,
            description: 'Cự ly 10km dành cho mọi lứa tuổi',
            imageUrl:
              'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 1234,
            startTime: new Date('2025-01-15T00:00:00Z'),
            endTime: new Date('2025-04-05T23:59:00Z'),
          },
          {
            name: 'Family Run 5km',
            price: 200000,
            isFree: false,
            quantity: 3000,
            minTicketPurchase: 1,
            maxTicketPurchase: 4,
            description: 'Cự ly 5km dành cho gia đình',
            imageUrl:
              'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 1876,
            startTime: new Date('2025-01-15T00:00:00Z'),
            endTime: new Date('2025-04-05T23:59:00Z'),
          },
        ],
      },
    ],
    setting: {
      url: 'giai-marathon-ha-noi-2025',
      maximumAttendees: 7500,
      ageRestriction: 'ALL_AGES',
      messageAttendees: 'Mang theo giấy khám sức khỏe và CMND/CCCD',
      isPrivate: false,
      eventDescription: 'Giải chạy marathon quốc tế tại Hà Nội',
      isRefundable: true,
    },
    paymentInfo: {
      bankAccount: 'BIDV',
      bankAccountName: 'Liên đoàn Điền kinh Việt Nam',
      bankAccountNumber: '1122334455',
      bankOffice: 'Chi nhánh Hoàn Kiếm',
      businessType: 'COMPANY',
      name: 'Liên đoàn Điền kinh Việt Nam',
      address: 'Phố Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội',
      taxNumber: '1122334455',
    },
  },
  {
    eventName: 'Triển lãm Nghệ thuật Đương đại Việt Nam',
    eventDescription:
      'Triển lãm nghệ thuật quy tụ những tác phẩm đương đại của các nghệ sĩ hàng đầu Việt Nam. Khám phá xu hướng nghệ thuật mới và tham gia các workshop sáng tạo.',
    categories: ['art'],
    categoriesIds: ['666c5e58-6658-4363-82c6-93d5179ddab0'],
    eventType: 'OFFLINE',
    status: 'PUBLISHED',
    orgName: 'Bảo tàng Mỹ thuật Việt Nam',
    orgDescription: 'Cơ quan bảo tàng nghệ thuật hàng đầu Việt Nam',
    orgLogoUrl:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    eventLogoUrl:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
    eventBannerUrl:
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=600&fit=crop',
    venueName: 'Bảo tàng Mỹ thuật Việt Nam',
    cityId: 1, // Hanoi
    wardId: 1, // Sample ward
    street: '66 Nguyễn Thái Học',
    latitude: 21.0285,
    longitude: 105.8542,
    formattedAddress: '66 Nguyễn Thái Học, Ba Đình, Hà Nội, Vietnam',
    placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY7',
    organizationId: 'demo-org-4',
    shows: [
      {
        startTime: new Date('2025-05-10T08:00:00Z'),
        endTime: new Date('2025-05-10T17:00:00Z'),
        ticketTypes: [
          {
            name: 'Vé tham quan',
            price: 50000,
            isFree: false,
            quantity: 500,
            minTicketPurchase: 1,
            maxTicketPurchase: 10,
            description: 'Vé tham quan triển lãm nghệ thuật',
            imageUrl:
              'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 123,
            startTime: new Date('2025-04-01T00:00:00Z'),
            endTime: new Date('2025-05-10T16:00:00Z'),
          },
          {
            name: 'Workshop Nghệ thuật',
            price: 300000,
            isFree: false,
            quantity: 50,
            minTicketPurchase: 1,
            maxTicketPurchase: 2,
            description: 'Workshop sáng tạo nghệ thuật với các nghệ sĩ',
            imageUrl:
              'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 34,
            startTime: new Date('2025-04-01T00:00:00Z'),
            endTime: new Date('2025-05-10T16:00:00Z'),
          },
        ],
      },
    ],
    setting: {
      url: 'trien-lam-nghe-thuat-duong-dai-viet-nam',
      maximumAttendees: 550,
      ageRestriction: 'ALL_AGES',
      messageAttendees: 'Không được chụp ảnh flash trong khu vực triển lãm',
      isPrivate: false,
      eventDescription: 'Triển lãm nghệ thuật đương đại Việt Nam',
      isRefundable: true,
    },
    paymentInfo: {
      bankAccount: 'Agribank',
      bankAccountName: 'Bảo tàng Mỹ thuật Việt Nam',
      bankAccountNumber: '5566778899',
      bankOffice: 'Chi nhánh Ba Đình',
      businessType: 'COMPANY',
      name: 'Bảo tàng Mỹ thuật Việt Nam',
      address: '66 Nguyễn Thái Học, Ba Đình, Hà Nội',
      taxNumber: '5566778899',
    },
  },
  {
    eventName: 'Hội thảo Giáo dục Tương lai',
    eventDescription:
      'Hội thảo quốc tế về xu hướng giáo dục tương lai với sự tham gia của các chuyên gia giáo dục hàng đầu thế giới. Thảo luận về công nghệ trong giáo dục và phương pháp học tập mới.',
    categories: ['education'],
    categoriesIds: ['ad1066ef-5f07-44a6-9d2b-6cba40194139'],
    eventType: 'OFFLINE',
    status: 'PUBLISHED',
    orgName: 'Bộ Giáo dục và Đào tạo',
    orgDescription: 'Cơ quan quản lý giáo dục quốc gia',
    orgLogoUrl:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop',
    eventLogoUrl:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop',
    eventBannerUrl:
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&h=600&fit=crop',
    venueName: 'Trung tâm Hội nghị Quốc gia',
    cityId: 1, // Hanoi
    wardId: 1, // Sample ward
    street: 'Mỹ Đình 2',
    latitude: 21.0285,
    longitude: 105.8542,
    formattedAddress: 'Mỹ Đình 2, Nam Từ Liêm, Hà Nội, Vietnam',
    placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY8',
    organizationId: 'demo-org-5',
    shows: [
      {
        startTime: new Date('2025-06-15T07:30:00Z'),
        endTime: new Date('2025-06-15T17:30:00Z'),
        ticketTypes: [
          {
            name: 'Đại biểu chính thức',
            price: 1000000,
            isFree: false,
            quantity: 300,
            minTicketPurchase: 1,
            maxTicketPurchase: 2,
            description: 'Vé đại biểu chính thức, bao gồm tài liệu và ăn trưa',
            imageUrl:
              'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 178,
            startTime: new Date('2025-05-01T00:00:00Z'),
            endTime: new Date('2025-06-15T06:00:00Z'),
          },
          {
            name: 'Sinh viên',
            price: 200000,
            isFree: false,
            quantity: 200,
            minTicketPurchase: 1,
            maxTicketPurchase: 1,
            description:
              'Vé ưu đãi dành cho sinh viên (cần xuất trình thẻ sinh viên)',
            imageUrl:
              'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 145,
            startTime: new Date('2025-05-01T00:00:00Z'),
            endTime: new Date('2025-06-15T06:00:00Z'),
          },
        ],
      },
    ],
    setting: {
      url: 'hoi-thao-giao-duc-tuong-lai',
      maximumAttendees: 500,
      ageRestriction: 'ALL_AGES',
      messageAttendees:
        'Sinh viên vui lòng mang theo thẻ sinh viên để được ưu đãi',
      isPrivate: false,
      eventDescription: 'Hội thảo quốc tế về xu hướng giáo dục tương lai',
      isRefundable: true,
    },
    paymentInfo: {
      bankAccount: 'VietinBank',
      bankAccountName: 'Bộ Giáo dục và Đào tạo',
      bankAccountNumber: '3344556677',
      bankOffice: 'Chi nhánh Mỹ Đình',
      businessType: 'COMPANY',
      name: 'Bộ Giáo dục và Đào tạo',
      address: 'Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
      taxNumber: '3344556677',
    },
  },
  {
    eventName: 'Đêm từ thiện "Vì trẻ em nghèo vùng cao"',
    eventDescription:
      'Đêm gala từ thiện gây quỹ hỗ trợ trẻ em nghèo vùng cao với sự tham gia của nhiều nghệ sĩ nổi tiếng. Tất cả số tiền thu được sẽ được dùng để xây dựng trường học và tặng quà cho trẻ em.',
    categories: ['charity'],
    categoriesIds: ['e93a9e98-7963-4f8e-937f-4a9f4448c526'],
    eventType: 'OFFLINE',
    status: 'PUBLISHED',
    orgName: 'Quỹ Từ thiện Trái tim Việt',
    orgDescription: 'Tổ chức từ thiện phi lợi nhuận',
    orgLogoUrl:
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=400&fit=crop',
    eventLogoUrl:
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=400&fit=crop',
    eventBannerUrl:
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1200&h=600&fit=crop',
    venueName: 'Nhà hát Lớn Hà Nội',
    cityId: 1, // Hanoi
    wardId: 1, // Sample ward
    street: '1 Tràng Tiền',
    latitude: 21.0285,
    longitude: 105.8542,
    formattedAddress: '1 Tràng Tiền, Hoàn Kiếm, Hà Nội, Vietnam',
    placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY9',
    organizationId: 'demo-org-6',
    shows: [
      {
        startTime: new Date('2025-07-20T19:00:00Z'),
        endTime: new Date('2025-07-20T22:00:00Z'),
        ticketTypes: [
          {
            name: 'Bảo trợ Kim cương',
            price: 5000000,
            isFree: false,
            quantity: 20,
            minTicketPurchase: 1,
            maxTicketPurchase: 4,
            description: 'Ghế VIP hạng sang, bao gồm tiệc cocktail',
            imageUrl:
              'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 12,
            startTime: new Date('2025-06-01T00:00:00Z'),
            endTime: new Date('2025-07-20T17:00:00Z'),
          },
          {
            name: 'Bảo trợ Vàng',
            price: 2000000,
            isFree: false,
            quantity: 50,
            minTicketPurchase: 1,
            maxTicketPurchase: 6,
            description: 'Ghế VIP, tặng kèm quà lưu niệm',
            imageUrl:
              'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 34,
            startTime: new Date('2025-06-01T00:00:00Z'),
            endTime: new Date('2025-07-20T17:00:00Z'),
          },
          {
            name: 'Vé ủng hộ',
            price: 500000,
            isFree: false,
            quantity: 400,
            minTicketPurchase: 1,
            maxTicketPurchase: 8,
            description: 'Vé ủng hộ chương trình từ thiện',
            imageUrl:
              'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=300&fit=crop',
            isHidden: false,
            soldQuantity: 267,
            startTime: new Date('2025-06-01T00:00:00Z'),
            endTime: new Date('2025-07-20T17:00:00Z'),
          },
        ],
      },
    ],
    setting: {
      url: 'dem-tu-thien-vi-tre-em-ngheo-vung-cao',
      maximumAttendees: 470,
      ageRestriction: 'ALL_AGES',
      messageAttendees: 'Chương trình từ thiện, mọi đóng góp đều được ghi nhận',
      isPrivate: false,
      eventDescription:
        'Đêm gala từ thiện gây quỹ hỗ trợ trẻ em nghèo vùng cao',
      isRefundable: false,
    },
    paymentInfo: {
      bankAccount: 'Sacombank',
      bankAccountName: 'Quỹ Từ thiện Trái tim Việt',
      bankAccountNumber: '7788990011',
      bankOffice: 'Chi nhánh Hoàn Kiếm',
      businessType: 'COMPANY',
      name: 'Quỹ Từ thiện Trái tim Việt',
      address: '1 Tràng Tiền, Hoàn Kiếm, Hà Nội',
      taxNumber: '7788990011',
    },
  },
];

// PostgreSQL connection
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'event_service',
  entities: [path.join(__dirname, '../src/**/*.entity{.ts,.js}')],
});

async function generateDemoEvents() {
  try {
    console.log('🚀 Starting Demo Events Generation...');

    // Initialize PostgreSQL connection
    await dataSource.initialize();
    console.log('Connected to PostgreSQL');

    // Clear existing demo data
    console.log('🧹 Clearing existing demo data...');
    await dataSource.query(
      `DELETE FROM ticket_types WHERE event_id IN (SELECT id FROM events WHERE organization_id LIKE 'demo-org-%')`,
    );
    await dataSource.query(
      `DELETE FROM shows WHERE event_id IN (SELECT id FROM events WHERE organization_id LIKE 'demo-org-%')`,
    );
    await dataSource.query(
      `DELETE FROM payment_info WHERE event_id IN (SELECT id FROM events WHERE organization_id LIKE 'demo-org-%')`,
    );
    await dataSource.query(
      `DELETE FROM settings WHERE event_id IN (SELECT id FROM events WHERE organization_id LIKE 'demo-org-%')`,
    );
    await dataSource.query(
      `DELETE FROM events WHERE organization_id LIKE 'demo-org-%'`,
    );

    for (const demoEvent of DEMO_EVENTS) {
      console.log(`📅 Creating event: ${demoEvent.eventName}`);

      // Insert event
      const eventResult = await dataSource.query(
        `INSERT INTO events (
          organization_id, event_name, event_description, event_type, status,
          org_name, org_description, org_logo_url, event_logo_url, event_banner_url,
          venue_name, city_id, ward_id, street, latitude, longitude, formatted_address, place_id,
          categories, categories_ids, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW())
        RETURNING id`,
        [
          demoEvent.organizationId,
          demoEvent.eventName,
          demoEvent.eventDescription,
          demoEvent.eventType,
          demoEvent.status,
          demoEvent.orgName,
          demoEvent.orgDescription,
          demoEvent.orgLogoUrl,
          demoEvent.eventLogoUrl,
          demoEvent.eventBannerUrl,
          demoEvent.venueName,
          demoEvent.cityId,
          demoEvent.wardId,
          demoEvent.street,
          demoEvent.latitude,
          demoEvent.longitude,
          demoEvent.formattedAddress,
          demoEvent.placeId,
          demoEvent.categories,
          demoEvent.categoriesIds,
        ],
      );

      const eventId = eventResult[0].id;

      // Insert setting
      await dataSource.query(
        `INSERT INTO settings (
          event_id, url, maximum_attendees, age_restriction, message_attendees,
          is_private, event_description, is_refundable, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [
          eventId,
          demoEvent.setting.url,
          demoEvent.setting.maximumAttendees,
          demoEvent.setting.ageRestriction,
          demoEvent.setting.messageAttendees,
          demoEvent.setting.isPrivate,
          demoEvent.setting.eventDescription,
          demoEvent.setting.isRefundable,
        ],
      );

      // Insert payment info
      await dataSource.query(
        `INSERT INTO payment_info (
          event_id, bank_account, bank_account_name, bank_account_number, bank_office,
          business_type, name, address, tax_number, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          eventId,
          demoEvent.paymentInfo.bankAccount,
          demoEvent.paymentInfo.bankAccountName,
          demoEvent.paymentInfo.bankAccountNumber,
          demoEvent.paymentInfo.bankOffice,
          demoEvent.paymentInfo.businessType,
          demoEvent.paymentInfo.name,
          demoEvent.paymentInfo.address,
          demoEvent.paymentInfo.taxNumber,
        ],
      );

      // Insert shows and ticket types
      for (const show of demoEvent.shows) {
        const showResult = await dataSource.query(
          `INSERT INTO shows (
            event_id, start_time, end_time, locked, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, NOW(), NOW())
          RETURNING id`,
          [eventId, show.startTime, show.endTime, false],
        );

        const showId = showResult[0].id;

        for (const ticketType of show.ticketTypes) {
          await dataSource.query(
            `INSERT INTO ticket_types (
              show_id, event_id, name, price, is_free, quantity, min_ticket_purchase,
              max_ticket_purchase, start_time, end_time, description, image_url,
              is_hidden, sold_quantity, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`,
            [
              showId,
              eventId,
              ticketType.name,
              ticketType.price,
              ticketType.isFree,
              ticketType.quantity,
              ticketType.minTicketPurchase,
              ticketType.maxTicketPurchase,
              ticketType.startTime,
              ticketType.endTime,
              ticketType.description,
              ticketType.imageUrl,
              ticketType.isHidden,
              ticketType.soldQuantity,
            ],
          );
        }
      }

      console.log(`✅ Created event: ${demoEvent.eventName} (ID: ${eventId})`);
    }

    console.log('\n🎉 Demo events generation completed successfully!');
    console.log(
      `📊 Summary: Created ${DEMO_EVENTS.length} demo events with real Vietnamese data`,
    );
    console.log(`📍 Events created in: Hanoi, Ho Chi Minh City`);
    console.log(
      `🎫 Total ticket types: ${DEMO_EVENTS.reduce((sum, event) => sum + event.shows.reduce((showSum, show) => showSum + show.ticketTypes.length, 0), 0)}`,
    );

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error during demo events generation:', error);
    process.exit(1);
  }
}

// Run the generation
generateDemoEvents();
