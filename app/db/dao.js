const sqlite3 = require('sqlite3');
const Promise = require('bluebird');

class AppDAO {
  constructor (dbFile) {
    const dbFilePath = __dirname + '/' + dbFile;
    this.db = new sqlite3.Database(dbFilePath, (err) => {
      if (err) {
        console.log('Could not connect to database', err);
        console.log('DB path: ', dbFilePath, __dirname)
      } else {
        this.db.run(`CREATE TABLE IF NOT EXISTS shoplist (id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT)`);
        console.log('Connected to database');
      }
    });
  }

  run (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.log('Error running sql ' + sql);
          console.log(err);
          reject(err);
        } else {
          resolve({id: this.lastID});
        }
      });
    });
  }

  all (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, function (err, results) {
        if (err) {
          console.log('Error querying sql ' + sql);
          console.log(err);
          reject(err);
        } else {
          resolve(results);
        }
      });

    });
  }

}

module.exports = AppDAO;