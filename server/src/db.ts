import pg from "pg";
import { v4 as uuidv4 } from "uuid"; // importing like this because I was getting some errors before and this is what the uuid documentation recommends
import {
  Customer,
  Name,
  Reservation,
  ReservationParams,
  Restaurant,
} from "./types";

export const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_reservation_planner"
);

export const createTables = async () => {
  const SQL = /*sql*/ `
        DROP TABLE IF EXISTS reservations;
        DROP TABLE IF EXISTS customers;
        DROP TABLE IF EXISTS restaurants;
        
        CREATE TABLE restaurants(
            id UUID PRIMARY KEY,
            name VARCHAR(100)
        );

        CREATE TABLE customers(
            id UUID PRIMARY KEY,
            name VARCHAR(100)
        );

        CREATE TABLE reservations(
            id UUID PRIMARY KEY,
            date DATE NOT NULL,
            party_count SERIAL,
            restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
            customer_id UUID REFERENCES customers(id) NOT NULL
        );
    `;
  await client.query(SQL);
};

export const createCustomer = async ({ name }: Name): Promise<Customer> => {
  const SQL = /*sql*/ `
    INSERT INTO customers(id, name) 
    VALUES($1, $2)
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuidv4(), name]);
  return response.rows[0] as Customer;
};
export const createRestaurant = async ({ name }: Name): Promise<Restaurant> => {
  const SQL = /*sql*/ `
    INSERT INTO restaurants(id, name)
    VALUES($1, $2)
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuidv4(), name]);
  return response.rows[0] as Restaurant;
};
export const createReservation = async ({
  customer_id,
  restaurant_id,
  reservation_date,
}: ReservationParams): Promise<Reservation> => {
  const SQL = /*sql*/ `
    INSERT INTO reservations(id, date, restaurant_id, customer_id)
    VALUES($1, $2, $3, $4)
    RETURNING *;
  `;
  const response = await client.query(SQL, [
    uuidv4(),
    reservation_date,
    restaurant_id,
    customer_id,
  ]);
  return response.rows[0] as Reservation;
};

export const deleteReservation = async (id: string, customer_id: string) => {
  const SQL = /*sql*/ `
    DELETE FROM reservations
    WHERE id = $1 AND customer_id = $2;
  `;
  await client.query(SQL, [id, customer_id]);
};

export const fetchCustomers = async (): Promise<Customer[]> => {
  const SQL = /*sql*/ `
    SELECT *
    FROM customers;
  `;
  const response = await client.query(SQL);
  return response.rows as Customer[];
};
export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  const SQL = /*sql*/ `
    SELECT *
    FROM restaurants;
  `;
  const response = await client.query(SQL);
  return response.rows as Restaurant[];
};
export const fetchReservations = async (): Promise<Reservation[]> => {
  const SQL = /*sql*/ `
    SELECT * 
    FROM reservations;
  `;
  const response = await client.query(SQL);
  return response.rows as Reservation[];
};
