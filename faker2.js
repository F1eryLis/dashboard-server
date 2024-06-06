const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

function main() {
  try {
    const user =  prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: faker.internet.password(),
        username: faker.internet.userName(),
        phone: faker.phone.number(),
      },
    });
    user.then(
        (e) => console.log(e)
    );
    console.log('User created:', user);
  } catch (e) {
    console.error('Error creating user:', e);
  } finally {
     prisma.$disconnect();
  }
}

main()
