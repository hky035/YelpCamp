const express = require('express');
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controller/campground'); // 캠프그라운드의 라우트핸들러(각 요청에 관한 핵심 기능)를 컨트롤러로 뺴놓음. campgrounds 객체로 선언해 각 기능이 속성으로 쓰이도록 함
// 기존에 하던 { index } 같은 방식이 아니라 새로운 방식이네
const multer = require('multer');
// const upload = multer({ dest: 'uploads/' }); //여기서 설정한 목적 경로(dest)로 파일이 저장. 우리는 uploads란 폴더에 저장. 폴더가 없으면 해당 디렉토리에 생성, 원래는 aws나 cloudinary 등을 씀.
const { storage } = require('../cloudinary'); // 알아서 index.js를 찾으므로 뒤에 /index.js는 생략
const upload = multer({ storage });


// const { campgroundSchema } = require('../schemas'); //validateCampground에서 사용되는 Schema떄문에 적어놨었는데 middleware 파일로 이동하면서 얘도 이동
// const { ExpressError } = require('./utils/ExpressError'); // 얘도 마찬가지
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const ExpressError = require('../utils/ExpressError');

const router = express.Router();


// .route 메서드를 통해 같으 경로는 합치기
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)); // cloudinary 사용으로 인한 post 라우트 변경
/* .post(upload.array('image'), (req, res) => { // upload.single('image') : 파일하나 vs updoad.array('image') : 파일 여러개 
    // upload.array는 Multer의 미들웨어. 인자로 폼 데이터의 name 값을 찾는다라고 생각하면 됨. / 참고로 upload.array로 여러개 파일 올릴 경우 input에 multiple 속성 적어야함
    console.log(req.body, req.files);
    res.send("it worked");
})
 */


router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

//try catch로 오류 핸들러로 오류 전달하는 것을 보여주기 위해 try catch 사용. 원래는 다 catchAsync 안에 넣으면 됨
/* router.put('/:id', validateCampground, async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
        res.redirect(`/campgrounds/${campground._id}`)
    } catch (e) {
        next(e);
    }
}); */

module.exports = router;