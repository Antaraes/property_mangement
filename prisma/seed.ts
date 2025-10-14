import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database migration and seeding...\n");

  // Step 1: Create default company
  console.log("📦 Creating default company...");
  let company = await prisma.company.findFirst();

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "Real Estate Solutions Inc.",
        description: "Leading property management company",
        email: "info@realestate.com",
        phone: "+1-234-567-8900",
      },
    });
    console.log("✅ Default company created:", company.name);
  } else {
    console.log("ℹ️  Company already exists:", company.name);
  }

  // Step 2: Create countries and areas
  console.log("\n🌍 Creating countries and areas...");

  const countries = [
    {
      name: "United Arab Emirates",
      code: "AE",
      areas: ["Dubai Marina", "Downtown Dubai", "Palm Jumeirah"],
    },
    {
      name: "Thailand",
      code: "TH",
      areas: ["Sukhumvit", "Silom", "Sathorn"],
    },
    {
      name: "United States",
      code: "US",
      areas: ["Manhattan", "Brooklyn", "Queens"],
    },
  ];

  for (const countryData of countries) {
    let country = await prisma.country.findUnique({
      where: { name: countryData.name },
    });

    if (!country) {
      country = await prisma.country.create({
        data: {
          name: countryData.name,
          code: countryData.code,
          companyId: company.id,
        },
      });
      console.log(`✅ Created country: ${country.name}`);
    } else {
      console.log(`ℹ️  Country exists: ${country.name}`);
    }

    // Create areas for this country
    for (const areaName of countryData.areas) {
      const existingArea = await prisma.area.findFirst({
        where: { name: areaName, countryId: country.id },
      });

      if (!existingArea) {
        await prisma.area.create({
          data: {
            name: areaName,
            countryId: country.id,
          },
        });
        console.log(`  ✅ Created area: ${areaName}`);
      }
    }
  }

  // Step 3: Migrate existing users and create admin if needed
  console.log("\n👥 Setting up users...");

  const adminEmail = "admin@example.com";
  const adminPassword = "Admin@123";

  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.user.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "SUPERADMIN",
        companyId: company.id,
      },
    });
    console.log("✅ Admin user created!");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  } else {
    console.log("ℹ️  Admin user already exists");
    // Update admin's company if not set
    if (!admin.companyId) {
      await prisma.user.update({
        where: { id: admin.id },
        data: { companyId: company.id },
      });
      console.log("✅ Updated admin's company assignment");
    }
  }

  // Step 4: Create sample employees
  console.log("\n👔 Creating sample employees...");

  const employees = [
    {
      name: "John Smith",
      email: "john@realestate.com",
      first_name: "John",
      last_name: "Smith",
      phone: "+1-234-567-8901",
    },
    {
      name: "Sarah Johnson",
      email: "sarah@realestate.com",
      first_name: "Sarah",
      last_name: "Johnson",
      phone: "+1-234-567-8902",
    },
  ];

  for (const empData of employees) {
    const existing = await prisma.user.findUnique({
      where: { email: empData.email },
    });

    if (!existing) {
      const hashedPassword = await bcrypt.hash("Employee@123", 10);
      const employee = await prisma.user.create({
        data: {
          ...empData,
          password: hashedPassword,
          role: "EMPLOYEE",
          companyId: company.id,
        },
      });
      console.log(`✅ Created employee: ${employee.name}`);

      // Assign employee to an area
      const dubaiMarina = await prisma.area.findFirst({
        where: { name: "Dubai Marina" },
      });

      if (dubaiMarina) {
        await prisma.employeeArea.create({
          data: {
            employeeId: employee.id,
            areaId: dubaiMarina.id,
            canManage: true,
          },
        });
        console.log(`   ✅ Assigned to Dubai Marina area`);
      }
    }
  }

  // Step 5: Create sample properties if none exist
  console.log("\n🏠 Creating sample properties...");

  const propertyCount = await prisma.property.count();

  if (propertyCount === 0) {
    const dubaiMarina = await prisma.area.findFirst({
      where: { name: "Dubai Marina" },
    });

    const employee = await prisma.user.findFirst({
      where: { role: "EMPLOYEE" },
    });

    const sampleProperties = [
      {
        name: "Luxury Marina Apartment",
        location: "Dubai Marina, UAE",
        description: "Stunning 2-bedroom apartment with marina views",
        price: 150000,
        bedrooms: 2,
        bathrooms: 2,
        area: 1200,
        purpose: "RENT",
        paidType: "YEARLY",
        propertyType: "APARTMENT",
        images: ["https://example.com/image1.jpg"],
      },
      {
        name: "Modern Downtown Villa",
        location: "Downtown Dubai, UAE",
        description: "Beautiful 4-bedroom villa with pool",
        price: 2500000,
        bedrooms: 4,
        bathrooms: 3,
        area: 3500,
        purpose: "BUY",
        paidType: "ONCE",
        propertyType: "VILLA",
        images: ["https://example.com/image2.jpg"],
      },
    ];

    for (const propData of sampleProperties) {
      await prisma.property.create({
        data: {
          name: propData.name,
          location: propData.location,
          description: propData.description,
          price: propData.price,
          bedrooms: propData.bedrooms,
          bathrooms: propData.bathrooms,
          area: propData.area,
          purpose: propData.purpose as "RENT" | "BUY",
          paidType: propData.paidType as "YEARLY" | "MONTHLY" | "WEEKLY" | "DAILY" | "ONCE",
          propertyType: propData.propertyType as "APARTMENT" | "HOUSE" | "VILLA" | "COMMERCIAL" | "LAND" | "OFFICE",
          images: propData.images,
          companyId: company.id,
          areaId: dubaiMarina?.id,
          assignedToId: employee?.id,
          status: "AVAILABLE",
        },
      });
      console.log(`✅ Created property: ${propData.name}`);
    }
  } else {
    console.log(`ℹ️  ${propertyCount} properties already exist`);
  }

  // Step 6: Create sample customer
  console.log("\n👤 Creating sample customer...");

  const customerEmail = "customer@example.com";
  let customer = await prisma.user.findUnique({
    where: { email: customerEmail },
  });

  if (!customer) {
    const hashedPassword = await bcrypt.hash("Customer@123", 10);
    customer = await prisma.user.create({
      data: {
        name: "John Doe",
        email: customerEmail,
        password: hashedPassword,
        role: "CUSTOMER",
        first_name: "John",
        last_name: "Doe",
        phone: "+1-234-567-8999",
      },
    });
    console.log("✅ Sample customer created");
    console.log(`   Email: ${customerEmail}`);
    console.log(`   Password: Customer@123`);
  }

  console.log("\n✅ Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   Companies: ${await prisma.company.count()}`);
  console.log(`   Countries: ${await prisma.country.count()}`);
  console.log(`   Areas: ${await prisma.area.count()}`);
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   Properties: ${await prisma.property.count()}`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
