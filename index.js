import express from "express";
import pkg from "pg";
import cors from "cors";

const app = express(),
  port = 3000,
  { Pool } = pkg,
  pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "",
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
  try {
    const posts = await getPosts();
    res.json(posts);
  } catch (error) {
    res.json({
      message: err.message,
      err,
    });
  }
});

app.post("/posts", async (req, res) => {
  try {
    const like = 0;
    const { titulo, url, descripcion } = req.body;
    if (!titulo || !url || !descripcion) {
      return res.status(400).json({
        message:
          "El Titulo, URL y Descripcion son requeridos y no pueden ser nulos o indefinidos.",
      });
    }
    const consulta = `insert into posts(titulo, img, descripcion,likes)values($1,$2,$3,$4)`;
    const values = [titulo, url, descripcion, like];
    //console.log(values);

    await pool.query(consulta, values);
    res.status(200).send("Nuevo Post Añadido");
  } catch (err) {
    const { code } = err;
    if (code == "23502") {
      res
        .status(400)
        .send(
          "Se ha violado la restricción NOT NULL en uno de los campos de la tabla"
        );
    } else {
      res.status(500).json({
        message: err.message,
        err,
      });
    }
  }
});

app.put("/posts/like/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const values = [id];
    if (!id) {
      throw new Error(
        "El ID es requeridos y no pueden ser nulos o indefinidos."
      );
    }
    const result = await pool.query(
      "UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *;",
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Error");
    }

    res.send({
      message: "likes modificada correctamente",
      post: result.rows[0],
    });
  } catch ({ code, message }) {
    //console.error(err);
    res.status(code).send(message);
    res.status(500).send("Error al modificar Post");
    //res.json({ message: err.message, err });
  }
});

app.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const values = [id];
    const result = await pool.query(
      "delete from posts WHERE id = $1  RETURNING *",
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Error");
    }

    res.send({
      message: "Post Eliminado correctamente",
    });
  } catch (err) {
    //console.error(error);
    res.status(500).send("Error al eliminar Post");
    res.json({ msg: err.message, err });
  }
});

app.listen(port, console.log(`Servidor en puerto ${port}`));
