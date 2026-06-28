import jwt from "jsonwebtoken";

const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acceso denegado. Token inexistente." });
  }

  try {
    const datosVerificados = jwt.verify(token, process.env.TOKEN);
    req.usuario = datosVerificados;
    next();
  } catch (error) {
    res.status(403).json({ message: "Token inválido o expirado" });
  }
};

export default verificarToken;
