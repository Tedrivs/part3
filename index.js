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
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

app.get("/api/info", (request, response) => {
  const info = `Phonebook has info for ${
    persons.length
  } people </br></br>${new Date()}`;
  response.send(info);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
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

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));

  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
