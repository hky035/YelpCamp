// passport 사용
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true // 유효성 검사에 사용되지는 않지만 넣어둠 이유?
    }
});

userSchema.plugin(passportLocalMongoose); // passport-local의 특징으로 사용자 이름과 암호를 userSchema에 집어넣는다. 사용자 이름 중복 여부 등 몇가지 메서드도 추가된다.

module.exports = mongoose.model('User', userSchema);

