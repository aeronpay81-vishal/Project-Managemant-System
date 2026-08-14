
from flask import request
from app.services import TaskService


class TaskController:
    """Controller for task endpoints"""

    @staticmethod
    def create_task(current_user_id):
        data = request.get_json()
        if not data:
            return {
                'success': False,
                'message': 'No data provided'
            }, 400

        task = TaskService.create_task(current_user_id, data)
        return {
            'success': True,
            'message': 'Task created successfully',
            'data': task
        }, 201

    @staticmethod
    def get_tasks(current_user_id):
        tasks = TaskService.get_tasks(current_user_id)
        return {
            'success': True,
            'data': tasks
        }, 200

    @staticmethod
    def get_task(current_user_id, task_id):
        task = TaskService.get_task_by_id(current_user_id, task_id)
        return {
            'success': True,
            'data': task
        }, 200

    @staticmethod
    def update_task(current_user_id, task_id):
        data = request.get_json()
        if not data:
            return {
                'success': False,
                'message': 'No data provided'
            }, 400

        task = TaskService.update_task(current_user_id, task_id, data)
        return {
            'success': True,
            'message': 'Task updated successfully',
            'data': task
        }, 200

    @staticmethod
    def delete_task(current_user_id, task_id):
        result = TaskService.delete_task(current_user_id, task_id)
        return result, 200


