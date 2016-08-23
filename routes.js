var express = require('express');
var multer = require('multer');

var AuthController = require('./controllers/AuthController');
var StoreController = require('./controllers/StoreController');
var StoreProductController = require('./controllers/StoreProductController');
var StoryController = require('./controllers/StoryController');
var FacebookController = require('./controllers/FacebookController');
var AccountController = require('./controllers/AccountController');
var UploadController = require('./controllers/UploadController');

var SessionMiddleware = require('./middlewares/SessionMiddleware');

var router = express.Router();
var upload = multer({
  dest: 'uploads/'
});

router.get('/', AuthController.dashboardPage);
router.get('/auth', AuthController.authPage);
router.post('/auth', AuthController.auth);
router.get('/logout', SessionMiddleware, AuthController.logout);

router.get('/stores/count', SessionMiddleware, StoreController.storeCount);
router.get('/stores', SessionMiddleware, StoreController.storePage);
router.get('/stores/refresh', SessionMiddleware, StoreController.storeRefresh);
router.get('/stores/:store_id', SessionMiddleware, StoreController.storeDetailPage);
router.post('/stores/:store_id/stories', SessionMiddleware, StoreController.updateStoreStories);
router.post('/stores/:store_id/setting', SessionMiddleware, StoreController.updateStoreSetting);

router.post('/stores/:store_id/products', SessionMiddleware, upload.single('photo'), StoreProductController.createStoreProduct);
router.get('/stores/:store_id/products/:product_id', SessionMiddleware, StoreProductController.storeProductPage);
router.post('/stores/:store_id/products/:product_id', SessionMiddleware, upload.single('photo'), StoreProductController.updateStoreProduct);
router.delete('/stores/:store_id/products/:product_id', SessionMiddleware, StoreProductController.deleteStoreProduct);

router.get('/stories', SessionMiddleware, StoryController.storyPage);
router.post('/stories', SessionMiddleware, StoryController.createStory);
router.get('/stories/:story_id', SessionMiddleware, StoryController.updateStoryPage);
router.post('/stories/:story_id', SessionMiddleware, StoryController.updateStory);
router.get('/stories/:story_id/reports', SessionMiddleware, StoryController.storyReports);

router.get('/facebook/webhook', FacebookController.webhookPage);
router.post('/facebook/webhook', FacebookController.webhook);

router.get('/accounts', AccountController.accountPage);

router.get('/uploads/:name', UploadController.sendFile);

module.exports = router;
