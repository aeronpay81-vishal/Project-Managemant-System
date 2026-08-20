from app import db
from app.models import Task, User, Project
from datetime import datetime


class TaskService:
    """Service for task business logic"""

    ALLOWED_PRIORITIES = {'low', 'medium', 'high', 'critical'}
    ALLOWED_STATUS = {'todo', 'in_progress', 'done'}

    @staticmethod
    def _validate_assignment(user_id, assigned_to):
        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        if assigned_to is None or assigned_to == '':
            return None

        try:
            assigned_to_id = int(assigned_to)
        except (ValueError, TypeError):
            raise ValueError('Invalid assigned_to user ID')

        assigned_user = User.query.get(assigned_to_id)
        if not assigned_user:
            raise ValueError('Assigned user not found')

        if current_user.role != 'manager' and assigned_to_id != user_id:
            raise ValueError('Only managers can assign tasks to other users')

        return assigned_user.id

    @staticmethod
    def _validate_project(project_id):
        if project_id is None or project_id == '':
            return None
        try:
            p_id = int(project_id)
        except (ValueError, TypeError):
            raise ValueError('Invalid project ID')

        project = Project.query.get(p_id)
        if not project:
            raise ValueError('Associated project not found')
        return project.id

    @staticmethod
    def create_task(user_id, data):
        summary = data.get('summary')
        if not summary or not str(summary).strip():
            raise ValueError('Task summary is required')

        priority = str(data.get('priority', 'medium')).strip().lower()
        status = str(data.get('status', 'todo')).strip().lower()
        labels = data.get('labels')
        description = data.get('description')
        reporter = data.get('reporter')
        attachment = data.get('attachment')
        due_date = TaskService._parse_date(data.get('due_date'))
        start_date = TaskService._parse_date(data.get('start_date'))
        assigned_to = data.get('assigned_to')
        project_id = data.get('project_id')

        if priority not in TaskService.ALLOWED_PRIORITIES:
            raise ValueError('Priority must be one of low, medium, high, critical')

        if status not in TaskService.ALLOWED_STATUS:
            raise ValueError('Status must be one of todo, in_progress, done')

        if isinstance(labels, list):
            labels = ','.join([str(label).strip() for label in labels if label is not None])
        elif labels is not None:
            labels = str(labels).strip()

        if not User.query.get(user_id):
            raise ValueError('User not found')

        assigned_to = TaskService._validate_assignment(user_id, assigned_to)
        project_id = TaskService._validate_project(project_id)

        task = Task(
            user_id=user_id,
            assigned_to=assigned_to,
            project_id=project_id,
            summary=str(summary).strip(),
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
    def get_tasks(user_id, project_id=None):
        current_user = User.query.get(user_id)
        if not current_user:
            return []

        query = Task.query

        # If project_id filter is provided
        if project_id:
            try:
                p_id = int(project_id)
                query = query.filter(Task.project_id == p_id)
            except (ValueError, TypeError):
                pass

        if current_user.role == 'manager':
            # Manager can view all tasks, or tasks in their projects / created by / assigned to
            tasks = query.order_by(Task.created_at.desc()).all()
        else:
            # Regular user views their own created or assigned tasks
            tasks = query.filter(
                (Task.user_id == user_id) | (Task.assigned_to == user_id)
            ).order_by(Task.created_at.desc()).all()

        return [task.to_dict() for task in tasks]

    @staticmethod
    def get_task_by_id(user_id, task_id):
        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        if current_user.role == 'manager':
            task = Task.query.filter(Task.id == task_id).first()
        else:
            task = Task.query.filter(
                Task.id == task_id,
                ((Task.user_id == user_id) | (Task.assigned_to == user_id))
            ).first()

        if not task:
            raise ValueError('Task not found')
        return task.to_dict()

    @staticmethod
    def update_task(user_id, task_id, data):
        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        if current_user.role == 'manager':
            task = Task.query.filter(Task.id == task_id).first()
        else:
            task = Task.query.filter(
                Task.id == task_id,
                ((Task.user_id == user_id) | (Task.assigned_to == user_id))
            ).first()

        if not task:
            raise ValueError('Task not found')

        if 'summary' in data:
            task.summary = str(data.get('summary') or task.summary).strip()
        if 'description' in data:
            task.description = data.get('description')
        if 'priority' in data:
            priority = str(data.get('priority', task.priority)).strip().lower()
            if priority not in TaskService.ALLOWED_PRIORITIES:
                raise ValueError('Priority must be one of low, medium, high, critical')
            task.priority = priority
        if 'status' in data:
            status = str(data.get('status', task.status)).strip().lower()
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
        if 'assigned_to' in data:
            task.assigned_to = TaskService._validate_assignment(user_id, data.get('assigned_to'))
        if 'project_id' in data:
            task.project_id = TaskService._validate_project(data.get('project_id'))

        db.session.commit()
        return task.to_dict()

    @staticmethod
    def delete_task(user_id, task_id):
        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        if current_user.role == 'manager':
            task = Task.query.filter(Task.id == task_id).first()
        else:
            task = Task.query.filter(
                Task.id == task_id,
                ((Task.user_id == user_id) | (Task.assigned_to == user_id))
            ).first()

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
            str_val = str(value).strip()
            if str_val.endswith('Z'):
                str_val = str_val[:-1]
            if '.' in str_val:
                str_val = str_val.split('.')[0]
            return datetime.fromisoformat(str_val)
        except Exception:
            try:
                return datetime.strptime(str_val[:10], '%Y-%m-%d')
            except Exception:
                raise ValueError('Date must be a valid date format, e.g. YYYY-MM-DD or ISO 8601')
