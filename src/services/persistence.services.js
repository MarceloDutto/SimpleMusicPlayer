const fs = require('fs').promises;
const dataManager = require("../dao/dataManager.dao");
const { getMetadata } = require('./metadata.services');

const dm = new dataManager();

const loadDatabase = async () => {
    try {
        const data = await dm.getAll();
        return data;
    } catch (error) {
        throw error;
    }
};

const getTrackById = async (id) => {
    try {
        const track = await dm.getById(id);
        return track;
    } catch (error) {
        throw error;
    }
};

const createTracks = async (files) => {
    try {
        const result = [];

        for(const file of files) {
            const stats = await fs.stat(file);
            
            const fileMetadata = await getMetadata(file);
            const { tags, format, coverPicture } = fileMetadata;
            
            const newTrack = {
                filePath: file,
                duration: format.duration,
                coverPicture,
                trackName: tags.title,
                trackArtist: tags.artist ? tags.artist : tags.artists,
                trackAlbum: tags.album
            };

            const dataCreated = await dm.create(newTrack);
            result.push(dataCreated);
        }
        return result;
    } catch (error) {
        throw error;
    }
};

const deleteTrack = async (id) => {
    try {
        const trackDeleted = await dm.delete(id);
        console.log('Track deleted: ', trackDeleted);
    } catch (error) {
        throw error;
    }
};

const deleteAllTracks = async () => {
    try {
        const dataDeleted = await dm.deletAll();
        console.log('Database deleted: ', dataDeleted);
    } catch (error) {
        throw error;
    }
};

module.exports = { loadDatabase, getTrackById, createTracks, deleteTrack, deleteAllTracks };