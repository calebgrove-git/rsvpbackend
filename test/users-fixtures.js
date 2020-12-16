function makeUser() {
  return {
    id: 1,
    email: 'test@test',
    password: 'test',
  };
}

function makeUser2() {
  return {
    id: 2,
    email: 'test2@test',
    password: 'test2',
  };
}
module.exports = { makeUser, makeUser2 };
