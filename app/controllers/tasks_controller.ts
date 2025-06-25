import type { HttpContext } from '@adonisjs/core/http'
import Task from '#models/task'
import { updateTaskValidator } from '#validators/update_task'
import { storeTaskValidator } from '#validators/store_task'

export default class TasksController {
  // Listar todas as tarefas com filtros
  async index({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const { title, color } = request.qs()

      const query = Task.query().where('userId', user.id)

      if (title) {
        query.whereILike('title', `%${title}%`)
      }

      if (color) {
        query.where('color', color)
      }

      const tasks = await query.orderBy('createdAt', 'desc')
      return tasks
    } catch (error) {
      console.error('Erro ao listar tarefas:', error)
      return response.status(500).json({ message: 'Erro ao buscar tarefas' })
    }
  }

  // Criar nova tarefa
  async store({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const data = await request.validateUsing(storeTaskValidator)

      const task = await Task.create({
        ...data,
        userId: user.id,
      })

      return response.status(201).json(task)
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
      return response.status(400).json({
        message: 'Erro de validação ao criar tarefa',
        errors: error.messages,
      })
    }
  }

  // Buscar tarefa por ID
  async show({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user!
      const task = await Task.query()
        .where('userId', user.id)
        .where('id', params.id)
        .firstOrFail()

      return task
    } catch (error) {
      console.error('Tarefa não encontrada:', error)
      return response.status(404).json({ message: 'Tarefa não encontrada' })
    }
  }

  // Atualizar tarefa
  async update({ auth, params, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const task = await Task.query()
        .where('userId', user.id)
        .where('id', params.id)
        .firstOrFail()

      const data = await request.validateUsing(updateTaskValidator)

      task.merge(data)
      await task.save()

      return task
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
      return response.status(400).json({
        message: 'Erro de validação ao atualizar tarefa',
        errors: error.messages,
      })
    }
  }

  // Deletar tarefa
  async destroy({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user!
      const task = await Task.query()
        .where('userId', user.id)
        .where('id', params.id)
        .firstOrFail()

      await task.delete()
      return response.status(204)
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
      return response.status(500).json({ message: 'Erro ao deletar tarefa' })
    }
  }

  // Alternar favorito
  async toggleFavorite({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user!
      const task = await Task.query()
        .where('userId', user.id)
        .where('id', params.id)
        .firstOrFail()

      task.isFavorite = !task.isFavorite
      await task.save()

      return task
    } catch (error) {
      console.error('Erro ao alternar favorito:', error)
      return response.status(500).json({ message: 'Erro ao atualizar favorito' })
    }
  }

  // Atualizar apenas a cor
  async updateColor({ auth, params, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const task = await Task.query()
        .where('userId', user.id)
        .where('id', params.id)
        .firstOrFail()

      const { color } = request.only(['color'])

      if (!color) {
        return response.status(400).json({ message: 'A cor é obrigatória' })
      }

      task.color = color
      await task.save()

      return task
    } catch (error) {
      console.error('Erro ao atualizar cor:', error)
      return response.status(500).json({ message: 'Erro ao atualizar cor' })
    }
  }
}
