const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'humanaprotot', 
    database: 'humana',    
});

module.exports = pool;