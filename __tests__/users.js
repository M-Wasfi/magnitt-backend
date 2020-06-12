const app = require("../app");
const supertest = require("supertest");
const { setupDB } = require("../helpers/test_setup");
const User = require("../models/user");

const request = supertest(app);

setupDB();

let userId;
let token;

describe("Test the register endpoint", () => {
  test("It should add a new user", async (done) => {
    const response = await request.post("/api/users/register").send({
      userName: "testUser",
      password: "testUserPassword",
      password_confirmation: "testUserPassword",
      email: "testUser@mail.com",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User registered successfully");

    done();
  });
});

describe("Test the login endpoint", () => {
  test("It should return JWT and user data", async (done) => {
    const response = await request.post("/api/users/login").send({
      email: "testUser@mail.com",
      password: "testUserPassword",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("User logged in successfully");

    userId = response.body.data.user._id;
    token = response.body.data.token;

    expect(userId).toBeTruthy();
    expect(token).toBeTruthy();

    done();
  });
});

describe("Test the users get all endpoint", () => {
  test("It should get all the users", async (done) => {
    const response = await request.get("/api/users");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Got all users successfully");

    done();
  });
});

describe("Test the users get by id endpoint", () => {
  test("It should get the user specified by id", async (done) => {
    const response = await request.get(`/api/users/${userId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      `Got user by id: ${userId} successfully`
    );

    done();
  });
});

describe("Test the users put/updateUser endpoint", () => {
  test("It should update the user specified by id", async (done) => {
    const response = await request
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        userName: "testUserUpdate",
        password: "testUserPasswordUpdate",
        email: "testUserUpdate@mail.com",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("User updated successfully");

    done();
  });
});

describe("Test the users delete by id endpoint", () => {
  test("It should delete the user specified by id", async (done) => {
    const response = await request
      .delete(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("User deleted successfully");

    done();
  });
});
