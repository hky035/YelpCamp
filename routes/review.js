const express = require('express');
const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controller/review');
const ExpressError = require('../utils/ExpressError');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const router = express.Router({ mergeParams: true });
// [*] 이렇게 라우트를 분리해서 작성할 경우, app.js에서 접두사에 params가 있는 경우가 있다.
// 이때 이 분리된 파일에서 router은 접두사의 :id를 인식하지 못하기에 mergeParams로 해결해줘야한다.  



router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;