const UsersService = {
  getAllUsers(knex) {
    return knex.select('*').from('users');
  },

  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into('users')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },
  getByEmail(knex, email) {
    return knex.from('users').select('*').where({ email }).first();
  },
  getByID(knex, idArr) {
    let some = Promise.all(
      idArr.map((id) => {
        return knex.select('email', 'id').from('users').where({ id });
      })
    );
    return some;
  },
};

module.exports = UsersService;
