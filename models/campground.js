const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema; //일종의 단축어

const CampgroundSchema = new Schema({ //mongoose.Schema 대신 Schema로 쓸 수 있게 됨
    title: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteOne({
            _id: { $in: doc.reviews }
        })
    }
})



module.exports = mongoose.model('Campground', CampgroundSchema);