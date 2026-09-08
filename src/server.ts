import app from "./app";
import config from "./app/config";
import { prisma } from "./app/lib/prisma";
import cron from "node-cron";
import expireAttempts from "./app/module/invitation/invitation.service";

const main = async () => {
  const PORT = config.port;

  cron.schedule("* * * * *", async () => {
    await expireAttempts();
  });
  try {
    await prisma.$connect();
    console.log("Prisma is connected to the database successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    await prisma.$disconnect();
    process.exit(1);
  }
};
main();
