const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const users = require('../controller/user');
const passport = require('passport'); // 기본 passport를 require해야 여러 인증 전략에 플러그인할 ㅅ ㅜ있따.
const { storeReturnTo } = require('../middleware');
const review = require('../models/review');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), users.login);

// 로그아웃 / passport에 req.logout 메서드 이용
router.get('/logout', users.logout);

module.exports = router;