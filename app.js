if (process.env.NODE_ENV !== "production") { // 환경이 production(배포,사용자 입장)이 아닐 떄, 즉 개발환경일때만
    require('dotenv').config(); // dotenv를 require 함으로써 .env 파일의 값들에 접근이 가능하도록 한다.
}
/* 
console.log(process.env.SECRET);
console.log(process.env.API_KEY);
 */
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport'); // 기본 passport를 require해야 여러 인증 전략에 플러그인할 ㅅ ㅜ있따.
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');


/* 주석처리한 것들은 각 라우트를 파일로 옮기게 되면서 더이상 여기에 작성할 필요가 없게된 코드들임
const Joi = require('joi');
const { campgroundSchema } = require('./schemas')
const { reviewSchema } = require('./schemas')
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync');
const Review = require('./models/review');
const { AsyncResource } = require('async_hooks');  // 얜 뭔지 모르겠음 없어도 동작 문제 X
 */

// ROUTE
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/users');

// mongoose.connect
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection Error"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

// app setting
app.use(express.urlencoded({ extended: true })); // req.body로 데이터를 파싱
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate); //ejs 파일을 실행하거나 파싱할 떄 쓰이는 엔진을 ejsMate로 한다. express가 쓰는 기본 엔진에서 바꿔줘야한다.  
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public'))); // public 폴더를 통한 정적 assets 사용하기. 
// express.static() : img, js와 같은 정적 asset을 사용할 수 있는 경로를 설정하는 메서드 

app.use(mongoSanitize({
    replcaeWith: '_' // replace 없이 mongoSanitize()만 쓰면 아예 쿼리에서 $나 .같은 키가 포함된 값은 다 삭제.  consogle.log(req.query)에서 확인
}))

const sessionConfig = {
    name: 'session', // 쿠키의 이름 설정, 설정하지 않고 기본 이름은 connection.sid 쓰면 누가 크롤링해가면 답 없다.
    secret: 'thisshoutbebetterscrete',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //http only(일종의 보안) 플래그가 체크되면, 클라이언트 측에서 스크립트에서 해당 쿠키에 접근할 수 없게 된다. 또한, xss에 결함 등을 발생시키는 링크에 접근 시 브라우저가 쿠키 유출을 방지한다.
        // secure : true, //secure 상태인 http => https인 요청에만 쿠키를 가질 수 있다. 우리는 local 환경이기 때문에(local은 http) 일단 secure은 주석처리, 실제 배포시에는 true로 함
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  // 쿠키의 만료 기한, 밀리 세컨드로 나오기 때문에 만약 일주일이 쿠키의 만료기한이라면, 일주일을 밀리세컨드로 더해줘야함
        maxAge: 1000 * 60 * 60 * 24 * 7 // 만료기한의 최대치 
        // 세션의 만료기한 : 예로 우리가 일주일로 설정하였으면 로그인이 최대 일주일동안 유지되는 것 !
    }
}
app.use(session(sessionConfig));
app.use(flash());
// 동작원리
// req.flash에 키-밸류 쌍을 전달해 플래쉬를 생성

/* app.use(helmet({
    contentSecurityPolicy: false
})); */
//helmet()을 use 함으로써 helmet에 있는 11개의 메소드(미들웨어)들을 개별 use하는게 아니라 한꺼번에 사용할 수 있게 됨. 
//그 중 contentSercurityPolicy 속성때문에 map이나 image가 보이지 않는 오류가 있어 해당 특성은 인자로 전달해 false 상태로 한다.
//POSTMAN으로 요청 보낸후 header 확인해보면 여러 헤더 추가된 것을 알 수 있는데 이것들이 일단 보안을 더 강화해주었다고 생각하면 된다. 자세한 내용은 공식문서 참고

app.use(helmet());
const scriptSrcUrls = [ // 이 밑의 코드들은 우리가 사용할 수 있는 출처에 해당된 것들을 모아놓은 것. contentSercurityPolicy의 옵션임
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dp3jvo1po/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize()); // 공식문서 보기
app.use(passport.session()); // 참고로 passport.session()이 session() 미들웨어보다 나중에 작성되어야 한다.
passport.use(new LocalStrategy(User.authenticate())); // passport가 LocalStarategy를 통해 User를 사용한다. .authenticate는 인증에 관련된 메서드들을 생성해주는 함수이다.

passport.serializeUser(User.serializeUser());     // User를 직렬,일련화시키고 직렬화는 어떻게 데이터를 얻고 세션에서 사용자를 저장하는지를 참조
passport.deserializeUser(User.deserializeUser()); // 세션에서 저장할지 않을지를 지정해줌 


app.use((req, res, next) => { // 라우트 핸들러 앞에 작성되어야함
    // console.log(req.session);

    console.log(req.query);  // mongo-sanitize 점검을 위해 사용, SQL INJECTION 방지


    //  이 코드 혹은 isLoggedIn에 req.session.returnTo = req.original 코드를 작성. 둘 중 하나 선택
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }

    // console.log("success flash message : ", req.flash('success'));
    res.locals.success = req.flash('success'); // 대부분 없겠지만 해당 키(success)에 해당하는 값이 있으면 플래시가 시랭되고 리다이렉트를 할 때 메시지가 뜰 것
    // boilierplate에서 플래시 메시지를 띄우도록 해놨음
    res.locals.error = req.flash('error'); // 예를 들어 캠프그라운드를 찾는데 해당 캠프그라운드가 없으면 인덱스페이지로 가고 플래시 메세지로 찾을 수 없다고 띄움

    res.locals.currentUser = req.user; // navbar에서 currentUser의 존재여부에 따라, Login, Reigster, Log out등의 요소 나타낼지 말지 정함
    next();
})

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

/* 
app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'testmail@gmail.com', username: 'colttt' }); // passport-local-mongoose를 플러그인했으니 username과 password도 자동으로 추가되어 사용 가능
    const newUser = await User.register(user, '123'); // password는 register 메서드를 통해 만듬(알아서 해쉬됨), 첫번쨰 인자로 email과 username이 담긴 인스턴스 전달, 2번쨰 인자가 password
    // register 메서드를 사용하면 알아서 DB에 save 된다 !!
    res.send(newUser); // 확인해보기
})
// email이나 username이나 같은 값을 전송하면 이미 존재하는 것이라고 오류가 남

 */

/* 
app.all('*', (req, res, next) => { // 위의 주소가 아닌 다른 요청들은 Page Not Found 404 에러를 보냄
    next(new ExpressError('Page Not Found', 404));
}) */


// 오류핸들러
// 빈칸이 없어야하는 validationError는 각 ejs에 부트스트랩으로 설정했으니 이 오류 핸들러는 Price에 cast Error 시 오류 검출
// 방법 1)  : 각 라우트 핸들러에서 try..catch를 통해 오류를 next로 전달함
// 방법 2) : utils 폴더에 각 유틸리티 만들고 프로미스 반환 함수를 생성해 catch로 오류를 오류 라우트 핸들러로 전달
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something is wrong";
    /* console.dir(err);
    console.log(err.name); */
    res.status(statusCode).render('error', { err });

})

app.listen('3000', () => {
    console.log("connecting to 3000 port");
})



