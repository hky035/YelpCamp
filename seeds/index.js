//  데이터베이스에 시드를 넣고 싶을 때 실행하는 파일
//  테이터나 모델을 수정할때만 사용
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection Error"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => { // 데이터베이스 초기화 후 50개의 랜덤 시드를 생성
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // Your user ID
            author: "64d477b5f3d2cf2b19b4165b",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dp3jvo1po/image/upload/v1693404912/YelpCamp/osecoc5p1rets5d1qewo.jpg',
                    filename: 'YelpCamp/ktmqcesukmohkjpsly98'
                }
            ],
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Praesentium tempore nesciunt error esse vitae porro officiis dolorem sequi adipisci accusantium quam et iure, in delectus? Dolorem in est debitis sapiente?",
            price: price

        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})