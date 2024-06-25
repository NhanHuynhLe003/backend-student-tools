const amqp = require("amqplib");
const connectToRabbitMQ = async () => {
  try {
    const connectStr = process.env.connnectStrRabbitMQ;
    console.log(connectStr);
    const connection = await amqp.connect(connectStr);
    if (!connection) {
      console.log("Cannot connect to RabbitMQ");
      return;
    }

    const channel = await connection.createChannel();
    if (!channel) {
      console.log("Cannot create channel");
      return;
    }

    return { channel, connection };
  } catch (error) {
    console.error("[Something happend when connect to RabbitMQ:::]", error);
    throw new Error(error);
  }
};

const testConnectRabbitMQ = async () => {
  try {
    const { channel, connection } = await connectToRabbitMQ();
    const queue = "test-queue";
    const message = "Hello RabbitMQ";

    // assertQueue dùng để tạo queue nếu chưa tồn tại, có rồi thì sử dụng thôi
    await channel.assertQueue(queue);

    // Gửi message vào queue(hàng đợi để consumer lấy ra xử lý)
    await channel.sendToQueue(queue, Buffer.from(message));

    //close
    await connection.close();
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

const consumerQueue = async (channel, queueName) => {
  try {
    await channel.assertQueue(queueName);
    console.log("Đang đợi message từ queue:::", queueName);

    await channel.consume(
      queueName,
      (msg) => {
        /**
         CASE: NEW_BOOK
         1. tìm các sinh viên đã đọc tối thiểu 1 quyển sách
         2. kiểm tra những sinh viên có online không thông qua socket.io
         3. nếu online thì dùng socket.io để gửi thông báo trực tiếp sau đó hiện popup thông báo
         4. nếu user không online ta cũng có thể gửi email thông báo(sau khi hoàn tất reset password sẽ làm sau)
         */
        console.log("[Received message:::]", msg.content.toString());
      },
      {
        noAck: true,
      }
    );
  } catch (error) {
    console.error("Error when consumer queue:::", error);
  }
};

module.exports = {
  connectToRabbitMQ,
  testConnectRabbitMQ,
  consumerQueue,
};
