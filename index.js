import express from "express";
import pkg from "pg";
import cors from "cors";

const app = express(),
  port = 3000,
  { Pool } = pkg,
  pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "Pnuevo987",
    database: "likeme",
    allowExitOnIdle: true,
  });

app.use(express.json());
app.use(cors());

async function getPosts() {
  const { rows } = await pool.query("select * from posts");
  return rows;
}

app.get("/posts", async (req, res) => {
  const posts = await getPosts();
  res.json(posts);
});

app.post("/posts", async (req, res) => {
  const like = 0;
  const { titulo, url, descripcion } = req.body;
  const consulta = `insert into posts(titulo, img, descripcion,likes)values($1,$2,$3,$4)`;
  const values = [titulo, url, descripcion, like];
  //console.log(values);

  await pool.query(consulta, values);
  res.status(200).send("Nuevo Post Añadido");
});

app.put("/posts/like/:id", async (req, res) => {
  const { id } = req.params;
  //const value = [id];
  //const { likes } = req.body;
  try {
    const query =
      "UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *;";
    const values = [id];
    //    console.log(query);
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).send("Error");
    }

    res.send({
      message: "likes modificada correctamente",
      post: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al modificar Post");
  }
});

app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const values = [id];

  try {
    const query = "delete from posts WHERE id = $1  RETURNING *";

    //console.log(query);
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).send("Error");
    }

    res.send({
      message: "Post Eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al eliminar Post");
  }
});

app.listen(port, console.log(`Servidor en puerto ${port}`));
