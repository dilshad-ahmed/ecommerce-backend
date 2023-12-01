class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword
            ? {
                  name: {
                      $regex: this.queryStr.keyword,
                      $options: "i",
                  },
              }
            : {};
        // console.log("keyword==>",keyword);
        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        const queryCpy = { ...this.queryStr };
        // console.log("query==>", queryCpy);
        // removing some field for   **** category *****
        const removeField = ["keyword", "page", "limit"];

        removeField.forEach((key) => {
            delete queryCpy[key];
        });
        // console.log("query category==>",queryCpy);
        let queryStr = JSON.stringify(queryCpy);

        //filter for price and Rating
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

        // console.log(queryStr);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;

        const skip = resultPerPage * (currentPage - 1);
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}

module.exports = ApiFeatures;
