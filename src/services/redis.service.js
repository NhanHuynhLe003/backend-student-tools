const redis = require("redis");
const { promisify } = require("util"); //promisify dùng chuyển đổi 1 hàm thành 1 hàm bất đồng bộ
const { updateBookById } = require("../models/repos/book");
const { isObjectEmpty } = require("../utils");
const { bookModel } = require("../models/book.model");

// Khởi tạo kết nối với redis
const redisClient = redis.createClient();

redisClient.ping((err, result) => {
  if (err) {
    console.error("Failed to connect redis: ", err);
  } else {
    console.log("Connected to redis");
  }
});

/**
 Khác nhau giữa việc sử dụng callback mặc định và promisify trong redis:
  1. Sử dụng callback mặc định:
    redisClient.PEXPIRE('myKey', 1000, (err, result) => {
      if (err) {console.error('Có lỗi xảy ra:', err)} 
      else {console.log('Thời gian hết hạn đã được đặt thành công:', result)}
    });
  2. Không sử dụng promisify:
  pexpireAsync('myKey', 1000)
    .then(result => { console.log('Thời gian hết hạn đã được đặt thành công:', result)})
    .catch(err => {console.error('Có lỗi xảy ra:', err)});
 */

const pexpire = promisify(redisClient.pexpire).bind(redisClient); // set expire time cho key
const setnxAsync = promisify(redisClient.setnx).bind(redisClient); // set key nếu chưa tồn tại

/**
 *
 * @description aquireLock khi người dùng order(gọi là user1) thì tiến hành giữ lại key, trong lúc đó nếu có
 * ng khác vào order(gọi là user2) thì tiến hành thử lại retryTimes (10) lần để xem lúc này key
 * đã được người kia sử dụng xong chưa, nếu xong rồi thì có quyền cầm key đó đi order sách.
 *
 * @param {string} bookId
 * @param {number} quantity
 * @param {string} cartId
 * @returns
 */
const acquireLock = async (bookId, quantity, cartId) => {
  const key = `lock_order_${bookId}`;

  redisClient.keys("*", function(err, keys) {
    if (err) {
      console.error("Error fetching keys:", err);
    } else {
      console.log("Checkey Init::::", keys);
    }
  });

  /**
   quy tắc key: khi người dùng đặt hàng thì key sẽ được cung cấp cho user, sau khi đã order và trừ
   tồn kho thì key sẽ được đưa cho người kế tiếp mua hàng tránh trường hợp người này đg order
   người khác chen vào làm đổi số lượng sp gây lỗi hệ thống
   */
  const retryTimes = 10; //khi user hien tai chua lay dc key thi cho phep chờ 10 lần.
  const expireTimes = 3000; // sau 3s thì sẽ tạm lock

  for (let i = 0; i < retryTimes; i++) {
    const result = await setnxAsync(key, expireTimes); // khởi tạo key với expire time

    if (result === 1) {
      // lấy key thành công, update giảm số lượng sách trong kho
      const bookInStock = await bookModel.findOne({ _id: bookId });
      const bookReservation = await updateBookById({
        id: bookId,
        payload: { book_quantity: bookInStock.book_quantity - quantity },
      });
      // console.log("Book Đã Đặt :::", bookReservation);
      if (!isObjectEmpty(bookReservation)) {
        //sau khi đặt sách thành công thì set expire time cho key, để người tiếp theo còn sử dụng

        await pexpire(key, expireTimes); //giai phong key tam thoi trong 3s

        return key;
      }

      // nếu sản phẩm có sự thay đổi như là quantity sp trong kho < giỏ hàng hay sp đã bị shop xóa thì về null để người dùng order lại
      return null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50)); //lấy key thất bại delay 50ms rồi thử lại
    }
  }
};

const deleteAllKeyLock = async () => {
  const delAllKeyFnc = promisify(redisClient.flushall).bind(redisClient);
  return await delAllKeyFnc();
};

const releaseLock = async (keyLock) => {
  //giai phong key
  const delAsyncKey = promisify(redisClient.del).bind(redisClient);
  return await delAsyncKey(keyLock);
};

module.exports = {
  acquireLock,
  releaseLock,
  deleteAllKeyLock,
};
