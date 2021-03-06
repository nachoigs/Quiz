var models = require('../models/models.js');

// MW que permite acciones solamente si el quiz objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
    var objQuizOwner = req.quiz.UserId;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;

    if (isAdmin || objQuizOwner === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};

// Autoload :id
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
            where: {
                id: Number(quizId)
            },
            include: [{
                model: models.Comment
            }]
        }).then(function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else{next(new Error('No existe quizId=' + quizId))}
    }
  ).catch(function(error){next(error)});
};

// GET /quizes
exports.index = function(req, res, next) {
var options = {};
  if (req.user){
    options.where = {UserId: req.user.id};
  }
  if(req.query.search){
	var search = req.query.search || "";
	var search_like = "%" + search.replace(/ +/g,"%") + "%";

  options.where = ['pregunta like ?', search_like];
  options.order = [['updatedAt', 'DESC']];
  }
   models.Quiz.findAll(options).then(
      function(quizes) {
        res.render('quizes/index.ejs', {quizes: quizes, errors: []});
      }
    ).catch(function(error){next(error)});
  };

//GET /quizes/:id 
exports.show = function(req, res) {
  models.Quiz.find(req.params.quizId).then(function(quiz) {
    res.render('quizes/show', {quiz: req.quiz, errors: []}); 
  })
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render(
    'quizes/answer', 
    { quiz: req.quiz, 
      respuesta: resultado, 
      errors: []
    }
  );
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build(
    {pregunta: "Pregunta", respuesta: "Respuesta"}
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res, next) {
  req.body.quiz.UserId = req.session.user.id;
  if (req.files.image){
    req.body.quiz.image = req.files.image.name;
  }
  var quiz = models.Quiz.build( req.body.quiz );

  quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta", "UserId", "image"]})
        .then( function(){ res.redirect('/quizes')}) 
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error){next(error)});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res, next) {
  if (req.files.image){
    req.quiz.image = req.files.image.name;
  }
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta", "image"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req, res, next) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};

// Statistics
exports.statistics = function (req, res, next) {
  models.Quiz.count().then(function(numberquestions){
    console.log ("1");
    models.Comment.count().then(function(numbercomments){
       console.log ("2");
      models.Comment.count({ include: models.Quiz, distinct: 'quizId' }).then(function(questionswithcomments){
         console.log ("3");
        res.render('quizes/statistics.ejs' , {   numberquestions: numberquestions,
                                              numbercomments: numbercomments,
                                              questionswithcomments : questionswithcomments,
                                              comments4questions: (numbercomments/numberquestions),
                                              questionswithoutcomments : (numberquestions - questionswithcomments),
                                              errors: []
        });

      }).catch(function (error){
          next(error);
      });

    }).catch(function (error){
           next(error);
    });

  }).catch(function (error){
           next(error);
  });
};
