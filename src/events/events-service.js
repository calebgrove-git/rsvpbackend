const EventsService = {
  getAllCreatedEvents(knex, id) {
    let created = knex.select('*').from('events').where('creator', id);
    return created;
  },
  getAllInvitedEvents(knex, id) {
    let invited = knex.raw('select * from events where ? = ANY(invited) ', [
      id,
    ]);
    return invited;
  },

  insertEvent(knex, newEvent) {
    return knex
      .insert(newEvent)
      .into('events')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex.from('events').select('*').where({ id }).first();
  },

  deleteEvent(knex, id) {
    return knex('events').where({ id }).delete();
  },

  updateEvent(knex, id, newInfo) {
    return knex('events').where({ id }).update(newInfo);
  },
};

module.exports = EventsService;
