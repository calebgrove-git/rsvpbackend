function makeEvent() {
  return {
    id: 1,
    name: 'test',
    date: '01-01-1111',
    time: '11:11:11',
    description: 'test',
    creator: 1,
    creatorEmail: 'test@test',
    invited: [1, 2, 3],
    accepted: [1, 2],
    declined: [3],
  };
}

module.exports = { makeEvent };
