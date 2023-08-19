const express = require('express')
const { APILOG, APIInfo } = require('../../middleware/logger')
const { adminAuth } = require('../../middleware/auth')
const { default: mongoose } = require('mongoose')
const multer = require('multer')
const { uploadBanner, uploadPoster } = require('../../middleware/bunny')
const { _movieupload, _invaliddata, _movieunique, _moviedetails, _movielist, _datanotfound, _movieupdate, _updatekeyvalidate, _moviedelet, _updatebannervalidate, _updatepostervalidate } = require('../../messages')
const { moviepost_, movieget_, moviepatch_, moviedelete_ } = require('../../endpoints')
const { AdminActivity } = require('../../middleware/activity')
const router = express.Router()

const bunny = multer({
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpeg|jpg)$/)) {
            return cb(new Error('file must be png,jpeg or jpg'))
        }
        cb(undefined, true)
    }
})

// movie create 
router.post(moviepost_, APILOG, adminAuth, bunny.fields([{ name: 'poster', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), async (req, res) => {
    let code = 400
    try {
        const { description, releaseDate, genre, director, duration, bannerAltText, posterAltText, type, status } = req.body
        const { _id, emailID } = req
        let { title, discount, price } = req.body
        let posterImage = req.files?.poster
        let bannerImage = req.files?.banner
        price = (price * 1)
        discount = (discount * 1)
        if (!title || !description || !releaseDate || genre?.length == 0 || director?.length == 0 || !duration || !bannerAltText || !posterAltText || !price || typeof price != 'number' || !type || !posterImage || !bannerImage || (discount && typeof discount != 'number')) { code = 400; throw new Error(_invaliddata) }
        title = title.toMovieTitle()
        slug = title.toSlug()
        const msg = _movieupload(title)
        APIInfo(msg, req.method)
        const checkDuplicate = await mongoose.model('movie').findOne({ slug: slug })
        if (checkDuplicate) { code = 400; throw new Error(_movieunique(title)) }
        let finalprice = price
        if (discount > 0) finalprice = price - discount
        const folder = slug
        posterImage = posterImage[0]?.buffer
        bannerImage = bannerImage[0]?.buffer
        uploadPoster(folder, posterImage.buffer)
        uploadBanner(folder, bannerImage.buffer)
        posterImage = '/' + folder + '/poster.webp'
        bannerImage = '/' + folder + '/banner.webp'

        const data = {
            title,
            slug,
            description,
            releaseDate,
            genre,
            director,
            duration,
            banner: bannerImage,
            bannerAltText,
            poster: posterImage,
            posterAltText,
            status,
            price,
            discount,
            type,
            finalprice,
            createdBy: _id,
            folder: folder
        }
        await mongoose.model('movie')(data).save()
        await AdminActivity({ module: 'movie-series', action: 'upload', method: req.method, title: `${title} created`, description: `${title} created with details ${JSON.stringify(data)}`, ip: req.ip, from: _id, emailID })
        res.status(201).send({ code: 201, success: true, message: msg })
    } catch (error) {
        res.status(code).send({ code: code, success: false, message: error.message })
    }
})

// movie list  
router.get(movieget_, APILOG, adminAuth, async (req, res) => {
    let code = 400
    try {
        let msg
        let { search, field, order } = req.query, page = req.query.page || 1, limit = req.query.limit || 10, skip = 0, count = 0, movie = []
        if (page > 0) skip = (page - 1) * limit
        if (!field) field = 'created'
        order = order == 'asc' ? 1 : -1
        let { slug } = req.params
        if (slug) {
            slug = slug.toSlug()
            msg = _moviedetails
            APIInfo(msg, req.method)
            movie = await mongoose.model('movie').aggregate([
                {
                    $match: { slug: slug }
                },
                {
                    $lookup: {
                        from: 'admins',
                        localField: 'createdBy',
                        foreignField: '_id',
                        pipeline: [{
                            $project: {
                                _id: 0,
                                name: 1,
                                emailID: 1
                            }
                        }],
                        as: 'createdData'
                    }
                },
                {
                    $unwind: { path: '$createdData', preserveNullAndEmptyArrays: true }
                },
                {
                    $project: {
                        title: 1,
                        slug: 1,
                        description: 1,
                        isrelease: { $gt: [Date.now(), '$releaseDate'] },
                        releaseDate: 1,
                        genre: 1,
                        director: 1,
                        duration: 1,
                        createdBy: '$createdData',
                        banner: 1,
                        bannerAltText: 1,
                        poster: 1,
                        posterAltText: 1,
                        price: 1,
                        discount: 1,
                        finalprice: 1,
                        status: 1,
                        created: 1,
                        type: 1,
                        lastupdate: '$updated',
                    }
                }
            ])
            count = movie.length
            if (!movie[0]) { code = 404; throw new Error(_datanotfound) }
        } else {
            msg = _movielist
            APIInfo(msg, req.method)
            if (search) {
                let searchSlug = search.toSlug()
                let searchTitle = search.toMovieTitle()
                searchSlug = new RegExp(searchSlug + '{1}', 'ig')
                searchTitle = new RegExp(searchTitle + '{1}', 'ig')
                const searchGenre = new RegExp(search + '{1}', 'ig')
                count = await mongoose.model('movie').countDocuments({ $and: [{ $or: [{ slug: searchSlug }, { title: searchTitle }, { genre: searchGenre }] }] })
                if (count > 0) {
                    movie = await mongoose.model('movie').aggregate([
                        {
                            $sort: { [field]: order }
                        },
                        {
                            $skip: skip
                        },
                        {
                            $match: { $and: [{ $or: [{ slug: searchSlug }, { title: searchTitle }, { genre: searchGenre }] }] }
                        },
                        {
                            $project: {
                                _id: 1,
                                slug: 1,
                                title: 1,
                                poster: 1,
                                posterAltText: 1,
                                price: 1,
                                discount: 1,
                                finalprice: 1,
                                type: 1,
                                isrelease: { $gt: [Date.now(), '$releaseDate'] },
                                releaseDate: 1,
                                status: 1,
                            }
                        }
                    ])
                    if (movie.length == 0) count = 0
                }
            } else {
                count = await mongoose.model('movie').countDocuments({ status: true })
                if (count > 0) {
                    movie = await mongoose.model('movie').aggregate([
                        {
                            $sort: { [field]: order }
                        },
                        {
                            $skip: skip
                        },
                        {
                            $match: { status: true }
                        },
                        {
                            $limit: limit
                        },
                        {
                            $project: {
                                _id: 1,
                                slug: 1,
                                title: 1,
                                poster: 1,
                                posterAltText: 1,
                                price: 1,
                                discount: 1,
                                type: 1,
                                finalprice: 1,
                                isrelease: { $gt: [Date.now(), '$releaseDate'] },
                                releaseDate: 1,
                                status: 1,
                            }
                        }
                    ])
                    if (movie.length == 0) count = 0
                }
            }
        }
        res.status(200).send({ code: 200, success: true, message: msg, data: { movie, count } })
    } catch (error) {
        res.status(code).send({ code: code, success: false, message: error.message })
    }
})

// movie update
router.patch(moviepatch_, APILOG, adminAuth, bunny.fields([{ name: 'poster', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), async (req, res) => {
    let code = 400
    try {
        const msg = _movieupdate
        APIInfo(msg, req.method)
        const keys = Object.keys(req.body)
        let { slug } = req.params
        if (!slug) { code = 400; throw new Error(_invaliddata) }
        const allowKey = [
            'title',
            'description',
            'releaseDate',
            'genre',
            'director',
            'duration',
            'isbanner',
            'bannerAltText',
            'isposter',
            'posterAltText',
            'price',
            'discount',
            'status']
        const keyValidate = keys.every(key => allowKey.includes(key))
        if (!keyValidate) { code = 400; throw new Error(_updatekeyvalidate) }
        slug = slug.toSlug()
        const movie = await mongoose.model('movie').findOne({ slug: slug })
        if (!movie) { code = 404; throw new Error(_datanotfound) }
        if (keys.includes('title')) {
            const title = req.body['title'].toMovieTitle()
            const _slug = req.body['title'].toSlug()
            const checkDuplicate = await mongoose.model('movie').findOne({ slug: _slug })
            if (checkDuplicate) { code = 400; throw new Error(_movieunique(title)) }
            movie.title = title
            movie.slug = _slug
        }
        if (keys.includes('isposter') && req.body['isposter'] == 'true') {
            const posterImage = req.files?.poster
            if (!posterImage) { code = 400; throw new Error(_updatepostervalidate) }
            uploadPoster(movie.folder, posterImage[0].buffer)
        }
        if (keys.includes('isbanner') && req.body['isbanner'] == 'true') {
            const bannerImage = req.files?.banner
            if (!bannerImage) { code = 400; throw new Error(_updatebannervalidate) }
            uploadBanner(movie.folder, bannerImage[0].buffer)
        }
        keys.forEach(key => {
            if (key == 'title' || key == 'isposter' || key == 'isbanner') return
            if (key == 'price') {
                if (req.body['discount']) movie['finalprice'] = price - discount
            }
            movie[key] = req.body[key]
        })
        await movie.save()
        const { _id, emailID } = req
        await AdminActivity({ module: 'movie-series', action: 'update', method: req.method, title: `${slug.toMovieTitle()} updated`, description: `${slug.toMovieTitle()} update with details ${JSON.stringify(movie)}`, ip: req.ip, from: _id, emailID })
        res.status(200).send({ code: 200, success: true, message: msg })
    } catch (error) {
        res.status(code).send({ code: code, success: false, message: error.message })
    }

})

// movie delete
router.delete(moviedelete_, APILOG, adminAuth, async (req, res) => {
    let code = 400
    try {
        const msg = _moviedelet
        APIInfo(msg, req.method)
        let { slug } = req.params
        slug = slug.toSlug()
        const movie = await mongoose.model('movie').findOneAndDelete({ slug: slug })
        if (!movie) { code = 404; throw new Error(_datanotfound) }

        const { _id, emailID } = req
        await AdminActivity({ module: 'movie-series', action: 'delete', method: req.method, title: `${slug.toMovieTitle()} deleted`, description: `${slug.toMovieTitle()} delete with details ${JSON.stringify(movie)}`, ip: req.ip, from: _id, emailID })

        res.status(200).send({ code: 200, success: true, message: msg })
    } catch (error) {
        res.status(code).send({ code: code, success: false, message: error.message })
    }
})




module.exports = router
