const { ObjectId } = require('mongodb')
const { Schema, default: mongoose } = require('mongoose')

const MovieSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        isrelease: {
            type: Boolean,
            default: true
        },
        releaseDate: {
            type: Number,
            required: true
        },
        genre: {
            type: Array,
            required: true
        },
        director: {
            type: Array,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        createdBy: {
            type: ObjectId,
            ref: 'admin'
        },
        banner: {
            type: String,
            required: true
        },
        bannerAltText: {
            type: String,
            required: true
        },
        poster: {
            type: String,
            required: true
        },
        posterAltText: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: Number
        },
        discount: {
            type: Number,
            default: 0
        },
        finalprice: {
            type: Number,
            required: Number
        },
        folder: String,
        status: {
            type: Boolean,
            default: false
        },
        created: Number,
        updated: Number
    }, {
    collation: {
        locale: 'en',
        strength: 2
    },
    versionKey: false,
    timestamps: { currentTime: () => Date.now(), createdAt: 'created', updatedAt: 'updated' }
})


const Movie = mongoose.model('movie', MovieSchema)
module.exports = {
    Movie
}