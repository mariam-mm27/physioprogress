class ApiFeatures {
    constructor (query,queryStr) {
        this.query = query 
        this.queryStr = queryStr
        this.filterQuery = {}
        this.searchQuery = {}
    }

    filter () {
        let exclusiveFields = ["sort","search","fields","limit","page","skip"]
        let queryObj = {...this.queryStr}
        exclusiveFields.forEach(f => delete queryObj[f])
        let queryString = JSON.stringify(queryObj).replace(/\b(gt|gte|lt|lte)\b/g,match => `$${match}`)
        queryObj = JSON.parse(queryString)
        this.filterQuery = queryObj
        this.query = this.query.find(queryObj)
        return this
    }

    fields () {
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.replaceAll("," , " ")
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select("-__v")
        }
        return this
    }

    sort () {
         if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.replaceAll("," , " ")
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort("_id")
        }
        return this
    }


    search () {
        if (this.queryStr.search) {
            const keyword = this.queryStr.search
            const searchQr = {
                $or : [
                    {name : {$regex : `^${this.queryStr.search}`,$options: "i"}},
                    {description : {$regex : `${this.queryStr.search}`,$options: "i"}},
                ]
            }
            this.searchQuery = searchQr
            this.query = this.query.find(searchQr)
        }
        return this
    }

    pagination () {
        let page = this.queryStr.page || 1 
        let limit = this.queryStr.limit || 10 
        let skip = (page -1) * limit 
        this.query = this.query.skip(skip).limit(limit)

        return this
    }
}

module.exports = ApiFeatures