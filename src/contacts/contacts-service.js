const ContactsService = {
  getAllContacts(knex, id) {
    return knex.select('*').from('contacts').where('userid', id);
  },
  getContactUserID(knex, email) {
    return knex.select('id').from('users').where('email', email);
  },
  insertContact(knex, newContact) {
    return knex
      .insert(newContact)
      .into('contacts')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = ContactsService;
