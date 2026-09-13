const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");
process.env.SECRET_KEY = process.env.SECRET_KEY || "test-secret-key";
process.env.SALT_ROUNDS = process.env.SALT_ROUNDS || "10";
jest.setTimeout(30000); 

const app = require("../app");
const User = require("../models/User");

let mongod;

const signToken = (user) =>
  jwt.sign({ _id: user._id, role: user.role }, process.env.SECRET_KEY, {
    expiresIn: "1h"
  });

const createUser = async ({
  fullName,
  email,
  role,
  assignedTherapist = null,
  isDeleted = false
}) => {
  const password = await bcrypt.hash("Passw0rd!", +process.env.SALT_ROUNDS);
  return User.create({
    fullName,
    email,
    password,
    role,
    isConfirmed: true,
    assignedTherapist,
    isDeleted
  });
};

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

describe("PUT /api/users/assign-therapist/:patientId", () => {
  test("rejects requests without a token", async () => {
    const patient = await createUser({
      fullName: "P1",
      email: "p1@test.com",
      role: "patient"
    });

    const res = await request(app).put(
      `/api/users/assign-therapist/${patient._id}`
    );

    expect(res.status).toBe(401);
  });

  test("rejects requests from a patient account", async () => {
    const patient = await createUser({
      fullName: "P1",
      email: "p1@test.com",
      role: "patient"
    });
    const other = await createUser({
      fullName: "P2",
      email: "p2@test.com",
      role: "patient"
    });
    const token = signToken(patient);

    const res = await request(app)
      .put(`/api/users/assign-therapist/${other._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  test("rejects an invalid patientId format", async () => {
    const therapist = await createUser({
      fullName: "T1",
      email: "t1@test.com",
      role: "therapist"
    });
    const token = signToken(therapist);

    const res = await request(app)
      .put("/api/users/assign-therapist/not-a-valid-id")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  test("returns 404 when the patient does not exist", async () => {
    const therapist = await createUser({
      fullName: "T1",
      email: "t1@test.com",
      role: "therapist"
    });
    const token = signToken(therapist);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/users/assign-therapist/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  test("returns 404 when the target id belongs to a therapist, not a patient", async () => {
    const therapist = await createUser({
      fullName: "T1",
      email: "t1@test.com",
      role: "therapist"
    });
    const anotherTherapist = await createUser({
      fullName: "T2",
      email: "t2@test.com",
      role: "therapist"
    });
    const token = signToken(therapist);

    const res = await request(app)
      .put(`/api/users/assign-therapist/${anotherTherapist._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  test("returns 404 when the patient is soft-deleted", async () => {
    const therapist = await createUser({
      fullName: "T1",
      email: "t1@test.com",
      role: "therapist"
    });
    const patient = await createUser({
      fullName: "P1",
      email: "p1@test.com",
      role: "patient",
      isDeleted: true
    });
    const token = signToken(therapist);

    const res = await request(app)
      .put(`/api/users/assign-therapist/${patient._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  test("successfully assigns an unassigned patient to the therapist", async () => {
    const therapist = await createUser({
      fullName: "T1",
      email: "t1@test.com",
      role: "therapist"
    });
    const patient = await createUser({
      fullName: "P1",
      email: "p1@test.com",
      role: "patient"
    });
    const token = signToken(therapist);

    const res = await request(app)
      .put(`/api/users/assign-therapist/${patient._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assignedTherapist._id.toString()).toBe(
      therapist._id.toString()
    );

    const updated = await User.findById(patient._id);
    expect(updated.assignedTherapist.toString()).toBe(
      therapist._id.toString()
    );
  });

  test("rejects assigning a patient that is already assigned to another therapist", async () => {
    const therapistA = await createUser({
      fullName: "TA",
      email: "ta@test.com",
      role: "therapist"
    });
    const therapistB = await createUser({
      fullName: "TB",
      email: "tb@test.com",
      role: "therapist"
    });
    const patient = await createUser({
      fullName: "P1",
      email: "p1@test.com",
      role: "patient",
      assignedTherapist: therapistA._id
    });
    const token = signToken(therapistB);

    const res = await request(app)
      .put(`/api/users/assign-therapist/${patient._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);

    const unchanged = await User.findById(patient._id);
    expect(unchanged.assignedTherapist.toString()).toBe(
      therapistA._id.toString()
    );
  });

  test("rejects a duplicate assignment to the same therapist", async () => {
    const therapist = await createUser({
      fullName: "T1",
      email: "t1@test.com",
      role: "therapist"
    });
    const patient = await createUser({
      fullName: "P1",
      email: "p1@test.com",
      role: "patient"
    });
    const token = signToken(therapist);

    const first = await request(app)
      .put(`/api/users/assign-therapist/${patient._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(first.status).toBe(200);

    const second = await request(app)
      .put(`/api/users/assign-therapist/${patient._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(second.status).toBe(400);
  });
});

describe("GET /api/users/unassigned-patients", () => {
  test("rejects requests without a token", async () => {
    const res = await request(app).get("/api/users/unassigned-patients");
    expect(res.status).toBe(401);
  });

  test("rejects requests from a patient account", async () => {
    const patient = await createUser({
      fullName: "P1",
      email: "p1@test.com",
      role: "patient"
    });
    const token = signToken(patient);

    const res = await request(app)
      .get("/api/users/unassigned-patients")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  test("returns only non-deleted patients with no assigned therapist", async () => {
    const therapist = await createUser({
      fullName: "T1",
      email: "t1@test.com",
      role: "therapist"
    });
    const unassigned = await createUser({
      fullName: "P1",
      email: "p1@test.com",
      role: "patient"
    });
    await createUser({
      fullName: "P2",
      email: "p2@test.com",
      role: "patient",
      assignedTherapist: therapist._id
    });
    await createUser({
      fullName: "P3",
      email: "p3@test.com",
      role: "patient",
      isDeleted: true
    });

    const token = signToken(therapist);
    const res = await request(app)
      .get("/api/users/unassigned-patients")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0]._id.toString()).toBe(unassigned._id.toString());
  });
});
