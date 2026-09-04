import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../generated/prisma/client"


const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
async function main() {
    await prisma.$connect();
    console.log("Connected to the database");
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});

