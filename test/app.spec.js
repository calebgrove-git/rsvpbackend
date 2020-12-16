const knex = require('knex');
const contactsFixtures = require('./contacts-fixtures');
const eventsFixtures = require('./events-fixtures');
const usersFixtures = require('./users-fixtures');
const { DATABASE_URL } = require('../src/config');
const app = require('../src/app');
const supertest = require('supertest');
const { request } = require('../src/app');
describe('app', () => {
  describe('User Endpoints', () => {
    let db;

    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: DATABASE_URL,
      });
      app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('cleanup', () => db('users').truncate());

    afterEach('cleanup', () => db('users').truncate());

    describe('POST /users/create', () => {
      const user = usersFixtures.makeUser();
      context(`Given a user`, () => {
        it(`responds with 201`, () => {
          return supertest(app)
            .post('/api/users/create')
            .send(user)
            .expect(201);
        });
      });
    });
    describe('POST /users/login', () => {
      const user = usersFixtures.makeUser();
      context(`Given a login`, () => {
        it(`responds with 200`, () => {
          supertest(app)
            .post('/api/users/create')
            .send(user)
            .end(function () {
              return supertest(app)
                .post('/api/users/login')
                .send(user)
                .expect(200);
            });
        });
      });
    });
    describe('POST /users/refresh', () => {
      const user = usersFixtures.makeUser();
      context(`Given a token`, () => {
        it(`responds with 200`, () => {
          supertest(app)
            .post('/api/users/create')
            .send(user)
            .end(function () {
              supertest(app)
                .post('/api/users/login')
                .send(user)
                .end((err, res) => {
                  return supertest(app)
                    .post('/api/users/refresh')
                    .send(res.body)
                    .expect(200);
                });
            });
        });
      });
    });
    describe('POST /users/emails', () => {
      const user = usersFixtures.makeUser();
      context(`Given ids`, () => {
        it(`responds with 200`, () => {
          supertest(app)
            .post('/api/users/create')
            .send(user)
            .end(function () {
              return supertest(app)
                .post('/api/users/emails')
                .send(1)
                .expect(200);
            });
        });
      });
    });
  });

  describe('Events Endpoints', () => {
    let db;

    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: DATABASE_URL,
      });
      app.set('db', db);
    });
    after('disconnect from db', () => db.destroy());

    before('cleanup', () => db('events').truncate());

    afterEach('cleanup', () => db('events').truncate());

    describe('Post /events/', () => {
      const event = eventsFixtures.makeEvent();
      const user = usersFixtures.makeUser();
      context(`Given an event`, () => {
        it(`responds with 200`, () => {
          return supertest(app)
            .post('/api/users/create')
            .send(user)
            .then(function () {
              supertest(app)
                .post('/api/users/login')
                .send(user)
                .then((err, res) => {
                  return supertest(app)
                    .post('/api/events/')
                    .send(event)
                    .expect(200);
                });
            });
        });
      });
      describe('Delete /events/:id', () => {
        const event = eventsFixtures.makeEvent();
        const user = usersFixtures.makeUser();
        context(`Given an event id`, () => {
          it(`responds with 204`, () => {
            return supertest(app)
              .post('/api/users/create')
              .send(user)
              .then(function () {
                supertest(app)
                  .post('/api/users/login')
                  .send(user)
                  .then((err, res) => {
                    supertest(app)
                      .post('/api/events/')
                      .set('Authorization', res.body.authToken)
                      .send(event)
                      .then((err, res) => {
                        return supertest(app)
                          .delete(`/api/events/${event.id}`)
                          .expect(204);
                      });
                  });
              });
          });
        });
      });
      describe('Patch /events/:id', () => {
        const event = eventsFixtures.makeEvent();
        const user = usersFixtures.makeUser();
        context(`Given an event id`, () => {
          it(`responds with 204`, () => {
            return supertest(app)
              .post('/api/users/create')
              .send(user)
              .then(function () {
                supertest(app)
                  .post('/api/users/login')
                  .send(user)
                  .then((err, res) => {
                    supertest(app)
                      .post('/api/events/')
                      .set('Authorization', res.body.authToken)
                      .send(event)
                      .then((err, res) => {
                        return supertest(app)
                          .patch(`/api/events/${event.id}`)
                          .send(event)
                          .expect(204);
                      });
                  });
              });
          });
        });
      });
    });
  });
  describe('Contacts Endpoints', () => {
    let db;

    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: DATABASE_URL,
      });
      app.set('db', db);
    });
    after('disconnect from db', () => db.destroy());

    before('cleanup', () => db('contacts').truncate());

    afterEach('cleanup', () => db('contacts').truncate());

    describe('Post /contacts/', () => {
      const contact = contactsFixtures.makeContact();
      const user = usersFixtures.makeUser();
      context(`Given a contact`, () => {
        it(`responds with 201`, () => {
          return supertest(app)
            .post('/api/users/create')
            .send(user)
            .then(function () {
              supertest(app)
                .post('/api/users/login')
                .send(user)
                .then((err, res) => {
                  return supertest(app)
                    .post('/api/contacts/')
                    .send(contact)
                    .expect(201);
                });
            });
        });
      });
    });
    describe('get /contacts/:user', () => {
      const user = usersFixtures.makeUser();
      context(`Given a user`, () => {
        it(`responds with 200`, () => {
          return supertest(app)
            .post('/api/users/create')
            .send(user)
            .then(function () {
              supertest(app)
                .post('/api/users/login')
                .send(user)
                .then((err, res) => {
                  return supertest(app)
                    .post('/api/contacts/')
                    .send(user.id)
                    .expect(200);
                });
            });
        });
      });
    });
  });
});
