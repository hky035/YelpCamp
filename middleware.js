const { campgroundSchema } = require('./schemas')
const { reviewSchema } = require('./schemas')
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    // try {

    console.log("req user : ", req.user); // passport를 통해 직렬화된 사용자 데이터를 세션에서 역직렬화해서 req.user에 담기게 된다.
    // 터미널에 나오는 것 보면 알 수 있듯이 hash나 salt, password 등은 출력되지 않음
    // 로그인하지 않았을 때는 undefined라고 뜬다. 따라서, 렌더링이나 redirect할 떄 req.user를 전달하여
    // 로그인 여부를 확인하고 undefined가 아니면 login, register같은 nav bar 요소들을 숨기도록한다.
    //  >> app.js에서 app.use에서 res.locals 사용
    if (!req.isAuthenticated()) { // passport에서 제공하는 메서드 isAuthenticated() 사용자의 로그인 여부를 반환
        // 로그인 시 기존의 창으로 다시 돌아가는 법
        // console.log(req.path, req.originalUrl) //를 통해서 확인해보면 req.originalUrl이 정확한 요청했던 경로임을 알 수 있음
        // req.session.returnTo = req.originalUrl;
        req.flash('error', 'you must be a sign up first to creat new campground');
        return res.redirect('/login');
    }
    next();
    // } catch (e) {
    //     console.log(e);
    // }
}

module.exports.validateCampground = (req, res, next) => {
    // 유효성검사 스키마(campgroundSchema)는 shemas.js 파일에 만들어 exports
    const { error } = campgroundSchema.validate(req.body);
    console.log(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(','); //error의 details는 배열인데 쉼표를 기준으로 새로운 배열로 매핑? 체크
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'you do not have a permission');
        res.redirect('/campgrounds');
    }
    next();

}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'you do not have a permission');
        res.redirect(`/campgrounds/${id}`);
    }
    next();

}

// 로그인했던 페이지로 돌아가기 위함
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        console.log(req.session.returnTo);
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}


module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(','); //error의 details는 배열인데 쉼표를 기준으로 새로운 배열로 매핑? 체크
        throw new ExpressError(msg, 400);
    } else {
        next();
    }

}




