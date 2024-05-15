const ShopModel = require("../student.model");
const findStudentByEmailRepo = async ({
  email,
  select = {
    email: 1,
    password: 2,
    name: 1,
    roles: 1,
    status: 1,
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
