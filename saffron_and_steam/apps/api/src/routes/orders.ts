import { Router } from "express";
import { env } from "../config/env";
import { notFound } from "../lib/http-error";
import { availabilityQuery, orderInput, parse, reservationInput, tokenInput } from "../schemas";
import { createOrder, getOrder, payOrderDemo } from "../services/orders";
import { createReservation, getAvailability, getReservation, payReservationDemo } from "../services/reservations";

// Orders and table bookings. Guests open them with the reference plus the token that
// came back when they were created (it's in their tracking link).

export const ordersRouter = Router();

ordersRouter.post("/orders", async (req, res) => {
  const { order, token } = await createOrder(parse(orderInput, req.body));
  res.status(201).json({ order, token });
});

ordersRouter.get("/orders/:ref", async (req, res) => {
  res.json({ order: await getOrder(req.params.ref, req.query.token) });
});

ordersRouter.get("/reservations/availability", async (req, res) => {
  const { date, period, party } = parse(availabilityQuery, req.query);
  res.json({ slots: await getAvailability(date, period, party) });
});

ordersRouter.post("/reservations", async (req, res) => {
  const { booking, token } = await createReservation(parse(reservationInput, req.body));
  res.status(201).json({ booking, token });
});

ordersRouter.get("/reservations/:ref", async (req, res) => {
  res.json({ booking: await getReservation(req.params.ref, req.query.token) });
});

// Demo payment screen only. Razorpay (phase 6) replaces these with a signed checkout
// callback and a webhook; with DEMO_MODE=false they don't exist.
ordersRouter.post("/orders/:ref/demo-payment", async (req, res) => {
  if (!env.DEMO_MODE) throw notFound("Route");
  const { token } = parse(tokenInput, req.body);
  res.json({ order: await payOrderDemo(req.params.ref, token) });
});

ordersRouter.post("/reservations/:ref/demo-payment", async (req, res) => {
  if (!env.DEMO_MODE) throw notFound("Route");
  const { token } = parse(tokenInput, req.body);
  res.json({ booking: await payReservationDemo(req.params.ref, token) });
});
