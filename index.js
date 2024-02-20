const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const Person = require("./models/person");

morgan.token("body", function (req, res) {
  if (req.method === "POST") return JSON.stringify(req.body);
  else return " ";
});

app.use(express.static("dist"));
app.use(express.json());
app.use(cors());

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

const errorHandler = (error, request, response, next) => {
  console.log(error.name);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

app.get("/api/info", (request, response, next) => {
  let personLength = 0;
  Person.find({})
    .then((result) => {
      personLength = result.length;
      const info = `Phonebook has info for ${personLength} people </br></br>${new Date()}`;
      response.send(info);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  if (!body.name) {
    return response.status(400).json({
      error: "name missing",
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: "number missing",
    });
  }

  const person = new Person({
    id: Math.floor(Math.random() * 9999999999),
    name: body.name,
    number: body.number ? body.number : "None",
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));

  const id = Number(request.params.id);
});

app.use(errorHandler);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
