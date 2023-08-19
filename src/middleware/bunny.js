const axios = require('axios')

const bunnyStorage = process.env.BUNNY_STORAGENAME
const bunnykey = process.env.BUNNY_STORAGEKEY


const uploadPoster = (folder, file) => {
    axios({
        method: 'PUT',
        url: 'https://storage.bunnycdn.com/' + bunnyStorage + folder + '/poster.webp',
        headers: {
            AccessKey: bunnykey
        },
        data: file
    }).catch(err => {
    })
}


const uploadBanner = (folder, file) => {
    axios({
        method: 'PUT',
        url: 'https://storage.bunnycdn.com/' + bunnyStorage + folder + '/banner.webp',
        headers: {
            AccessKey: bunnykey
        },
        data: file
    }).catch(err => {
    })
}

module.exports = {
    uploadPoster, uploadBanner
}