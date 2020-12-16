CREATE TABLE events(
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    time time NOT NULL,
    description TEXT, 
    creator int,
    creatorEmail VARCHAR(255) NOT NULL,
    invited int[],
    accepted int[],
    declined int[]
);