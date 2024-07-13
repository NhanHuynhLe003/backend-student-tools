const ShopModel = require("../student.model");
const findStudentByEmailRepo = async ({
  email,
  //Select các field để trả về cho phía client
  select = {
    email: 1,
    password: 2,
    name: 1,
    classStudent: 1,
    roles: 1,
    status: 1,
    student_id: 1,
  },
}) => {
  try {
    const shop = await ShopModel.findOne({ email: email })
      .select(select)
      .lean();
    return shop;
  } catch (err) {
    return null;
  }
};

module.exports = { findStudentByEmailRepo };
