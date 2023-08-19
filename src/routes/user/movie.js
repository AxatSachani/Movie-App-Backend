const express = require('express')
const { APILOG, APIInfo } = require('../../middleware/logger')
const { guestAuth } = require('../../middleware/auth')
const { default: mongoose } = require('mongoose')
const { usermovieget_ } = require('../../endpoints')
const { _usermoviedetails, _usermovielist } = require('../../messages')
const router = express.Router()


//movie list 
router.get(usermovieget_, APILOG, guestAuth, async (req, res) => {
    let code = 400
    try {
        let msg
        let { search, sort } = req.query, page = req.query.page || 1, limit = req.query.limit || 10, skip = 0, count = 0, movie = []
        if (page > 0) skip = (page - 1) * limit
        let { slug } = req.params
        if (slug) {
            slug = slug.toSlug()
            msg = _usermoviedetails
            APIInfo(msg, req.method)
            movie = await mongoose.model('movie').aggregate([
                {
                    $match: { slug: slug, releaseDate: { $lt: Date.now() } }
                },
                {
                    $project: {
                        title: 1,
                        slug: 1,
                        description: 1,
                        releaseDate: 1,
                        genre: 1,
                        director: 1,
                        duration: 1,
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
                    }
                }
            ])
            count = movie.length
            if (!movie[0]) { code = 404; throw new Error(_datanotfound) }
        } else {
            msg = _usermovielist
            APIInfo(msg, req.method)
            if (search) {
                let searchSlug = search.toSlug()
                let searchTitle = search.toMovieTitle()
                searchSlug = new RegExp(searchSlug + '{1}', 'ig')
                searchTitle = new RegExp(searchTitle + '{1}', 'ig')
                const searchGenre = new RegExp(search + '{1}', 'ig')
                count = await mongoose.model('movie').countDocuments({ $and: [{ status: true }, { $or: [{ slug: searchSlug }, { title: searchTitle }, { genre: searchGenre }] }] })
                if (count > 0) {
                    movie = await mongoose.model('movie').aggregate([
                        sortByQuery(sort),
                        {
                            $skip: skip
                        },
                        {
                            $match: { $and: [{ status: true }, { $or: [{ slug: searchSlug }, { title: searchTitle }, { genre: searchGenre }] }] }
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
                console.log(sortByQuery(sort));
                if (count > 0) {
                    movie = await mongoose.model('movie').aggregate([
                        sortByQuery(sort),
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


const sortByQuery = (sort) => {
    if (sort)
        if (sort.toString().toLowerCase() == 'pricehightolow') return { $sort: { finalprice: -1 } }
        else if (sort.toString().toLowerCase() == 'pricelowtohigh') return { $sort: { finalprice: 1 } }
        else if (sort.toString().toLowerCase() == 'discounthightolow') return { $sort: { discount: -1 } }
        else if (sort.toString().toLowerCase() == 'discountlowtohigh') return { $sort: { discount: 1 } }
        else if (sort.toString().toLowerCase() == 'newrelease') return { $sort: { releaseDate: -1 } }
        else return { $sort: { title: -1 } }
    else return { $sort: { title: -1 } }
}



module.exports = router