 DROP TABLE IF EXISTS userInfo;

 CREATE TABLE userInfo (
     id SERIAL PRIMARY KEY,
     firstName VARCHAR NOT NULL CHECK (firstName != ''),
     lastName VARCHAR NOT NULL CHECK (lastName != ''),
     signature VARCHAR NOT NULL CHECK (signature != '')
 );