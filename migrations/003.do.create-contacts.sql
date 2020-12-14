CREATE TABLE contacts(
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    userID INTEGER NOT NULL,
    contactUserId INTEGER NOT NULL,
    FOREIGN KEY(userID) REFERENCES users(id),
    FOREIGN KEY(email) REFERENCES users(email)
);