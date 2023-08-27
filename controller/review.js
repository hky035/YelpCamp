const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    // [*]campgrond가 null이라고 떠서 null에 reviews라는 특성을 찾을 수 없다고 나온다. 이는 console.log(campground) 하면 알 수 있는데
    //    이는 분리된 라우터 파일에서 이 라우트(경로)가 접두사로 사용하고 있는 campgournd/:id를 가져오는 것이기 때문에 현재 파일에서 없다고 인식하는 것
    //     따라서. router을 정의해줄 때 mergeRouter : true  옵션을 설정해줘야함

    await review.save();
    await campground.save();
    req.flash('success', 'Create new Review');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //$pull : 배열에 있는 인스턴스 중 특정 조건에 만족하는 인스턴스 제거
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'successfully deleted Review');
    res.redirect(`/campgrounds/${id}`);

}