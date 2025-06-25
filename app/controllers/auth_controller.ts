import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { authValidator } from '#validators/auth_user'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  public async login({ request, response }: HttpContext) {
    const data = request.only(['email', 'password'])

    // Validando os dados do login usando o validador
    const payload = await authValidator.validate(data)

    // Procurando o usuário pelo email
    const user = await User.findBy('email', payload.email)
    if (!user) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }

    // Verificando a senha
    if (!(await hash.verify(user.password, payload.password))) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }

    // Gerando o token de acesso
    const token = await User.accessTokens.create(user)

    return response.status(201).json({
      user,
      token: {
        type: 'bearer',
        value: token.value!.release(),
      },
    })
  }
}
