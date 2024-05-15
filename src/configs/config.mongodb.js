require("dotenv").config();

const dev = {
  app: {
    port: process.env.DEV_APP_PORT || 3024,
  },
  db: {
    host: process.env.DEV_DB_HOST || "localhost",
    name: process.env.DEV_DB_NAME || "toolWebAppDEV",
    port: process.env.DEV_DB_PORT || 27017, //port mặc định của mongodb
  },
};

const prod = {
  app: {
    port: process.env.PROD_APP_PORT || 3010,
  },
  db: {
    host: process.env.PROD_DB_HOST || "localhost",
    name: process.env.PROD_DB_NAME || "toolWebAppPRO",
    port: process.env.PROD_DB_PORT || 27017,
  },
};

const config = { dev, prod };
const env = process.env.NODE_ENV || "dev"; //mac định thì config không thiết lập môi trường sẽ lấy theo dev
module.exports = config[env];
