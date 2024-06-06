const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Generate fake data for Users, Roles, Permissions
  const roles = ['Employee', 'Client'];
  const roleIds = [];

  for (const roleName of roles) {
    const role = await prisma.role.create({
      data: {
        name: roleName,
      },
    });
    roleIds.push(role.id);
  }

  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: bcrypt.hashSync(faker.internet.password(), 8),
        username: faker.internet.userName(),
        phone: faker.phone.number(),
        role: {
          create: roleIds.map((roleId) => ({
            roleId,
          })),
        },
      },
    });
    users.push(user);
  }

  const orders = [];
  for (let i = 0; i < 5; i++) {
    const order = await prisma.order.create({
      data: {
        clientId: users[i % users.length].id,
        details: faker.lorem.sentence(),
      },
    });
    orders.push(order);
  }

  // Generate 10 fake agencies with related data
  for (let i = 0; i < 10; i++) {
    const agencyName = faker.company.name();
    const domain = faker.internet.domainName();
    const userId = users[i % users.length].id;

    const agency = await prisma.agency.create({
      data: {
        agencyName,
        domain,
        owner: {
          create: {
            userId,
          },
        },
        subscription: {
          create: Array.from({ length: 3 }).map(() => ({
            dateFrom: faker.date.past(),
            dateTo: faker.date.future(),
            domain: faker.internet.domainName(),
          })),
        },
        // employee: {
        //   create: Array.from({ length: 5 }).map(() => ({
        //     userId: users[i % users.length].id,
        //   })),
        // },
        // client: {
        //   create: Array.from({ length: 5 }).map(() => ({
        //     userId: users[i % users.length].id,
        //   })),
        // },
        // order: {
        //   create: Array.from({ length: 5 }).map(() => ({
        //     orderId: orders[i % orders.length].id,
        //   })),
        // },
      },
    });
  }

  console.log('Faker data for all models generated successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
