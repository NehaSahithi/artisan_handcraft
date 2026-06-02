import './loadEnv.js';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import ArtisanProfile from './src/models/ArtisanProfile.js';
import Product from './src/models/Product.js';


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const artisansData = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.pottery@example.com',
    password: 'password123',
    role: 'artisan',
    phone: '9876543210',
    avatar: 'https://images.unsplash.com/photo-1565192647048-f997ee879485?w=400&q=80',
    shopName: 'Jaipur Blue Pottery Studio',
    tagline: 'Authentic handcrafted blue pottery from the heart of Rajasthan',
    story: 'I have been practicing the art of blue pottery for over 20 years, learning from my grandfather. Every piece is unique and made with love.',
    state: 'Rajasthan',
    craftCategories: ['Pottery & Ceramics', 'Painting & Art'],
    yearsOfExperience: 20
  },
  {
    name: 'Lakshmi Devi',
    email: 'lakshmi.weaves@example.com',
    password: 'password123',
    role: 'artisan',
    phone: '9876543211',
    avatar: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&q=80',
    shopName: 'Lakshmi Kanjeevaram',
    tagline: 'Exquisite handwoven silk sarees',
    story: 'Weaving is in my blood. I create traditional Kanjeevaram sarees that tell a story of our heritage.',
    state: 'Tamil Nadu',
    craftCategories: ['Textiles & Weaving'],
    yearsOfExperience: 35
  },
  {
    name: 'Suresh Vishwakarma',
    email: 'suresh.woodcarver@example.com',
    password: 'password123',
    role: 'artisan',
    phone: '9876543212',
    avatar: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&q=80',
    shopName: 'Saharanpur Woodworks',
    tagline: 'Intricate wood carvings and furniture',
    story: 'Specializing in fine wood carving for home decor, following traditional Saharanpur techniques.',
    state: 'Uttar Pradesh',
    craftCategories: ['Wood Carving'],
    yearsOfExperience: 15
  },
  {
    name: 'Anjali Shah',
    email: 'anjali.jewelry@example.com',
    password: 'password123',
    role: 'artisan',
    phone: '9876543213',
    avatar: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=400&q=80',
    shopName: 'Anjali Silver Crafts',
    tagline: 'Handcrafted silver and tribal jewelry',
    story: 'I design and handcraft silver jewelry inspired by tribal motifs and modern aesthetics.',
    state: 'Gujarat',
    craftCategories: ['Jewelry', 'Metal Work'],
    yearsOfExperience: 8
  },
  {
    name: 'Ram Singh',
    email: 'ram.dhokra@example.com',
    password: 'password123',
    role: 'artisan',
    phone: '9876543214',
    avatar: 'https://images.unsplash.com/photo-1584438784894-089d6a128f3e?w=400&q=80',
    shopName: 'Bastar Dhokra Art',
    tagline: 'Ancient lost-wax casting metal art',
    story: 'Preserving the 4000-year-old art of Dhokra casting, creating beautiful metal artifacts.',
    state: 'Chhattisgarh',
    craftCategories: ['Dhokra Art', 'Metal Work', 'Bell Metal'],
    yearsOfExperience: 25
  },
];

const productTemplates = [
  {
    name: 'Hand-Painted Blue Pottery Plate',
    description: 'A beautiful 10-inch hand-painted ceramic plate featuring traditional blue pottery floral designs. Perfect for wall decor or serving dry snacks.',
    category: 'Pottery & Ceramics',
    price: 1200,
    discount: 10,
    stock: 15,
    images: [{ url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80', publicId: 'seed_plate_1', alt: 'Blue Pottery Plate' }],
  },
  {
    name: 'Ceramic Serving Bowl Set',
    description: 'Set of 2 handcrafted ceramic bowls with intricate patterns. Glazed for a smooth finish and food safety.',
    category: 'Pottery & Ceramics',
    price: 2500,
    stock: 8,
    images: [{ url: 'https://images.unsplash.com/photo-1576021182211-9ea8dcb365ef?w=600&q=80', publicId: 'seed_bowl_1', alt: 'Ceramic Bowls' }],
  },
  {
    name: 'Authentic Kanjeevaram Silk Saree',
    description: 'A stunning pure silk Kanjeevaram saree in vibrant magenta with gold zari work. Perfect for weddings and festive occasions.',
    category: 'Textiles & Weaving',
    price: 15000,
    discount: 5,
    stock: 3,
    images: [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80', publicId: 'seed_saree_1', alt: 'Kanjeevaram Saree' }],
  },
  {
    name: 'Handwoven Ikat Cotton Dupatta',
    description: 'Soft and breathable cotton dupatta with traditional Ikat weave patterns. Adds elegance to any plain kurta.',
    category: 'Textiles & Weaving',
    price: 850,
    stock: 20,
    images: [{ url: 'https://images.unsplash.com/photo-1596455607563-ad6193f78b51?w=600&q=80', publicId: 'seed_dupatta_1', alt: 'Ikat Dupatta' }],
  },
  {
    name: 'Carved Wooden Wall Panel',
    description: 'Intricately carved wooden wall panel depicting the tree of life. Made from premium teak wood and polished to a rich finish.',
    category: 'Wood Carving',
    price: 4500,
    stock: 5,
    images: [{ url: 'https://images.unsplash.com/photo-1606170033648-5d55a3edf314?w=600&q=80', publicId: 'seed_wood_panel_1', alt: 'Wooden Wall Panel' }],
  },
  {
    name: 'Handcrafted Wooden Elephant Showpiece',
    description: 'Beautifully carved wooden elephant with detailed jali work. A perfect addition to your living room showcase.',
    category: 'Wood Carving',
    price: 1500,
    stock: 12,
    images: [{ url: 'https://images.unsplash.com/photo-1582560469780-60b5cf2e54fb?w=600&q=80', publicId: 'seed_wood_elephant_1', alt: 'Wooden Elephant' }],
  },
  {
    name: 'Oxidized Silver Tribal Necklace',
    description: 'Statement tribal necklace made of oxidized silver. Features intricate motifs and bells. Pairs well with ethnic wear.',
    category: 'Jewelry',
    price: 2200,
    discount: 15,
    stock: 10,
    images: [{ url: 'https://images.unsplash.com/photo-1599643477873-1634b8c1d5fa?w=600&q=80', publicId: 'seed_necklace_1', alt: 'Silver Necklace' }],
  },
  {
    name: 'Handcrafted Silver Jhumkas',
    description: 'Classic silver jhumkas with delicate filigree work. Lightweight and comfortable for everyday wear.',
    category: 'Jewelry',
    price: 950,
    stock: 25,
    images: [{ url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', publicId: 'seed_jhumkas_1', alt: 'Silver Jhumkas' }],
  },
  {
    name: 'Dhokra Brass Tribal Figurine',
    description: 'A traditional Dhokra lost-wax cast figurine showcasing tribal life. An excellent collector\'s item.',
    category: 'Dhokra Art',
    price: 3200,
    stock: 6,
    images: [{ url: 'https://images.unsplash.com/photo-1603513360408-f9b8c081e7d5?w=600&q=80', publicId: 'seed_dhokra_1', alt: 'Dhokra Figurine' }],
  },
  {
    name: 'Dhokra Metal Horse',
    description: 'Beautifully detailed Dhokra art horse. Handcrafted using ancient metal casting techniques.',
    category: 'Dhokra Art',
    price: 2800,
    stock: 8,
    images: [{ url: 'https://images.unsplash.com/photo-1581428982868-e410dd127a90?w=600&q=80', publicId: 'seed_dhokra_horse_1', alt: 'Dhokra Horse' }],
  },
  {
    name: 'Hand-Painted Kalamkari Saree',
    description: 'Stunning Kalamkari cotton saree with hand-painted mythological motifs using natural dyes.',
    category: 'Textiles & Weaving',
    price: 4500,
    stock: 5,
    images: [{ url: 'https://images.unsplash.com/photo-1620023616223-99d9beceea6d?w=600&q=80', publicId: 'seed_kalamkari_1', alt: 'Kalamkari Saree' }],
  },
  {
    name: 'Terracotta Clay Planter',
    description: 'Eco-friendly terracotta planter with Warli painting accents. Perfect for indoor plants.',
    category: 'Pottery & Ceramics',
    price: 650,
    stock: 30,
    images: [{ url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80', publicId: 'seed_planter_1', alt: 'Terracotta Planter' }],
  },
  {
    name: 'Carved Wooden Spice Box',
    description: 'Traditional Indian masala dabba (spice box) carved from Sheesham wood with a glass top.',
    category: 'Wood Carving',
    price: 1800,
    discount: 5,
    stock: 15,
    images: [{ url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80', publicId: 'seed_spicebox_1', alt: 'Wooden Spice Box' }],
  },
  {
    name: 'Brass Hanging Diya',
    description: 'Ornate brass hanging diya with multiple wicks. Perfect for pooja room and festive decor.',
    category: 'Metal Work',
    price: 1400,
    stock: 12,
    images: [{ url: 'https://images.unsplash.com/photo-1601633513364-77e8be2054ff?w=600&q=80', publicId: 'seed_diya_1', alt: 'Brass Diya' }],
  },
  {
    name: 'Kundan Meenakari Earrings',
    description: 'Elegant Kundan earrings with traditional Meenakari work. Ideal for weddings and parties.',
    category: 'Jewelry',
    price: 3500,
    stock: 7,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478524-fb524b89389e?w=600&q=80', publicId: 'seed_kundan_1', alt: 'Kundan Earrings' }],
  },
  {
    name: 'Madhubani Painting Wall Art',
    description: 'Authentic Madhubani painting on handmade paper depicting nature. Unframed.',
    category: 'Painting & Art',
    price: 2100,
    stock: 10,
    images: [{ url: 'https://images.unsplash.com/photo-1577908851494-df03348ab798?w=600&q=80', publicId: 'seed_madhubani_1', alt: 'Madhubani Painting' }],
  },
  {
    name: 'Bamboo Cane Lampshade',
    description: 'Eco-friendly lampshade woven from natural bamboo cane. Gives a warm, earthy glow.',
    category: 'Bamboo & Cane',
    price: 1100,
    stock: 22,
    images: [{ url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80', publicId: 'seed_lamp_1', alt: 'Bamboo Lampshade' }],
  },
  {
    name: 'Leather Embossed Journal',
    description: 'Handcrafted leather journal with embossed Celtic designs and handmade paper pages.',
    category: 'Leather Craft',
    price: 850,
    stock: 40,
    images: [{ url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80', publicId: 'seed_journal_1', alt: 'Leather Journal' }],
  },
  {
    name: 'Pashmina Wool Shawl',
    description: 'Luxuriously soft and warm Pashmina shawl from Kashmir with intricate embroidery.',
    category: 'Textiles & Weaving',
    price: 8500,
    discount: 12,
    stock: 5,
    images: [{ url: 'https://images.unsplash.com/photo-1520986566874-5c94e09f53e6?w=600&q=80', publicId: 'seed_shawl_1', alt: 'Pashmina Shawl' }],
  },
  {
    name: 'Stone Carved Buddha Statue',
    description: 'Serene Buddha statue hand-carved from single block of soapstone.',
    category: 'Stone Carving',
    price: 5500,
    stock: 4,
    images: [{ url: 'https://images.unsplash.com/photo-1590059902636-6e11409971eb?w=600&q=80', publicId: 'seed_buddha_1', alt: 'Buddha Statue' }],
  }
];

const importData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    // Clear products and artisan profiles
    await Product.deleteMany();
    await ArtisanProfile.deleteMany();
    
    // Clear all users
    await User.deleteMany();

    console.log('Inserting default evaluation users (Buyer, Artisan, Admin)...');
    
    // 1. Seed standard Buyer
    await User.create({
      name: 'Demo Buyer',
      email: 'buyer@test.com',
      password: 'password123',
      role: 'buyer',
      phone: '9876543219',
      isEmailVerified: true
    });

    // 2. Seed standard Admin
    await User.create({
      name: 'System Administrator',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      phone: '9876543217',
      isEmailVerified: true
    });

    // 3. Seed standard Artisan
    const artisanUser = await User.create({
      name: 'Demo Artisan',
      email: 'artisan@test.com',
      password: 'password123',
      role: 'artisan',
      phone: '9876543218',
      isEmailVerified: true
    });

    await ArtisanProfile.create({
      user: artisanUser._id,
      shopName: 'Heritage Crafts India',
      tagline: 'Preserving legacy through handcrafted perfection',
      story: 'I have dedicated my life to the revival and protection of traditional handicrafts, passing these generations-old practices to upcoming youth groups.',
      location: {
        state: 'Odisha'
      },
      craftCategories: ['Painting & Art'],
      yearsOfExperience: 25,
      kyc: {
        status: 'verified'
      },
      isVerified: true,
      isFeatured: true
    });

    console.log('Inserting artisans...');
    const createdUsers = [artisanUser];
    for (const artisanData of artisansData) {
      const user = await User.create({
        name: artisanData.name,
        email: artisanData.email,
        password: artisanData.password,
        role: artisanData.role,
        phone: artisanData.phone,
        avatar: artisanData.avatar,
        isEmailVerified: true,
      });
      createdUsers.push(user);

      await ArtisanProfile.create({
        user: user._id,
        shopName: artisanData.shopName,
        tagline: artisanData.tagline,
        story: artisanData.story,
        location: {
          state: artisanData.state,
        },
        craftCategories: artisanData.craftCategories,
        yearsOfExperience: artisanData.yearsOfExperience,
        kyc: {
          status: 'verified',
        },
        isVerified: true,
        isFeatured: true,
      });
    }

    console.log('Inserting products...');
    const productsToInsert = productTemplates.map((product) => {
      // Pick a random artisan for each product
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      return {
        ...product,
        artisan: randomUser._id,
      };
    });

    await Product.insertMany(productsToInsert);

    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error}`);
    process.exit(1);
  }
};

importData();
