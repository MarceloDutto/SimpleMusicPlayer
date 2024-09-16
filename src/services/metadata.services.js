const mm = require('music-metadata');

const getMetadata = async (file) => {
    try {
        let coverPicture;

        const metadata = await mm.parseFile(file);
        const tags = metadata.common;
        const format = metadata.format;  

        const cover = mm.selectCover(tags.picture);
        if(cover) {
            const pictureBase64 = cover.data.toString('base64');
            const mimeType = cover.format;
    
            coverPicture = {
                pictureBase64,
                mimeType
            }

        } else {
            coverPicture = null
        };
    
        return { tags, format, coverPicture };

    } catch (error) {
        console.error('Error processing metadata: ', error);
    }
};

module.exports = { getMetadata };