const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => { //catchAsync만 쓰면 에러 페이지로 넘어가서 사용감에 불편을 줄 것 따라서 try..catch도 추가로 사용
    try {
        // passport를 사용한 register 정리
        // 1. 사용자 모델 인스턴스를 만든다(이 떄, password를 제외한 다른 정보를 저장).
        // 2. 모델.register 메서드를 통해 만든 인스턴스와 password를 전달해준다.
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password); // console.log(registeredUser);
        req.login(registeredUser, err => { // passport에 login을 활용하여 가입 후 바로 로그인이 되도록 한다.
            // 참고로 .authenticate()는 login()을 호출한다. authenticate는 기존에 사용자가 있어야만 인증할 수 있기떄문에 login 사용
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => { //passport에서 제공하는 미들웨어 authenticate 사용, 인자로 전략 적음(여러개 사용 가능)
    // passport에서 제공하는 failureFlash를 true 설정하며 자동으로 플래쉬 저달, failureRedirect도 passport에저 제공
    // console.log(res.locals.returnTo);
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // retunTo가 있을 경우 returnTo의 주소로 redirect
    delete req.session.returnTo;
    console.log("redirectUrl : ", redirectUrl);
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }

        req.flash('success', 'Good Bye');
        res.redirect('/campgrounds');
    });
}