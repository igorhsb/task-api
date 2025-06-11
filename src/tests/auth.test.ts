import request from "supertest";
import app from "../app";

const emailBase: string = "teste21@exemplo.com";
const passwordBase: string = "senha123";

describe("Testes com autenticação", () => {
  let token: string;

  beforeAll(async () => {
    // Cria usuário
    await request(app).post("/auth/register").send({
      email: emailBase,
      password: passwordBase,
    });

    const res = await request(app).post("/auth/generateToken").send({
      email: emailBase,
      password: passwordBase,
    });

    token = res.body.token;
  });

  // createTask
  it("deve acessar rota protegida com token", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Task de teste" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("title");
    expect(res.headers["content-type"]).toMatch(/json/);
  });

  // createTask without token
  it("não deve acessar rota protegida sem token", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Task sem token" });

    expect(res.statusCode).toBe(401); // ou 403, dependendo da lógica do seu middleware
  });

  // updateTask
  it("atualizar task", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Task de teste" })
      .set("Authorization", `Bearer ${token}`);
    
    const taskId = res.body.id;
    const updateRes = await request(app)
      .patch("/tasks/"+taskId)
      .send({ title: "Task de teste atualizada" })
      .set("Authorization", `Bearer ${token}`);

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toHaveProperty("id");
    expect(updateRes.body).toHaveProperty("title");
    expect(updateRes.headers["content-type"]).toMatch(/json/);
  });

  // deleteTask
  it("deletar task", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Task de teste" })
      .set("Authorization", `Bearer ${token}`);
    
    const taskId = res.body.id;
    const deleteRes = await request(app)
      .delete("/tasks/"+taskId)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(204);
  });

  // getTask
  it("Listar tasks", async () => {
    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("tasks");
    expect(res.headers["content-type"]).toMatch(/json/);
  });

});
