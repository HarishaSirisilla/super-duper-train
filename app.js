const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

let dbPath = path.join(__dirname, "todoApplication.db");
let database = null;

app.use(express.json());

let initializeDatabaseAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    app.listen(3000, () => {
      console.log("Server is running successfully");
    });
  } catch (error) {
    console.log(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDatabaseAndServer();

app.get("/todos/", async (request, response) => {
  let sql_query;
  let result;  
  const { status, priority, search_q } = request.query;
  if (status !== undefined) {
    sql_query = `
            SELECT * FROM todo
            WHERE status = '${status}';`;
  } else if (priority !== undefined && status !== undefined) {
    sql_query = `
            SELECT * FROM todo
            WHERE priority = '${priority}' AND status = '${status}';`;
  } else if (priority !== undefined) {
    sql_query = `
        SELECT * FROM todo
        WHERE priority = '${priority}';`;
  }
  else if(search_q !== undefined) {
      sql_query = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%';`;
  }

  result = await database.all(sql_query);
  response.send(result);

});


app.get("/todos/:todoId", async (request, response) => {
    const { todoId } = request.params;
    let sql_query = `
        SELECT * FROM todo
        WHERE id = ${todoId};`;
    let result = await database.get(sql_query);
    response.send(result);
});

app.post("/todos/", async (request, response) => {
    const { id, todo, priority, status} = request.body;
    let sql_query = `
        INSERT INTO todo
            (id, todo, priority, status)
        VALUES (${id}, '${todo}', '${priority}', '${status}');`;
    await database.run(sql_query);
    response.send("Todo Successfully Added");
});

app.put("/todos/:todoId", async (request, response) => {
    let text;
    let sql_query;
    const { todoId } = request.params;
    const { status, priority, todo } = request.body;

    if (status !== undefined) {
        text = "Status";
        sql_query = `
            UPDATE
                todo
            SET
                status = '${status}'
            WHERE
                id = ${todoId};`;        
    }
    else if (priority !== undefined) {
        text = "Priority";
        sql_query = `
            UPDATE
                todo
            SET
                priority = '${priority}'
            WHERE
                id = ${todoId};`;
    }
    else if (todo !== undefined) {
        text = "Todo";
        sql_query = `
            UPDATE
                todo
            SET
                todo = '${todo}'
            WHERE
                id = ${todoId};`;
    }

    await database.run(sql_query);
    response.send(`${text} Updated`);
});

app.delete("/todos/:todoId", async (request, response) => {
    const {todoId} = request.params;
    let sql_query = `
        DELETE FROM todo
        WHERE id = ${todoId};`;
    await database.run(sql_query);
    response.send("Todo Deleted");
});

module.exports = app;