// // /** biome-ignore-all lint/correctness/noUnusedVariables: <explanation> */
// // import app from "./app.ts";
// // import config from "./app/config";
// // import { prisma } from "./app/lib/prisma";
// // import cron from "node-cron";
// // import expireAttempts from "./app/module/invitation/invitation.service";

// // const main = async () => {
// //   const PORT = config.port;

// //   cron.schedule("* * * * *", async () => {
// //     await expireAttempts();
// //   });
// //   try {
// //     await prisma.$connect();
// //     console.log("Prisma is connected to the database successfully");
// //     app.listen(PORT, () => {
// //       console.log(`Server is running on port ${PORT}`);
// //     });
// //   } catch (error) {
// //     await prisma.$disconnect();
// //     process.exit(1);
// //   }
// // };
// // main();
// import app from "./app.ts";
// import config from "./app/config";
// import { prisma } from "./app/lib/prisma";

// const main = async () => {
//   const PORT = config.port;

//   try {
//     await prisma.$connect();

//     console.log("Prisma is connected to the database successfully");

//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("Failed to connect to database:", error);

//     await prisma.$disconnect();

//     process.exit(1);
//   }
// };

// main();
import app from "./app.ts";
import config from "./app/config";
import { prisma } from "./app/lib/prisma";

const PORT = config.port || 5000;

// Vercel Serverless-এর জন্য Express App এক্সপোর্ট করতে হবে
export default app;

// শুধুমাত্র Local Environment-এ পোর্ট চালু হবে
if (process.env.NODE_ENV !== "production") {
  prisma
    .$connect()
    .then(() => {
      console.log("Prisma is connected to the database successfully");
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch(async (error) => {
      console.error("Failed to connect to database:", error);
      await prisma.$disconnect();
      process.exit(1);
    });
}