
from app import db
from app.models import Task, User
from datetime import datetime


class TaskService:
    """Service for task business logic"""

    ALLOWED_PRIORITIES = {'low', 'medium', 'high'}
    ALLOWED_STATUS = {'todo', 'in_progress', 'done'}

    @staticmethod
    def create_task(user_id, data):
        summary = data.get('summary')
        if not summary:
            raise ValueError('Task summary is required')

        priority = data.get('priority', 'medium').lower()
        status = data.get('status', 'todo').lower()
        labels = data.get('labels')
        description = data.get('description')
        reporter = data.get('reporter')
        attachment = data.get('attachment')
        due_date = TaskService._parse_date(data.get('due_date'))
        start_date = TaskService._parse_date(data.get('start_date'))

        if priority not in TaskService.ALLOWED_PRIORITIES:
            raise ValueError('Priority must be one of low, medium, high')

        if status not in TaskService.ALLOWED_STATUS:
            raise ValueError('Status must be one of todo, in_progress, done')

        if isinstance(labels, list):
            labels = ','.join([str(label).strip() for label in labels if label is not None])
        elif labels is not None:
            labels = str(labels).strip()

        if not User.query.get(user_id):
            raise ValueError('User not found')

        task = Task(
            user_id=user_id,
            summary=summary,
            description=description,
            priority=priority,
            status=status,
            labels=labels,
            due_date=due_date,
            start_date=start_date,
            reporter=reporter,
            attachment=attachment
        )

        db.session.add(task)
        db.session.commit()

        return task.to_dict()

    @staticmethod
    def get_tasks(user_id):
        tasks = Task.query.filter_by(user_id=user_id).order_by(Task.created_at.desc()).all()
        return [task.to_dict() for task in tasks]

    @staticmethod
    def get_task_by_id(user_id, task_id):
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        if not task:
            raise ValueError('Task not found')
        return task.to_dict()

    @staticmethod
    def update_task(user_id, task_id, data):
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        if not task:
            raise ValueError('Task not found')

        if 'summary' in data:
            task.summary = data.get('summary') or task.summary
        if 'description' in data:
            task.description = data.get('description')
        if 'priority' in data:
            priority = str(data.get('priority', task.priority)).lower()
            if priority not in TaskService.ALLOWED_PRIORITIES:
                raise ValueError('Priority must be one of low, medium, high')
            task.priority = priority
        if 'status' in data:
            status = str(data.get('status', task.status)).lower()
            if status not in TaskService.ALLOWED_STATUS:
                raise ValueError('Status must be one of todo, in_progress, done')
            task.status = status
        if 'labels' in data:
            labels = data.get('labels')
            if isinstance(labels, list):
                task.labels = ','.join([str(label).strip() for label in labels if label is not None])
            else:
                task.labels = str(labels).strip() if labels is not None else None
        if 'due_date' in data:
            task.due_date = TaskService._parse_date(data.get('due_date'))
        if 'start_date' in data:
            task.start_date = TaskService._parse_date(data.get('start_date'))
        if 'reporter' in data:
            task.reporter = data.get('reporter')
        if 'attachment' in data:
            task.attachment = data.get('attachment')

        db.session.commit()
        return task.to_dict()

    @staticmethod
    def delete_task(user_id, task_id):
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        if not task:
            raise ValueError('Task not found')

        db.session.delete(task)
        db.session.commit()

        return {
            'success': True,
            'message': 'Task deleted successfully'
        }

    @staticmethod
    def _parse_date(value):
        if value is None or value == '':
            return None
        if isinstance(value, datetime):
            return value

        try:
            return datetime.fromisoformat(value)
        except Exception:
            raise ValueError('Date must be ISO 8601 format, e.g. 2026-08-12T15:30:00')

