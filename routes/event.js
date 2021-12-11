const Router = require("express");
const Event = require("../models/event");
const User = require("../models/user");
const mercadopago = require("mercadopago");
const distance = require('google-distance-matrix');
const passport = require("passport");

const isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.sendStatus(401);
}

mercadopago.configure({
  access_token:
    "TEST-7103077711305655-113021-c4a62acbbc30cccc0cfbc219280a11c8-274464234",
});

const router = Router();

router.post(
  "/event",
  isAuthenticated,
  function (req, res) {
    try {
    Event.findOne({ name: req.body.name }, async (err, doc) => {
      if (err) throw err;
      if (doc) res.send("Event Already Exists");
      if (!doc) {
        const eventDate = new Date(req.body.date);
        var year = eventDate.getFullYear();
        var month = eventDate.getMonth();
        var day = eventDate.getDate();
        var fecha = day + "-" + month + "-" + year;
        const newEvent = new Event({
          name: req.body.name,
          location: req.body.location,
          info: req.body.info,
          event_pay: req.body.event_pay,
          date: fecha,
          expired: false,
          user: req.body.user,
          category: req.body.category,
          subcategory: req.body.subcategory,
        });
        await User.updateOne(
          { _id: req.body.user },
          { $push: { events: newEvent._id } }
        );
        await newEvent.save();
      }
    });
    res.send("Event Created");
    } catch (err) {
      res.send(err);
    }

  }
);

router.get(
  "/event/:name",
  isAuthenticated,
  async (req, res) => {
    const { name } = req.params;
    var response = await Event.find({ name: name });
    console.log(response);
    response.length > 0
      ? res.status(200).send(response)
      : res.status(404).send("No hay eventos");
  }
);

router.get(
  "/eventosCercanos",
  isAuthenticated,
  async (req, res) => {
    distance.key("AIzaSyCf8E0lXmJWdgTw6vgsHOcslcUZ4oidnE0");
    var origin = [`${req.query.lat},${req.query.lng}`];
    console.log(origin);
    var eventos = await Event.find();
    var destinosCoords = eventos.map((event) => {
      return `${event.location.cityCords.lat}, ${event.location.cityCords.lng}`;
    });
    // destinos = destinos[0]
    if (req.query && req.query.lat) {
      distance.matrix(origin, destinosCoords, async function (err, distances) {
        if (err) {
          res.send(err);
        }
        let distancias = distances.rows[0].elements;
        let filtrado = distancias.map((dist) => {
          if (dist.distance.value <= 50000) {
            return distancias.indexOf(dist);
          }
        });
        filtrado = filtrado.filter((e) => {
          if (e === undefined) {
            return;
          }
          if (e || e === 0) {
            return e.toString();
          }
        });

        let eventsSend = eventos.filter((event) => {
          if (filtrado.includes(eventos.indexOf(event))) {
            return event;
          }
        });
        console.log(eventsSend);
        res.send(eventsSend);
      });
    } else {
      res.send([]);
    }
  }
);

router.get(
  "/eventsAll/:parametro",
  isAuthenticated,
  async (req, res) => {
    var parametro = req.params.parametro.toLowerCase();
    var nombre, lugar, info;
    var response = await Event.find(); //Aqui se piden todos los datos de la base de datos
    //Aqui se compara el paremetro de busqueda con los tres principales parametros de cada evento con el fin de encontrar lo que le cliente busca
    nombre = response.filter((evento) => {
      return evento.name.toLowerCase().includes(parametro);
    });
    lugar = response.filter((evento) => {
      return evento.location.cityName.toLowerCase().includes(parametro);
    });
    info = response.filter((evento) => {
      if (evento.info && evento.info.description)
        return evento.info.description.toLowerCase().includes(parametro);
    });

    var resultado = nombre.concat(lugar.concat(info));

    function removeDuplicates(inArray) {
      // esta función elimina los duplicados
      var arr = inArray.concat();
      for (var i = 0; i < arr.length; ++i) {
        for (var j = i + 1; j < arr.length; ++j) {
          if (arr[i].id === arr[j].id) {
            arr.splice(j, 1);
          }
        }
      }
      return arr;
    }

    resultado = removeDuplicates(resultado);
    if (resultado.length === 0) res.status(400).send("Evento no encontrado");
    // Si no se encontro nada devuelve un status 400, no se si es el mas indicado, corrigan si se saben el indicado.
    else res.json(resultado);
  }
);

router.get(
  "/events/filter/categoria-:categoria?/ciudad-:ciudad?/pago-:pago?",
  isAuthenticated,
  async (req, res) => {
    var categoria = req.params.categoria.toLowerCase(); //acepta un string con el nombre parcial o total de una categoria;
    var ciudad = req.params.ciudad.toLowerCase(); //acepta un string con el nombre parcial o total de la ciudad;
    var pago = parseInt(req.params.pago); //acepta 0 para no pago y 1 para pago

    var response = await Event.find(); //Se llama a todos los eventos;

    //A continuacion se declaran las funciones que van a filtrar cada categoria;
    function filtroCat(datos) {
      return datos.filter((evento) => {
        if (evento.categoria) {
          return evento.categoria.toLowerCase().includes(categoria);
        }
      });
    }
    function filtroCity(datos) {
      return datos.filter((evento) => {
        if (evento.location) {
          return evento.location.toLowerCase().includes(ciudad);
        }
      });
    }
    function filtroPago(datos) {
      return datos.filter((evento) => {
        if (pago) return evento.event_pay === true;
        else {
          return evento.event_pay === false;
        }
      });
    }
    // Si hay parametro se filtra y se pasa la informacion al siguiente filtro, si no hay parametro se pasa la informacion sin tocar y asi se repite la secuencia;
    var primerFiltro;

    if (categoria !== "null") {
      primerFiltro = filtroCat(response);
    } else {
      primerFiltro = response;
    }

    var segundoFiltro;

    if (ciudad !== "null") {
      segundoFiltro = filtroCity(primerFiltro);
    } else {
      segundoFiltro = primerFiltro;
    }

    var tercerFiltro;

    if (pago !== "null") {
      tercerFiltro = filtroPago(segundoFiltro);
    } else {
      tercerFiltro = segundoFiltro;
    }

    if (tercerFiltro.length === 0)
      res.status(400).send("No hay eventos que cumplan estos parametros");
    else {
      res.json(tercerFiltro);
    }
  }
);

router.get(
  "/socialEvents",
  isAuthenticated,
  async (req, res) => {
    var response = await Event.find({ category: "social" });
    response.length > 0
      ? res.status(200).send(response)
      : res.status(404).send("No hay eventos");
  }
);

router.get(
  "/sportEvents",
  isAuthenticated,
  async (req, res) => {
    var response = await Event.find({ category: "sports" });
    response.length > 0
      ? res.status(200).send(response)
      : res.status(404).send("No hay eventos");
  }
);

router.get(
  "/allEvents",
  isAuthenticated,
  async (req, res) => {
    var response = await Event.find();
    response.length > 0
      ? res.status(200).send(response)
      : res.status(404).send("No hay Eventos");
  }
);

//Ruta para traer los eventos que iran en la landing page
router.get("/lp-events", async (req, res) => {
  var response = await Event.find({}, "name location date info.imagen").limit(
    6
  );
  response.length > 0
    ? res.status(200).send(response)
    : res.status(404).send("No hay Eventos");
});

router.post(
  "/create_preference",
  isAuthenticated,
  (req, res) => {
    const { title, price, quantity } = req.body;

    let preference = {
      items: [
        {
          title: title,
          unit_price: Number(price),
          quantity: Number(quantity),
        },
      ],
      //back_urls: {
      //	"success": "http://localhost:8080/feedback",
      //	"failure": "http://localhost:8080/feedback",
      //	"pending": "http://localhost:8080/feedback"
      //},
      //auto_return: "approved",
    };
    console.log(preference);

    mercadopago.preferences
      .create(preference)
      .then(function (response) {
        global.id = response.body.id;
        res.json({
          id: response.body.id,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }
);

router.put(
  "/editarEvento/:name",
  isAuthenticated,
  (req, res) => {
    const name = req.params;
    console.log(name);

    Event.findOneAndUpdate(
      { name: name.name },
      {
        name: req.body.name,
        location: req.body.location,
        info: req.body.info,
        event_pay: req.body.event_pay,
        date: req.body.date,
        user: req.body.user,
        category: req.body.category,
        subcategory: req.body.subcategory,
      },
      (error, evento) => {
        if (error) {
          console.log(error);
        }
        console.log(evento);
      }
    );
    console.log("hecho");
    res.status(200).send(req.body);
  }
);

router.delete(
  "/event",
  isAuthenticated,
  (req, res) => {
    const { name } = req.body;
    Event.deleteOne({ name: name })
      .then(res.send("el evento ha sido eliminado"))

      //.catch(res.send("error"));

  }
);

setInterval(function () {
  let yesterday = new Date(new Date().setDate(new Date().getDate() - 1));

  var year = yesterday.getFullYear();
  var month = yesterday.getMonth();
  var day = yesterday.getDate();
  var fecha = day + "-" + month + "-" + year;
  Event.findOneAndUpdate(
    { date: fecha, expired: false },
    {
      expired: true,
    },
    (error, evento) => {
      if (error) {
        console.log(error);
      }
    }
  );
}, 3000000);

module.exports = router;
