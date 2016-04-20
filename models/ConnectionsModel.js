var ConnectionsModel = function (db) {
  this._db = db;
};

ConnectionsModel.prototype.context = function (cb) {
  this._db.context(cb);
};

ConnectionsModel.prototype.get = function (connectionid, cb) {
  this._db.getConnection(connectionid);
};

ConnectionsModel.prototype.getPage = function (page, onlyWheelchairAccessibleTrips, cb) {
  this._db.getConnectionsPage(page, onlyWheelchairAccessibleTrips, cb);
};

ConnectionsModel.prototype.create = function (connection, cb) {
  this._db.add(connection);
};

module.exports = ConnectionsModel;
