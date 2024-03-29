import express, { application } from "express";
import {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  fetchReservations,
  deleteReservation,
} from "./db";

const app = express();
app.use(express.json());

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (error) {
    next(error);
  }
});
app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (error) {
    next(error);
  }
});
app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (error) {
    next(error);
  }
});

app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await deleteReservation(req.params.id, req.params.customer_id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
);

app.post("/api/customers/:customer_id/reservations", async (req, res, next) => {
  try {
    const response = await createReservation({
      reservation_date: new Date(req.body.date),
      restaurant_id: req.body.restaurant_id,
      customer_id: req.params.customer_id,
    });
    res.status(201).send(response);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  console.log("Connecting to database...");
  await client.connect();
  console.log("Connected to database successfully");

  await createTables();
  console.log("Created tables successfully");

  const [Alex, Bob, Alice, Joe] = await Promise.all([
    createCustomer({ name: "Alex" }),
    createCustomer({ name: "Bob" }),
    createCustomer({ name: "Alice" }),
    createCustomer({ name: "Joe" }),
  ]);
  const [RedLobster, OliveGarden, CheesecakeFactory] = await Promise.all([
    createRestaurant({ name: "RedLobster" }),
    createRestaurant({ name: "OliveGarden" }),
    createRestaurant({ name: "CheesecakeFactory" }),
  ]);

  await Promise.all([
    createReservation({
      reservation_date: new Date("2024-04-12"),
      restaurant_id: RedLobster.id,
      customer_id: Alex.id,
    }),
    createReservation({
      reservation_date: new Date("2024-03-20"),
      restaurant_id: CheesecakeFactory.id,
      customer_id: Joe.id,
    }),
  ]);
  console.log("Data seeded");

  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());
  console.log(await fetchReservations());

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Listening on port ${port}`));
};

init();
