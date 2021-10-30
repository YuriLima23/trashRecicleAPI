import { Request, Response } from 'express'
import prisma from '../database/index'
import { cpf as CPF } from 'cpf-cnpj-validator';
import { User } from '.prisma/client';


const create = async (req: Request, res: Response) => {
    try {
        const { name, email, cpf, password, photo, type_user = 1, phone } = req.body
        let new_cpf = removeDotCpf(cpf)

        if (!name || !email || !cpf || !password || !photo || !phone) {
            throw { code: "E001", msg: "Alguns campos estão invalidos, verifique e tente novamente!" }
        }
        if (!CPF.isValid(new_cpf)) {
            throw { code: "E002", msg: "CPF Invalido!" }
        }
        const response = await prisma.user.create({
            data:
            {
                name,
                email,
                cpf: new_cpf,
                photo,
                password,
                type_user,
                phone,
                wallet: {
                   create:{
                       balance:0.0,
                       previous_balance:0.0,
                   }
                }
            }
        })
        return resultSuccess(res, null, "Usuario criado com sucesso")
    } catch (error) {
        return generateExeption(res, error)
    }
}


const list = async (req: Request, res: Response) => {
    try {
        const response = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                phone: true,
                photo: true,
                cpf: true,
                email: true,
                type_user: true,
            }
        })

        return resultSuccess(res, response, '')
    } catch (error) {
        console.log(error)
        return generateExeption(res, error)
    }

}


const remove = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const response = await prisma.user.delete({ where: { id: parseInt(id) } })
        return resultSuccess(res, null, 'Usuario deletado com sucesso')
    } catch (error) {
        console.log(error)
        return generateExeption(res, error)
    }
}

const update = async (req: Request, res: Response) => {
    const { id } = req.params
    const { name, email, photo, type_user = 1, phone } = req.body

    try {
        const response = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                email,
                name,
                photo,
                type_user,
                phone

            }
        })
        return resultSuccess(res, null, 'Usuario atualizado com sucesso')
    } catch (error) {
        console.log(error)
        return generateExeption(res, error)
    }
}

const resultSuccess = (res: Response, data: any, msg: string) => {
    return res.json({ status: 200, data, msg })
}

const generateExeption = (res, error) => {
    console.log(error)
    let msg = ""
    switch (error.code) {
        case 'P2002':
            let errors = []
            let field = error.meta.target
            msg = `Campo ${field} já esta sendo usado`
            return res.json({ status: 400, msg: msg })
        case 'P2025':
            msg = "Usuario não existe"
            return res.json({ status: 400, msg: msg })
        case 'P2003':
            msg = "Não foi possivel deletar usuario, existe referencia"
            return res.json({ status: 400, msg: msg })
        // erros da aplicação --------------------------------------------------
        case 'E002':
            return res.json({ status: 400, msg: error.msg })

        default:
            return res.json({ status: 400, msg: "Erro ao realizar a ação" })


    }
}

const removeDotCpf = (cpf) => {
    cpf = cpf.split('.').join("")
    cpf = cpf.split('-').join("")
    return cpf
}



export = { create, list, remove, update }