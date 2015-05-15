var models = require('../models/models.js');

// GET /quizes
exports.index = function(req, res) {
	var search = req.query.search || "";
	var search_like = "%" + search.replace(/ +/g,"%") + "%";

  models.Quiz.findAll({where: ["pregunta like ?", search_like],
			 			 order: [['updatedAt', 'DESC']]
						}).then(function(quizes) {
    res.render('quizes/index.ejs', { quizes: quizes});
  })
};

// GET /quizes/:id
exports.show = function(req, res) {
  models.Quiz.find(req.params.quizId).then(function(quiz) {
    res.render('quizes/show', { quiz: quiz});
  })
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  models.Quiz.find(req.params.quizId).then(function(quiz) {
    if (req.query.respuesta === quiz.respuesta) {
      res.render('quizes/answer', 
                 { quiz: quiz, respuesta: 'Correcto' });
    } else {
      res.render('quizes/answer', 
                 { quiz: quiz, respuesta: 'Incorrecto'});
    }
  })
};
