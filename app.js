require('./db');
const Problem = require('./models/problem');

var express       = require('express');
var nunjucks      = require('nunjucks');
var bodyParser    = require('body-parser');
var fs            = require('fs');
const PDFDocument = require('pdfkit');
var blobStream    = require('blob-stream');

var app = express();

nunjucks.configure('views',{
    autoescape: true,
    express: app
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req,res){
    return res.render('menu.html');
});

app.get('/list', async function(req,res){
    const problems = await Problem.listProblems();
    return res.render('list.html',{problems: problems});
});

app.get('/add', function(req,res){
    res.render('add.html');
});

app.post('/add/form', function(req,res){
    //récupération des datas passées dans le formulaire
    var problemNumber   = req.body.problemNumber;
    var problemContent  = req.body.problemContent;
    var problemResult   = req.body.problemResult;
    var problemLevel    = req.body.problemLevel;
    var summary         = problemContent.substring(0,40);

    //Creation d'un objet Website à insérer dans la BDD
    let problem = {
        number: problemNumber,
        content: problemContent,
        result: problemResult,
        level: problemLevel,
        summary: summary
    }

    if(Problem.addProblem(problem)){ //Si insertion OK
        return res.render('list.html'); //Affichage de la page de monitoring
    }else{ //Si insertion KO
        return res.render('add.html'); //Affichage de la page d'ajout d'un site web avec un message d'erreur
    }
});

app.get('/edit', async function(res,req){

    const problems = await Problem.listProblems();
    var date    = new Date();
    var year    = date.getFullYear();
    var month   = date.getMonth();
    var day     = date.getDay();
    var hours   = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds(); 

    var dateComplete = year + '_' + month + '_' + day + '_' + hours + '_' + minutes + '_' + seconds;

    const doc = new PDFDocument;

    doc.pipe(fs.createWriteStream('output_' + dateComplete  + '.pdf'));

    for(i=0; i < problems.length; i++){
        doc.addPage()
        .lineWidth(5)
        .rect(90,90,400,200)
        .stroke()
        .rect(90,90,400,50)
        .stroke()
        .fontSize(18)
        .text('Problème n°' + problems[i].number,90,98,{width:380 ,align:'center'})
        .fontSize(12)
        .text(problems[i].content, 100,190,{ width:380, align: 'center'});
    };

   doc.end();
});

app.get('/delete/:id', async function(req,res){
    var id = req.params.id;
    if(Problem.deleteProblem(id)){
        res.render('delete.html',{state: true});
    }else{
        res.render('delete.html',{state:false});
    }
})

app.listen(5000);