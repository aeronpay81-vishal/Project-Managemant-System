from app import db
from app.models import Project, ProjectReport, User, Task
from app.services.task_service import TaskService
from datetime import datetime
import json
import os
from werkzeug.utils import secure_filename


class ProjectService:
    """Service for project business logic"""

    ALLOWED_PRIORITIES = {'low', 'medium', 'high', 'critical'}
    ALLOWED_STATUS = {'open', 'in_progress', 'review', 'closed', 'cancelled', 'active', 'on_hold', 'completed'}
    UPLOAD_FOLDER = 'instance/uploads/projects'
    ALLOWED_EXTENSIONS = {'pdf'}

    @staticmethod
    def _allowed_file(filename):
        """Check if file extension is allowed"""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ProjectService.ALLOWED_EXTENSIONS

    @staticmethod
    def _save_file(file, project_id):
        """Save uploaded file and return filename"""
        if not file or file.filename == '':
            return None

        if not ProjectService._allowed_file(file.filename):
            raise ValueError('Only PDF files are allowed')

        # Create upload folder if it doesn't exist
        os.makedirs(ProjectService.UPLOAD_FOLDER, exist_ok=True)

        # Generate secure filename
        filename = secure_filename(file.filename)
        filename = f"project_{project_id}_{filename}"
        filepath = os.path.join(ProjectService.UPLOAD_FOLDER, filename)

        # Save file
        file.save(filepath)
        return filename

    @staticmethod
    def create_project(user_id, data, file=None):
        """Create a new project along with its task assignments"""
        summary = data.get('summary')
        if not summary:
            raise ValueError('Project summary is required')

        priority = str(data.get('priority', 'medium')).strip().lower()
        status = str(data.get('status', 'active')).strip().lower()
        labels = data.get('labels')
        description = data.get('description')
        reporter = data.get('reporter')
        due_date = ProjectService._parse_date(data.get('due_date'))
        start_date = ProjectService._parse_date(data.get('start_date'))
        assigned_to_raw = data.get('assigned_to')

        # Parse assignments list if passed as string (from FormData)
        assignments = data.get('assignments')
        if isinstance(assignments, str):
            try:
                assignments = json.loads(assignments)
            except Exception:
                assignments = []

        # If assignments provided, pick values from first assignment if top-level fields are omitted
        if isinstance(assignments, list) and len(assignments) > 0:
            first_a = assignments[0]
            if not assigned_to_raw and first_a.get('assigned_to'):
                assigned_to_raw = first_a.get('assigned_to')
            if not data.get('priority') and first_a.get('priority'):
                priority = str(first_a.get('priority')).strip().lower()
            if not data.get('status') and first_a.get('status'):
                status = str(first_a.get('status')).strip().lower()
            if not start_date and first_a.get('start_date'):
                start_date = ProjectService._parse_date(first_a.get('start_date'))
            if not due_date and first_a.get('due_date'):
                due_date = ProjectService._parse_date(first_a.get('due_date'))

        if priority not in ProjectService.ALLOWED_PRIORITIES:
            raise ValueError('Priority must be one of low, medium, high, critical')

        if status not in ProjectService.ALLOWED_STATUS:
            raise ValueError('Status must be one of open, in_progress, review, closed, cancelled, active, on_hold, completed')

        if isinstance(labels, list):
            labels = ','.join([str(label).strip() for label in labels if label is not None])
        elif labels is not None:
            labels = str(labels).strip()

        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        assigned_to = None
        if assigned_to_raw is not None and str(assigned_to_raw).strip() != '' and str(assigned_to_raw).strip() != '0':
            try:
                assigned_user_id = int(assigned_to_raw)
                assigned_user = User.query.get(assigned_user_id)
                if not assigned_user:
                    raise ValueError('Assigned user not found')
                assigned_to = assigned_user.id
            except (ValueError, TypeError) as e:
                if 'Assigned user not found' in str(e):
                    raise
                pass

        # Create the project
        project = Project(
            user_id=user_id,
            assigned_to=assigned_to,
            summary=str(summary).strip(),
            description=description,
            priority=priority,
            status=status,
            labels=labels,
            due_date=due_date,
            start_date=start_date,
            reporter=reporter or current_user.full_name or current_user.username,
            attachment=None,
        )

        db.session.add(project)
        db.session.flush()

        # Handle file upload if provided
        if file:
            try:
                attachment_filename = ProjectService._save_file(file, project.id)
                project.attachment = attachment_filename
            except Exception as e:
                db.session.rollback()
                raise ValueError(f'File upload failed: {str(e)}')

        # Create Task records for each task assignment
        if isinstance(assignments, list) and len(assignments) > 0:
            for idx, a in enumerate(assignments):
                if not isinstance(a, dict):
                    continue

                a_user_id = a.get('assigned_to')
                try:
                    a_user_id = int(a_user_id) if a_user_id else None
                except (ValueError, TypeError):
                    a_user_id = None

                task_detail = a.get('task_detail')
                task_summary = (
                    task_detail.strip()
                    if task_detail and task_detail.strip()
                    else f"Task {idx + 1}: {project.summary}"
                )

                task_priority = str(a.get('priority') or priority or 'medium').strip().lower()
                if task_priority not in TaskService.ALLOWED_PRIORITIES:
                    task_priority = 'medium'

                task_status = str(a.get('status') or 'todo').strip().lower()
                if task_status in {'open', 'active'}:
                    task_status = 'todo'
                elif task_status in {'closed', 'completed'}:
                    task_status = 'done'
                elif task_status in {'review', 'in_review'}:
                    task_status = 'in_progress'
                elif task_status not in TaskService.ALLOWED_STATUS:
                    task_status = 'todo'

                task_start = ProjectService._parse_date(a.get('start_date')) or start_date
                task_due = ProjectService._parse_date(a.get('due_date')) or due_date

                task = Task(
                    user_id=user_id,
                    assigned_to=a_user_id,
                    project_id=project.id,
                    summary=task_summary,
                    description=task_detail or description,
                    priority=task_priority,
                    status=task_status,
                    labels=labels,
                    due_date=task_due,
                    start_date=task_start,
                    reporter=project.reporter
                )
                db.session.add(task)

        db.session.commit()
        return project.to_dict()

    @staticmethod
    def get_projects(user_id):
        """Get all projects for a user based on their role and assignments"""
        current_user = User.query.get(user_id)
        if not current_user:
            return []

        if current_user.role == 'manager':
            # Manager sees all projects
            projects = Project.query.order_by(Project.created_at.desc()).all()
        else:
            # Normal user sees projects assigned to them or created by them
            projects = Project.query.filter(
                (Project.assigned_to == user_id) | (Project.user_id == user_id)
            ).order_by(Project.created_at.desc()).all()

        return [project.to_dict() for project in projects]

    @staticmethod
    def get_project_by_id(user_id, project_id):
        """Get a specific project by ID"""
        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        if current_user.role == 'manager':
            project = Project.query.filter(Project.id == project_id).first()
        else:
            project = Project.query.filter(
                Project.id == project_id,
                ((Project.user_id == user_id) | (Project.assigned_to == user_id))
            ).first()

        if not project:
            raise ValueError('Project not found')
        
        project_dict = project.to_dict()
        project_dict['reports'] = [report.to_dict() for report in project.reports]
        return project_dict

    @staticmethod
    def update_project(user_id, project_id, data, file=None):
        """Update a project and sync its tasks"""
        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        if current_user.role == 'manager':
            project = Project.query.filter(Project.id == project_id).first()
        else:
            project = Project.query.filter(
                Project.id == project_id,
                ((Project.user_id == user_id) | (Project.assigned_to == user_id))
            ).first()

        if not project:
            raise ValueError('Project not found')

        # Update fields if provided
        if 'summary' in data:
            project.summary = str(data['summary']).strip()
        if 'description' in data:
            project.description = data['description']
        if 'priority' in data:
            priority = str(data['priority']).strip().lower()
            if priority not in ProjectService.ALLOWED_PRIORITIES:
                raise ValueError('Priority must be one of low, medium, high, critical')
            project.priority = priority
        if 'status' in data:
            status = str(data['status']).strip().lower()
            if status not in ProjectService.ALLOWED_STATUS:
                raise ValueError('Status must be one of open, in_progress, review, closed, cancelled, active, on_hold, completed')
            project.status = status
        if 'labels' in data:
            labels = data['labels']
            if isinstance(labels, list):
                project.labels = ','.join([str(label).strip() for label in labels if label is not None])
            elif labels is not None:
                project.labels = str(labels).strip()
        if 'reporter' in data:
            project.reporter = data['reporter']
        if 'due_date' in data:
            project.due_date = ProjectService._parse_date(data['due_date'])
        if 'start_date' in data:
            project.start_date = ProjectService._parse_date(data['start_date'])
        if 'assigned_to' in data:
            assigned_to_raw = data['assigned_to']
            if assigned_to_raw is None or str(assigned_to_raw).strip() == '' or str(assigned_to_raw).strip() == '0':
                project.assigned_to = None
            else:
                assigned_user = User.query.get(int(assigned_to_raw))
                if not assigned_user:
                    raise ValueError('Assigned user not found')
                project.assigned_to = assigned_user.id

        # Handle file upload if provided
        if file:
            try:
                if project.attachment and os.path.exists(os.path.join(ProjectService.UPLOAD_FOLDER, project.attachment)):
                    try:
                        os.remove(os.path.join(ProjectService.UPLOAD_FOLDER, project.attachment))
                    except Exception:
                        pass

                attachment_filename = ProjectService._save_file(file, project.id)
                project.attachment = attachment_filename
            except Exception as e:
                raise ValueError(f'File upload failed: {str(e)}')

        # Sync assignments if provided
        assignments = data.get('assignments')
        if isinstance(assignments, str):
            try:
                assignments = json.loads(assignments)
            except Exception:
                assignments = None

        if isinstance(assignments, list) and len(assignments) > 0:
            # Clear old tasks linked to this project and recreate
            Task.query.filter_by(project_id=project.id).delete()
            for idx, a in enumerate(assignments):
                if not isinstance(a, dict):
                    continue

                a_user_id = a.get('assigned_to')
                try:
                    a_user_id = int(a_user_id) if a_user_id else None
                except (ValueError, TypeError):
                    a_user_id = None

                task_detail = a.get('task_detail')
                task_summary = (
                    task_detail.strip()
                    if task_detail and task_detail.strip()
                    else f"Task {idx + 1}: {project.summary}"
                )

                task_priority = str(a.get('priority') or project.priority or 'medium').strip().lower()
                if task_priority not in TaskService.ALLOWED_PRIORITIES:
                    task_priority = 'medium'

                task_status = str(a.get('status') or 'todo').strip().lower()
                if task_status in {'open', 'active'}:
                    task_status = 'todo'
                elif task_status in {'closed', 'completed'}:
                    task_status = 'done'
                elif task_status in {'review', 'in_review'}:
                    task_status = 'in_progress'
                elif task_status not in TaskService.ALLOWED_STATUS:
                    task_status = 'todo'

                task_start = ProjectService._parse_date(a.get('start_date')) or project.start_date
                task_due = ProjectService._parse_date(a.get('due_date')) or project.due_date

                task = Task(
                    user_id=user_id,
                    assigned_to=a_user_id,
                    project_id=project.id,
                    summary=task_summary,
                    description=task_detail or project.description,
                    priority=task_priority,
                    status=task_status,
                    labels=project.labels,
                    due_date=task_due,
                    start_date=task_start,
                    reporter=project.reporter
                )
                db.session.add(task)

        project.updated_at = datetime.utcnow()
        db.session.commit()

        return project.to_dict()

    @staticmethod
    def delete_project(user_id, project_id):
        """Delete a project"""
        current_user = User.query.get(user_id)
        if not current_user:
            raise ValueError('User not found')

        if current_user.role == 'manager':
            project = Project.query.filter_by(id=project_id).first()
        else:
            project = Project.query.filter_by(id=project_id, user_id=user_id).first()

        if not project:
            raise ValueError('Project not found')

        if project.attachment:
            file_path = os.path.join(ProjectService.UPLOAD_FOLDER, project.attachment)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    pass

        db.session.delete(project)
        db.session.commit()
        return True

    @staticmethod
    def create_report(user_id, project_id, data, file=None):
        """Create a project report"""
        project = Project.query.filter_by(id=project_id).first()
        if not project:
            raise ValueError('Project not found')

        title = data.get('title')
        if not title:
            raise ValueError('Report title is required')

        content = data.get('content', '')
        file_path = None
        file_name = None
        file_size = None

        if file:
            os.makedirs(ProjectService.UPLOAD_FOLDER, exist_ok=True)
            filename = f"{project_id}_{file.filename}"
            file_path = os.path.join(ProjectService.UPLOAD_FOLDER, filename)
            file.save(file_path)
            file_name = file.filename
            file_size = os.path.getsize(file_path)

        report = ProjectReport(
            project_id=project_id,
            title=title,
            content=content,
            file_path=file_path,
            file_name=file_name,
            file_size=file_size,
        )

        db.session.add(report)
        db.session.commit()

        return report.to_dict()

    @staticmethod
    def get_reports(user_id, project_id):
        """Get all reports for a project"""
        project = Project.query.filter_by(id=project_id).first()
        if not project:
            raise ValueError('Project not found')

        reports = ProjectReport.query.filter_by(project_id=project_id).all()
        return [report.to_dict() for report in reports]

    @staticmethod
    def get_report_by_id(user_id, project_id, report_id):
        """Get a specific report"""
        project = Project.query.filter_by(id=project_id).first()
        if not project:
            raise ValueError('Project not found')

        report = ProjectReport.query.filter_by(id=report_id, project_id=project_id).first()
        if not report:
            raise ValueError('Report not found')

        return report.to_dict()

    @staticmethod
    def delete_report(user_id, project_id, report_id):
        """Delete a report"""
        project = Project.query.filter_by(id=project_id).first()
        if not project:
            raise ValueError('Project not found')

        report = ProjectReport.query.filter_by(id=report_id, project_id=project_id).first()
        if not report:
            raise ValueError('Report not found')

        if report.file_path and os.path.exists(report.file_path):
            os.remove(report.file_path)

        db.session.delete(report)
        db.session.commit()
        return True

    @staticmethod
    def _parse_date(date_string):
        """Helper method to parse date strings"""
        if not date_string:
            return None
        if isinstance(date_string, datetime):
            return date_string
        try:
            str_val = str(date_string).strip()
            if str_val.endswith('Z'):
                str_val = str_val[:-1]
            if '.' in str_val:
                str_val = str_val.split('.')[0]
            return datetime.fromisoformat(str_val)
        except Exception:
            try:
                return datetime.strptime(str(date_string)[:10], '%Y-%m-%d')
            except Exception:
                return None