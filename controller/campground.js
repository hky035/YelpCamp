const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

// index 페이지로 가는 컨트롤러
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    /* 이걸 isLoggedIn 미들웨어로 작성  middleware.js 파일에 작성
    if (!req.isAuthenticated()) { // passport에서 제공하는 메서드 isAuthenticated() 사용자의 로그인 여부를 반환
        req.flash('error', 'you must be a sign up to creat new campground');
        return res.redirect('/login');
    } */
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    /*
    // console.log('new campground :: ', req.body);
    // if (!req.body.campground) throw new ExpressError('Invalid Campground data', 400); // campground가 없을 때 오류 발생
    // campground[title]은 있는데 나머지는 값은 없도록 설정하여 postman으로 요청을 보내면 여전히 등록된다.
    // >> if(!req.body.campground.price)와 같이 일일히 설정하기에는 너무 번거롭다. >> Joi 사용 !!!!!!
    const campgroundSchema = Joi.object({ // 1) Joi로 데이터의 스키마 정함  / 이 부분을 재사용하도록 미들웨어로 빼냄
        campground: Joi.object({
            title: Joi.string(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    }) 
    //2) 스키마에 데이터를 전달하여 유효성 검사 실행
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(','); //error의 detailfs는 배열인데 쉼표를 기준으로 새로운 배열로 매핑? 체크
        throw new ExpressError(msg, 400);
    }
    console.log(result);
    */

    const campground = new Campground(req.body.campground); // 데이터를 생성 create 할 때는 모델에 대한 인스턴스를 생성해서 보내는 걸 잊지말기 !!
    // 폼에서 name을 통해 campground라는 키의 값으로 묶어서(그룹화) 보냈기 때문에 그냥 req.body가 아닌 req.body.campground를 해줘야 
    // { title과 location을 사용 가능 }  + 자세한 건 console 출력 참고 

    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); // cloudinary로 올리사진을 다시 사용하기 위해 path와 filename을 저장함 

    campground.author = req.user._id; // 생성한 사람을 campground의 author에 저장
    await campground.save();
    console.log("campground : ", campground);
    req.flash('success', "Successsfully made a new CAMPGROUND !"); // 플래쉬 !!!
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews', // campgrounds를 show할 때 각 리뷰의 작성들을 보여줘야함 >> 중첩 populate 해야함. 객체와 path를 활용
        populate: {
            path: 'author'
        }
    }).populate('author');
    // console.log(campground);
    if (!campground) {
        req.flash('error', 'CAN NOT FIND THAT CAMPGROUND');
        res.redirect('/campgrounds');
    }
    else {
        res.render('campgrounds/show', { campground });
    }
}

module.exports.renderEditForm = async (req, res) => {
    // const campground = await Campground.findById(req.params.id)
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'CAN NOT FIND A CAMPGROUND TO EDIT');
        res.redirect('/campgrounds');
    }
    else {
        res.render('campgrounds/edit', { campground });
    }
}

/* 
module.exports.updateCampground = async (req, res, next) => {
    try {
        const { id } = req.params;
        // 사용자 권한이 있는지 확인하는 이걸 미들웨어 isAuthor로 작성 
        // const campground = await Campground.findById(id); // 작성자와 일치해야 해당 라우트를 사용할 수 있는 로직 delete와 GET/ :id/edit에도 사용
        // if (!campground.author.equals(req.user._id)) {
        //     req.flash('error', 'you do not have a permission');
        //     return res.redirect(`/campgrounds/${id}`)
        // }
        // const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); //find하고 update를 한번에 하기 보다는 find 한 뒤 유저가 일치한지 확인하고 업데이트 하는게 좋음
        const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
        const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.images.push(...imgs);
        await campground.save();
        console.log(req.body);
    //     if (req.body.deleteImages) { // 체크박스로 삭제할 이미지를 선택해보내면 req.body에 delteImages가 존재하게 된다. 따라서 존재하면 지우는 걸로
    //          for (let filename of req.body.deleteImages) { // cloudinary에 업로드된 이미지를 삭제한다. 
    //              await cloudinary.uploader.destroy(filename);
    //          }
            
    //     // await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } }) // mongod에 저장된 images 배열에 안에 있는 객체를 삭제한다.
    //     // pull을 통해 이미지를 지우는데, 이미지는 req.body.deleteImages에 있는 파일네임 중 일치하는 filename을 가진 것들만 지운다.
    //     console.log(campground);
    // } 
        req.flash('success', 'Successfully updated Campground!');
        res.redirect(`/campgrounds/${campground._id}`)
    } catch (e) {
        if (e instanceof TypeError) {
            e.message = "type error !";
        }
        next(e);
    }
} 
*/
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}


module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'successfully deleted Campground');
    res.redirect('/campgrounds');
}