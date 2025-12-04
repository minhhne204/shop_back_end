import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Category from './models/Category.js'
import Brand from './models/Brand.js'
import Product from './models/Product.js'
import Policy from './models/Policy.js'
import Blog from './models/Blog.js'
import User from './models/User.js'
import Banner from './models/Banner.js'

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

const categories = [
  {
    name: 'Anime Figure',
    slug: 'anime-figure',
    image: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400'
  },
  {
    name: 'Game Figure',
    slug: 'game-figure',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400'
  },
  {
    name: 'Movie Figure',
    slug: 'movie-figure',
    image: 'https://images.unsplash.com/photo-1559535332-db9971090158?w=400'
  },
  {
    name: 'Gundam',
    slug: 'gundam',
    image: 'https://images.unsplash.com/photo-1569466126773-842a038edb84?w=400'
  },
  {
    name: 'Nendoroid',
    slug: 'nendoroid',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
  },
  {
    name: 'Scale Figure',
    slug: 'scale-figure',
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400'
  }
]

const brands = [
  {
    name: 'Bandai',
    slug: 'bandai',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Bandai_Logo.svg/200px-Bandai_Logo.svg.png'
  },
  {
    name: 'Good Smile Company',
    slug: 'good-smile-company',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Good_Smile_Company_logo.svg/200px-Good_Smile_Company_logo.svg.png'
  },
  {
    name: 'Kotobukiya',
    slug: 'kotobukiya',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Kotobukiya_Logo.svg/200px-Kotobukiya_Logo.svg.png'
  },
  {
    name: 'MegaHouse',
    slug: 'megahouse',
    logo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100'
  },
  {
    name: 'Max Factory',
    slug: 'max-factory',
    logo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100'
  },
  {
    name: 'Prime 1 Studio',
    slug: 'prime-1-studio',
    logo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100'
  }
]

const policies = [
  {
    type: 'shipping',
    title: 'Chính sách vận chuyển',
    content: `Vận chuyển toàn quốc

Thời gian giao hàng:
- Nội thành Hà Nội, TP.HCM: 1-2 ngày làm việc
- Các tỉnh thành khác: 3-5 ngày làm việc
- Vùng sâu vùng xa: 5-7 ngày làm việc

Phí vận chuyển:
- Miễn phí vận chuyển cho đơn hàng từ 500.000đ
- Đơn hàng dưới 500.000đ: 30.000đ
- Sản phẩm lớn, nặng: Phí vận chuyển tính theo cân nặng và kích thước

Đối tác vận chuyển:
- Giao Hàng Nhanh (GHN)
- Giao Hàng Tiết Kiệm (GHTK)
- Viettel Post

Lưu ý:
- Vui lòng kiểm tra sản phẩm khi nhận hàng
- Liên hệ ngay nếu sản phẩm bị hư hỏng trong quá trình vận chuyển`
  },
  {
    type: 'return',
    title: 'Chính sách đổi trả',
    content: `Chính sách đổi trả sản phẩm

Điều kiện đổi trả:
- Sản phẩm bị lỗi từ nhà sản xuất
- Sản phẩm không đúng mẫu mã, kích thước đã đặt
- Sản phẩm bị hư hỏng trong quá trình vận chuyển

Thời hạn đổi trả:
- Trong vòng 7 ngày kể từ ngày nhận hàng
- Sản phẩm phải còn nguyên tem, mác, bao bì

Quy trình đổi trả:
1. Liên hệ hotline hoặc gửi email thông báo lỗi sản phẩm
2. Gửi ảnh/video sản phẩm bị lỗi
3. Nhận xác nhận từ shop
4. Gửi sản phẩm về địa chỉ shop
5. Nhận sản phẩm mới hoặc hoàn tiền

Trường hợp không áp dụng đổi trả:
- Sản phẩm đã quá thời hạn đổi trả
- Sản phẩm bị hư hỏng do người dùng
- Sản phẩm đã được mở seal, lắp ráp`
  },
  {
    type: 'payment',
    title: 'Chính sách thanh toán',
    content: `Phương thức thanh toán

1. Thanh toán khi nhận hàng (COD)
- Áp dụng cho tất cả đơn hàng
- Thanh toán bằng tiền mặt khi nhận hàng

2. Chuyển khoản ngân hàng
- Chuyển khoản trước khi giao hàng
- Thông tin tài khoản:
  + Ngân hàng: Vietcombank
  + Số tài khoản: 1234567890
  + Chủ tài khoản: CÔNG TY GAMEFORGE
  + Nội dung: [Mã đơn hàng] + [Số điện thoại]

3. Ví điện tử
- MoMo
- ZaloPay
- VNPay

Lưu ý:
- Đơn hàng sẽ được xử lý sau khi xác nhận thanh toán thành công
- Vui lòng giữ lại biên lai chuyển khoản để đối chiếu khi cần thiết`
  },
  {
    type: 'privacy',
    title: 'Chính sách bảo mật',
    content: `Chính sách bảo mật thông tin

Thu thập thông tin:
- Họ tên, số điện thoại, địa chỉ giao hàng
- Email để liên lạc và gửi thông tin đơn hàng
- Lịch sử mua hàng để cải thiện dịch vụ

Mục đích sử dụng:
- Xử lý đơn hàng và giao hàng
- Liên hệ xác nhận đơn hàng
- Gửi thông tin khuyến mãi (nếu đồng ý)
- Cải thiện chất lượng dịch vụ

Bảo mật thông tin:
- Thông tin khách hàng được bảo mật tuyệt đối
- Không chia sẻ thông tin với bên thứ ba
- Sử dụng SSL để mã hóa dữ liệu

Quyền của khách hàng:
- Yêu cầu cập nhật thông tin cá nhân
- Yêu cầu xóa thông tin khỏi hệ thống
- Từ chối nhận email marketing`
  },
  {
    type: 'terms',
    title: 'Điều khoản sử dụng',
    content: `Điều khoản sử dụng website

1. Điều khoản chung
- Website GameForge cung cấp dịch vụ bán mô hình figure
- Người dùng phải trên 18 tuổi hoặc có sự đồng ý của phụ huynh
- Nghiêm cấm sử dụng website vào mục đích bất hợp pháp

2. Tài khoản người dùng
- Mỗi người chỉ được đăng ký 1 tài khoản
- Chịu trách nhiệm bảo mật thông tin đăng nhập
- Shop có quyền khóa tài khoản vi phạm điều khoản

3. Đặt hàng
- Giá sản phẩm có thể thay đổi không báo trước
- Đơn hàng chỉ hợp lệ khi được xác nhận
- Shop có quyền từ chối đơn hàng có dấu hiệu gian lận

4. Sản phẩm
- Hình ảnh sản phẩm mang tính chất minh họa
- Màu sắc thực tế có thể khác do màn hình
- Sản phẩm Pre-order cần đặt cọc theo quy định

5. Quyền sở hữu trí tuệ
- Nội dung website thuộc quyền sở hữu của GameForge
- Nghiêm cấm sao chép, sử dụng nội dung khi chưa được phép`
  }
]

const banners = [
  {
    title: 'Khuyến mãi mùa hè',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop',
    link: '/san-pham?sale=true',
    isActive: true,
    order: 1
  },
  {
    title: 'Bộ sưu tập Anime mới',
    image: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=1200&h=400&fit=crop',
    link: '/danh-muc/anime-figure',
    isActive: true,
    order: 2
  },
  {
    title: 'Pre-order Gundam',
    image: 'https://images.unsplash.com/photo-1569466126773-842a038edb84?w=1200&h=400&fit=crop',
    link: '/san-pham?status=preorder',
    isActive: true,
    order: 3
  }
]

const seedData = async () => {
  try {
    await connectDB()

    await Category.deleteMany({})
    await Brand.deleteMany({})
    await Product.deleteMany({})
    await Policy.deleteMany({})
    await Blog.deleteMany({})
    await Banner.deleteMany({})

    console.log('Đã xóa dữ liệu cũ')

    const createdCategories = await Category.insertMany(categories)
    console.log('Đã tạo danh mục:', createdCategories.length)

    const createdBrands = await Brand.insertMany(brands)
    console.log('Đã tạo thương hiệu:', createdBrands.length)

    await Policy.insertMany(policies)
    console.log('Đã tạo chính sách:', policies.length)

    await Banner.insertMany(banners)
    console.log('Đã tạo banner:', banners.length)

    const products = [
      {
        name: 'Mô hình Goku Ultra Instinct',
        slug: 'mo-hinh-goku-ultra-instinct',
        description: 'Mô hình Goku trạng thái Ultra Instinct từ Dragon Ball Super. Chi tiết sắc nét, chất lượng cao. Kích thước 25cm, chất liệu PVC cao cấp.',
        price: 1500000,
        salePrice: 1200000,
        images: [
          'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=600',
          'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600'
        ],
        category: createdCategories[0]._id,
        brand: createdBrands[0]._id,
        status: 'available',
        stock: 15,
        ratings: { average: 4.8, count: 24 },
        soldCount: 50,
        isFeatured: true
      },
      {
        name: 'Mô hình Naruto Sage Mode',
        slug: 'mo-hinh-naruto-sage-mode',
        description: 'Tượng Naruto chế độ Sage. Kích thước 25cm, chi tiết tinh xảo. Đế tượng có hiệu ứng chakra.',
        price: 2800000,
        images: [
          'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=600',
          'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=600'
        ],
        category: createdCategories[0]._id,
        brand: createdBrands[2]._id,
        status: 'available',
        stock: 8,
        ratings: { average: 4.9, count: 18 },
        soldCount: 35,
        isFeatured: true
      },
      {
        name: 'RX-78-2 Gundam PG 1/60',
        slug: 'rx-78-2-gundam-pg-160',
        description: 'Bộ kit Gundam RX-78-2 tỉ lệ 1/60 Perfect Grade. Bao gồm LED unit cho mắt và cockpit. Khớp linh hoạt, có thể tạo nhiều tư thế.',
        price: 4500000,
        salePrice: 3800000,
        images: [
          'https://images.unsplash.com/photo-1569466126773-842a038edb84?w=600',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'
        ],
        category: createdCategories[3]._id,
        brand: createdBrands[0]._id,
        status: 'available',
        stock: 5,
        ratings: { average: 5.0, count: 12 },
        soldCount: 20,
        isFeatured: true
      },
      {
        name: 'Nendoroid Rem Re:Zero',
        slug: 'nendoroid-rem-rezero',
        description: 'Nendoroid Rem từ Re:Zero. Kèm theo nhiều phụ kiện thay đổi biểu cảm và tư thế. Kích thước 10cm.',
        price: 850000,
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
          'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600'
        ],
        category: createdCategories[4]._id,
        brand: createdBrands[1]._id,
        status: 'available',
        stock: 20,
        ratings: { average: 4.7, count: 45 },
        soldCount: 80,
        isFeatured: true
      },
      {
        name: 'Mô hình Link Breath of the Wild',
        slug: 'mo-hinh-link-breath-of-the-wild',
        description: 'Mô hình Link từ The Legend of Zelda: Breath of the Wild. Scale 1/7, chiều cao 25cm. Chi tiết trang phục và vũ khí.',
        price: 3200000,
        images: [
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'
        ],
        category: createdCategories[1]._id,
        brand: createdBrands[1]._id,
        status: 'order',
        stock: 0,
        ratings: { average: 4.6, count: 8 },
        soldCount: 15
      },
      {
        name: 'Mô hình Spider-Man Miles Morales',
        slug: 'mo-hinh-spider-man-miles-morales',
        description: 'Mô hình Spider-Man Miles Morales từ game PS5. Chi tiết cao, có thể thay đổi tư thế. Kèm hiệu ứng điện.',
        price: 2100000,
        images: [
          'https://images.unsplash.com/photo-1559535332-db9971090158?w=600',
          'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=600'
        ],
        category: createdCategories[2]._id,
        brand: createdBrands[2]._id,
        status: 'available',
        stock: 12,
        ratings: { average: 4.5, count: 22 },
        soldCount: 40
      },
      {
        name: 'Tượng Vegeta Final Flash',
        slug: 'tuong-vegeta-final-flash',
        description: 'Tượng Vegeta đang sử dụng chiêu Final Flash. Hiệu ứng LED đi kèm. Kích thước 35cm, phiên bản giới hạn.',
        price: 5500000,
        images: [
          'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=600',
          'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600'
        ],
        category: createdCategories[0]._id,
        brand: createdBrands[5]._id,
        status: 'preorder',
        stock: 0,
        ratings: { average: 0, count: 0 },
        soldCount: 0
      },
      {
        name: 'Mô hình Zoro Wano Country',
        slug: 'mo-hinh-zoro-wano-country',
        description: 'Mô hình Roronoa Zoro trong trang phục Wano từ One Piece. Kiếm Enma chi tiết. Kích thước 28cm.',
        price: 1800000,
        salePrice: 1500000,
        images: [
          'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=600',
          'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=600'
        ],
        category: createdCategories[0]._id,
        brand: createdBrands[3]._id,
        status: 'available',
        stock: 10,
        ratings: { average: 4.8, count: 30 },
        soldCount: 55,
        isFeatured: true
      },
      {
        name: 'Figma Saber Alter',
        slug: 'figma-saber-alter',
        description: 'Figma Saber Alter từ Fate/Stay Night. Khớp linh hoạt, nhiều phụ kiện. Kèm kiếm Excalibur Morgan.',
        price: 1200000,
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
          'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600'
        ],
        category: createdCategories[0]._id,
        brand: createdBrands[4]._id,
        status: 'available',
        stock: 7,
        ratings: { average: 4.9, count: 15 },
        soldCount: 25
      },
      {
        name: 'Mô hình Tanjiro Kamado',
        slug: 'mo-hinh-tanjiro-kamado',
        description: 'Mô hình Tanjiro Kamado với hiệu ứng Hinokami Kagura. Lửa được làm từ nhựa trong suốt. Kích thước 20cm.',
        price: 1650000,
        images: [
          'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=600',
          'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=600'
        ],
        category: createdCategories[0]._id,
        brand: createdBrands[2]._id,
        status: 'available',
        stock: 18,
        ratings: { average: 4.7, count: 38 },
        soldCount: 65
      },
      {
        name: 'Mô hình Raiden Shogun Genshin Impact',
        slug: 'mo-hinh-raiden-shogun-genshin-impact',
        description: 'Mô hình Raiden Shogun từ Genshin Impact. Scale 1/7, chi tiết tuyệt đẹp. Kèm hiệu ứng sét.',
        price: 3800000,
        images: [
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'
        ],
        category: createdCategories[1]._id,
        brand: createdBrands[1]._id,
        status: 'preorder',
        stock: 0,
        ratings: { average: 0, count: 0 },
        soldCount: 0
      },
      {
        name: 'Mô hình Levi Ackerman',
        slug: 'mo-hinh-levi-ackerman',
        description: 'Mô hình Levi Ackerman đang chiến đấu từ Attack on Titan. Có đế đứng và ODM Gear chi tiết.',
        price: 2200000,
        images: [
          'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600',
          'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=600'
        ],
        category: createdCategories[0]._id,
        brand: createdBrands[2]._id,
        status: 'available',
        stock: 6,
        ratings: { average: 4.9, count: 42 },
        soldCount: 70,
        isFeatured: true
      }
    ]

    await Product.insertMany(products)
    console.log('Đã tạo sản phẩm:', products.length)

    let admin = await User.findOne({ role: 'admin' })
    if (!admin) {
      admin = await User.create({
        email: 'admin@gameforge.com',
        password: 'Admin123456',
        fullName: 'Admin GameForge',
        role: 'admin'
      })
      console.log('Đã tạo tài khoản admin')
    }

    const blogs = [
      {
        title: 'Hướng dẫn bảo quản mô hình figure',
        slug: 'huong-dan-bao-quan-mo-hinh-figure',
        thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        content: `Bảo quản mô hình figure đúng cách là yếu tố quan trọng để giữ cho figure của bạn luôn đẹp như mới.

1. Tránh ánh sáng mặt trời trực tiếp
Ánh nắng mặt trời có thể làm phai màu và hư hỏng chất liệu plastic. Đặt figure ở nơi có bóng mát hoặc sử dụng tủ kính có kính lọc UV.

2. Kiểm soát độ ẩm
Độ ẩm cao có thể gây mốc, trong khi quá khô sẽ làm giòn plastic. Giữ độ ẩm trong khoảng 40-60%.

3. Làm sạch định kỳ
Dùng cọ mềm hoặc khăn vải sạch để lau bụi. Tránh dùng nước trực tiếp lên figure.

4. Sử dụng hộp/tủ trưng bày
Tủ kính hoặc hộp acrylic sẽ bảo vệ figure khỏi bụi và tác động từ bên ngoài.

5. Chú ý nhiệt độ
Nhiệt độ cao có thể làm biến dạng figure. Giữ nhiệt độ phòng ở mức 20-25 độ C.`,
        author: admin._id,
        isPublished: true
      },
      {
        title: 'Top 5 thương hiệu figure chất lượng nhất 2024',
        slug: 'top-5-thuong-hieu-figure-chat-luong-nhat-2024',
        thumbnail: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=800',
        content: `Danh sách các thương hiệu figure được đánh giá cao nhất năm 2024:

1. Good Smile Company
Nổi tiếng với dòng Nendoroid và Figma. Chất lượng ổn định, giá hợp lý.

2. Bandai
Ông lớn trong ngành figure với dòng Gundam huyền thoại và S.H.Figuarts.

3. Kotobukiya
Chuyên về figure nữ và bishoujo. Chất lượng sơn tuyệt vời.

4. MegaHouse
Dòng Portrait of Pirates (One Piece) cực kỳ được yêu thích.

5. Prime 1 Studio
Phân khúc cao cấp với các tượng kích thước lớn, chi tiết đến kinh ngạc.

Mỗi thương hiệu đều có thế mạnh riêng, lựa chọn phụ thuộc vào sở thích và ngân sách của bạn.`,
        author: admin._id,
        isPublished: true
      },
      {
        title: 'Pre-order là gì và cần lưu ý những gì?',
        slug: 'pre-order-la-gi-va-can-luu-y-nhung-gi',
        thumbnail: 'https://images.unsplash.com/photo-1569466126773-842a038edb84?w=800',
        content: `Pre-order (đặt trước) là hình thức đặt hàng sản phẩm trước khi sản phẩm chính thức được phát hành.

Ưu điểm của Pre-order:
- Đảm bảo sở hữu sản phẩm, đặc biệt với figure limited
- Giá thường rẻ hơn khi mua retail
- Có thể trả góp hoặc đặt cọc

Những điều cần lưu ý:

1. Thời gian chờ
Sản phẩm có thể mất 6-12 tháng để sản xuất và giao hàng.

2. Chính sách hoàn/hủy
Mỗi shop có chính sách khác nhau. Đọc kỹ trước khi đặt.

3. Giá có thể thay đổi
Tỷ giá và phí vận chuyển quốc tế có thể làm tăng giá cuối.

4. Rủi ro delay
Nhà sản xuất có thể delay sản phẩm vì nhiều lý do.

5. Uy tín shop
Chỉ đặt pre-order ở những shop uy tín, có lịch sử tốt.`,
        author: admin._id,
        isPublished: true
      }
    ]

    await Blog.insertMany(blogs)
    console.log('Đã tạo bài viết:', blogs.length)

    console.log('\n✓ Seed hoàn thành!')
    console.log('------------------')
    console.log('Tài khoản Admin:')
    console.log('Email: admin@gameforge.com')
    console.log('Password: Admin123456')
    process.exit(0)
  } catch (error) {
    console.error('Lỗi seed:', error)
    process.exit(1)
  }
}

seedData()
