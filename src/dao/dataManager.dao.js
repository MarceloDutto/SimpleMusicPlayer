const Datastore = require('nedb'), database = new Datastore({filename: './src/dao/database/data.db', autoload: true});

class dataManager {

    getAll = async () => {
        try {
            const docs = await new Promise((resolve, reject) => {
                database.find({}, function (err, docs) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(docs);
                    }
                });
            });
            return docs;
        } catch (error) {
            throw error;
        }
    };

    getById = async (id) => {
        try {
            const doc = await new Promise((resolve, reject) => {
                database.findOne({_id: id}, function (err, doc) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(doc);
                    }
                });
            });
            return doc;
        } catch (error) {
            throw error;
        }
    };

    create = async (newDocs) => {
        try {
            const newDoc = await new Promise((resolve, reject) => {
                database.insert(newDocs, function (err, newData) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(newData);
                    }
                });
            });
            return newDoc;
        } catch (error) {
            throw error;
        }
    };

    delete = async (id) => {
        try {
            const deletedDoc = await new Promise((resolve, reject) => {
                database.remove({_id: id}, function (err, delDoc) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(delDoc);
                    }
                });
            });
            return deletedDoc;
        } catch (error) {
            throw error;
        }
    };

    deletAll = async () => {
        try {
            const deleted = await new Promise((resolve, reject) => {
                database.remove({}, {multi: true}, function (err, del) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(del);
                    }
                });
            });
            return deleted;
        } catch (error) {
            throw error;
        }
    };
};

module.exports = dataManager;