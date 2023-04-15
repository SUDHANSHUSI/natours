const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// THIS MIDDLEWARE PROTECTS ALL ROUTES COMING AFTER THIS AUTHCONTROLLER
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUsers);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);


//**********only the admin have the permission to createuser and get all user *****
// router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUsers)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
