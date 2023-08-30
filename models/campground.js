const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema; //일종의 단축어

// 각 이미지를 cloudinary의 transform 가상 api 사용을 위해 이미지 스키마를 따로 생성. (왜냐하면 가상 특성은 스키마에만 추가할 수 있음)

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumnail').get(function () { // 가상 특성 thumnail을 ImageSchma에 추가. thumnail 속성이 사용되면 이미지 크기를 수정하는 로직이 실행
    return this.url.replace('/upload', '/upload/w_200');
    // 이렇게 가상 속성을 설정했으니 edit.ejs에서 img src = img.url이 아닌 img.thumnail을 사용
});

const CampgroundSchema = new Schema({ //mongoose.Schema 대신 Schema로 쓸 수 있게 됨
    title: String,
    images: [ImageSchema],
    //Geo Json 사용을 위한 geometry 타입 설정, 물론 mapbox에서 forwardGeocode.body의 geometry 속성의 값도 GeoJson으로 정의되어 있음. 이를 활용하기 위해 GeoJson 형식으로 해야함.
    //GeoJson 형식은 몽구스에서도 여러 API로 활용이 가능하도록 지원, GeoJson은 객체안에 type:'Point'와 경도와 위도 두 숫자를 배열로 받는 coordinates가 존재
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
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