const path = require('path');
const express = require('express');
const xss = require('xss');
const EventsService = require('./events-service');
const eventsRouter = express.Router();
const jsonParser = express.json();

const serializeEvent = (event) => ({
  id: event.id,
  name: xss(event.name),
  date: event.date,
  time: event.time,
  description: xss(event.description),
  creator: event.creator,
  creatoremail: xss(event.creatorEmail),
  invited: event.invited,
  accepted: event.accepted,
  declined: event.declined,
});

eventsRouter.route('/').post(jsonParser, (req, res, next) => {
  const {
    name,
    date,
    time,
    description,
    creator,
    creatoremail,
    invited,
    accepted,
    declined,
  } = req.body;
  const newEvent = {
    name,
    date,
    time,
    description,
    creatoremail,
    creator,
    invited,
    accepted,
    declined,
  };
  for (const [key, value] of Object.entries(newEvent)) {
    if (value == null) {
      return res.status(400).json({
        error: { message: `Missing '${key}' in request body` },
      });
    }
  }

  EventsService.insertEvent(req.app.get('db'), newEvent)
    .then((event) => {
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${event.id}`))
        .json(serializeEvent(event));
    })
    .catch(next);
});

eventsRouter
  .route('/:id')
  .all((req, res, next) => {
    EventsService.getById(req.app.get('db'), req.params.id)
      .then((event) => {
        if (!event) {
          return res.status(404).json({
            error: { message: `Event doesn't exist` },
          });
        }
        res.event = event;
        next();
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    EventsService.deleteEvent(req.app.get('db'), req.params.id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const {
      id,
      name,
      date,
      time,
      description,
      creator,
      creatoremail,
      invited,
      accepted,
      declined,
    } = req.body;
    const eventToUpdate = {
      id,
      name,
      date,
      time,
      description,
      creatoremail,
      creator,
      invited,
      accepted,
      declined,
    };
    for (const [key, value] of Object.entries(eventToUpdate)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }
    console.log(eventToUpdate);
    EventsService.updateEvent(req.app.get('db'), req.params.id, eventToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });
eventsRouter.route('/get/:user').get((req, res, next) => {
  let createdEvents;
  let invitedEvents;
  EventsService.getAllCreatedEvents(req.app.get('db'), req.params.user)
    .then((events) => {
      createdEvents = events;
    })
    .catch(next);
  EventsService.getAllInvitedEvents(req.app.get('db'), req.params.user)
    .then((events) => {
      invitedEvents = events.rows;
      res.json({ createdEvents, invitedEvents });
    })
    .catch(next);
});

module.exports = eventsRouter;
