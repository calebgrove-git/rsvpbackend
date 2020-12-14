const path = require('path');
const express = require('express');
const xss = require('xss');
const ContactsService = require('./contacts-service');
const contactsRouter = express.Router();
const jsonParser = express.json();

const serializeContact = (contact) => ({
  id: contact.id,
  name: xss(contact.name),
  email: xss(contact.email),
  userid: contact.userid,
  contactuserid: contact.contactuserid,
});
contactsRouter.route('/').post(jsonParser, (req, res, next) => {
  const { id, name, email, userid } = req.body;
  let newContact = {
    name,
    email,
    userid,
  };
  for (const [key, value] of Object.entries(newContact)) {
    if (value == null) {
      return res.status(400).json({
        error: { message: `Missing '${key}' in request body` },
      });
    }
  }
  let userwithid;
  ContactsService.getContactUserID(req.app.get('db'), newContact.email)
    .then((contactuserid) => {
      return (userwithid = {
        ...newContact,
        contactuserid: contactuserid[0].id,
      });
    })
    .then((user) => ContactsService.insertContact(req.app.get('db'), user))
    .then((contact) => {
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${contact.email}`))
        .json(serializeContact(contact));
    })
    .catch(next);
});
contactsRouter.route('/get/:user').get((req, res, next) => {
  ContactsService.getAllContacts(req.app.get('db'), req.params.user)
    .then((contacts) => {
      res.json(contacts.map((contact) => serializeContact(contact)));
    })
    .catch(next);
});

module.exports = contactsRouter;
