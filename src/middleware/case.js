String.prototype.toSlug = function () {
    try {
        const data = this.trim()
        if (data.length == 0 || !data || typeof (data) !== 'string') {
            throw new Error('string not found')
        }
        const slug = data.replace(/ /g, '-')
        return slug.toLowerCase()
    } catch (error) {
        return error
    }
}


String.prototype.toMovieTitle = function () {
    try {
        const data = this.trim()
        let title = ''
        if (data.length == 0 || !data || typeof (data) !== 'string') {
            throw new Error('string not found')
        }
        for (let i = 0; i < data.length; i++) {
            if (i == 0) { title += data[i].toUpperCase() }
            else if (data[i] == ' ') {
                title += data[i]
                i++
                title += data[i].toUpperCase()
            }
            else title += data[i].toLowerCase()
        }
        return title
    } catch (error) {
        return error
    }
}