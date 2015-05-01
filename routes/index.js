var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz' });
});

router.get('/quizes/question', quizController.question);
router.get('/quizes/question', quizController.answer);
router.get('/authors', function(req, res, next){
	res.render('authors', {title: 'autores'});
});

module.exports = router;
