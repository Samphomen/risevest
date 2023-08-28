const createTokenUser = (user) => {
  return { name: user.full_name, userId: user.id, role: user.user_role };
};

module.exports = createTokenUser;
