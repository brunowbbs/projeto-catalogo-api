import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

import UsuarioModel from "../models/userModel";

type BodyRegister = {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
};

export const registerController = async (
  request: Request,
  response: Response
) => {
  try {
    const body: BodyRegister = request.body;

    const userExists = await UsuarioModel.findOne({ email: body.email });

    if (userExists) {
      return response.status(400).json({ message: "Email ja cadastrado" });
    }

    body.senha = bcryptjs.hashSync(body.senha, 5);

    await UsuarioModel.create(body);

    return response.json({
      message: `${body.nome} foi cadastrado com sucesso`,
    });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

type BodyAuth = {
  email: string;
  senha: string;
};

export const authController = async (request: Request, response: Response) => {
  //EMAIL e SENHA

  const body: BodyAuth = request.body;

  try {
    const usuario = await UsuarioModel.findOne({ email: body.email });

    if (!usuario) {
      return response.status(404).json({ message: "Usuario nao existe" });
    }

    const resultadoComparacaoSenha = bcryptjs.compareSync(
      body.senha,
      usuario.senha
    );

    if (!resultadoComparacaoSenha) {
      return response
        .status(400)
        .json({ message: "Senha e/ou email invalidos" });
    }

    const token = jsonwebtoken.sign(
      { id: usuario._id },
      process.env.SECRET_KEY || ""
    );

    return response.json({
      email: usuario.email,
      nome: usuario.nome,
      token: token,
    });
  } catch (error) {
    return response.status(500).json(error);
  }
};
