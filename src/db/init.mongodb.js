"use strict";

const mongoose = require("mongoose");

const {
  db: { host, name, port },
} = require("../configs/config.mongodb");
const connectStr = `mongodb://${host}:${port}/${name}`;

//Áp dụng singleton pattern để khởi tạo kết nối, tránh việc kết nối tạo ra nhiều làm tốn tài nguyên
//vì có 1 số cloud giới hạn số lượng kết nối

class Database {
  constructor() {
    this.connect(); //goi ham connnect cua mongoose
  }

  connect(type = "mongodb") {
    // gán mặc định cho type database hiên tại là mongodb, nếu như sau này có csdl khác thì thêm vào.
    if (process.env.ENV === "DEV") {
      //dung cho env dev
      console.log("Dev Environment!");
      // hiển thị các log và debug của mongodb
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose
      .connect(connectStr)
      .then(() => console.log("MongoDb connect successfully!"))
      .then(() =>
        console.log("Tool Web Student connected with mongo port: ", connectStr)
      )
      .catch((err) => console.log(err));
  }
  static getInstance() {
    if (!Database.instance) {
      //neu database chua co instance thi khoi tao, do vay no chi connect 1 lan duy nhat
      Database.instance = new Database();
    }
    //neu database co instance thi return
    return Database.instance;
  }
}

const instanceMongoDb = Database.getInstance();
module.exports = instanceMongoDb;
