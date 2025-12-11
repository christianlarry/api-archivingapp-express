import { app } from "@/app";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { connectToDatabase, setupMongooseCloseOnExit } from "./config/mongoose";

connectToDatabase()
setupMongooseCloseOnExit()

const PORT:number = env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 Server is running on htEtp://localhost:${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
})