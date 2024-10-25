import dotenv from "dotenv";
import express, { Request, Response , NextFunction} from "express";
import cors from "cors"
dotenv.config();

const app = express();
const port = process.env.PORT_SERVER? process.env.PORT_SERVER : 8000;





app.use(express.json());
app.use(cors())
app.use(MiddlewareErrorHandler)
// agregar rutas

  app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
  });
} catch (error) {
  console.error("Error inicializando el servidor:", error);
}
