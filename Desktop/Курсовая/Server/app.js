const mysql = require("mysql2");
  
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "Auto_Showroom",
  password: "1982376455"
});

connection.connect(function(err){
  if (err) {
    return console.error("Ошибка: " + err.message);
  }
  else{
    console.log("Подключение к серверу MySQL успешно установлено!");
  }
});


// подключение express
const express = require("express");
const bodyParser = require("body-parser");
// подключение движка представлений
const expressHbs = require('express-handlebars')
const hbs = require('hbs')
// подключение модуля для работы с путями
//const fs = require("fs");
// создаем объект приложения
const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});
//const path = require('path');
//устанавливаем параметры движка представлений
app.engine(
  'hbs',
  expressHbs({
    layoutsDir: 'views/layouts',
    defaultLayout: 'layout',
    extname: 'hbs'
  })
)
//устанавливаем путь к файлам представлений
app.set('view engine', 'hbs')
hbs.registerPartials(__dirname + '/views/partials')
/*app.use(express.static(path.join(__dirname, 'public')));*/
//устанавливаем путь к статическим файлам проекта
app.use(express.static(__dirname + '/public'));



//Главная
app.get('/', function(req, res) {
  connection.query("select * FROM autos join makes on autos.idMake=makes.idMake join models on autos.idModel=models.idModel and models.idMake=makes.idMake join vehicletypes on autos.idVehicleType=vehicletypes.idVehicleType where autos.idAuto >= 5 && autos.idAuto <= 6", function(err, data){
    if(err) return console.log(err);
    console.log(__dirname);
    res.render('home.hbs',{
      autos: data
    });
  });
});
//Каталог
app.get('/catalog', function(req, res) {
  res.render('catalog')
});
//Контакты
app.get('/contact', function(req, res) {
     res.render('contact')
  });

//Форма поиска
app.post('/catalog', urlencodedParser, function(req, res) {
  
    if(!req.body) return res.sendStatus(400);
    const make = req.body.make;
    const model = req.body.model;
    const year_from = req.body.year_from;
    const year_to = req.body.year_to;
    const price_from = req.body.price_from;
    const price_to = req.body.price_to;
    const vehicle_type = req.body.vehicle_type;
    /*console.log(make);
    console.log(model);
    console.log(year_from);
    console.log(year_to);
    console.log(price_from);
    console.log(price_to);
    console.log(vehicle_type);*/

    
    connection.query("select * FROM autos join makes on autos.idMake=makes.idMake join models on autos.idModel=models.idModel and models.idMake=makes.idMake join vehicletypes on autos.idVehicleType=vehicletypes.idVehicleType where makes.make like ? && models.model like ? && autos.year >= ? && autos.year <= ? && autos.price >= ? && autos.price <= ? && vehicletypes.vehicletype like ?", [make, model, year_from, year_to,price_from, price_to, vehicle_type], function(err, data){
      if(err){
        return console.log(err);
      }
      //console.log(data);

      res.render("catalog.hbs",{
        autos: data
      });
    });
});

app.get('/page/:id', urlencodedParser, function(req, res) {
  
  if(!req.body) return res.sendStatus(400);
  var idAuto = req.params.id;
  //console.log(idAuto);

  
  connection.query("select * FROM autos join makes on autos.idMake=makes.idMake join models on autos.idModel=models.idModel and models.idMake=makes.idMake join vehicletypes on autos.idVehicleType=vehicletypes.idVehicleType where autos.idAuto = ?", [idAuto], function(err, data){
    if(err){
      return console.log(err);
    }

    connection.query("select * FROM TI join MotorTypes on TI.idMotorType=MotorTypes.idMotorType join Drive on TI.idDrive=Drive.idDrive join Transmission on TI.idTransmission=Transmission.idTransmission where TI.idTI = ?", [data[0].idTI], function(err, data1){
      if(err){
        return console.log(err);
      }

      res.render("page.hbs",{
        auto: data,
        TI: data1
      });
    });
  });
});

//Форма заявок
app.post('/contact', urlencodedParser, function(req, res) {
  
  if(!req.body) return res.sendStatus(400);
  const name = req.body.name;
  const TelNumber = req.body.tel;
  
  connection.query("insert applications(Name, TelNumber) values(?,?) ", [name, TelNumber], function(err, data){
    if(err) return console.log(err);
    console.log(data);
    res.redirect("/contact");
  });
});

app.use(function(err, req, res, next){
  console.log(err.stack);    // e.g., Not valid name
  return res.status(500).send('Internal Server Occured');
});
app.listen(3000); 





/*connection.end(function(err) {
  if (err) {
    return console.log("Ошибка: " + err.message);
  }
  console.log("Подключение закрыто");
});*/

//логирование
/*app.use(function(request, response, next){
     
  let now = new Date();
  let hour = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  let data = `${hour}:${minutes}:${seconds} ${request.method} ${request.url} ${request.get("user-agent")}`;
  fs.appendFile("server.log", data + '\r\n', function(){});
  next();
});*/
