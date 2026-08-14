
from app import db
from app.models import Project, ProjectReport, User
from datetime import datetime
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
        # Add project ID to make filename unique
        filename = f"project_{project_id}_{filename}"
        filepath = os.path.join(ProjectService.UPLOAD_FOLDER, filename)

        # Save file
        file.save(filepath)
        return filename

    @staticmethod
    def create_project(user_id, data, file=None):
        """Create a new project"""
        summary = data.get('summary')
        if not summary:
            raise ValueError('Project summary is required')

        priority = data.get('priority', 'medium').lower()
        status = data.get('status', 'active').lower()
        labels = data.get('labels')
        description = data.get('description')
        reporter = data.get('reporter')
        due_date = ProjectService._parse_date(data.get('due_date'))
        start_date = ProjectService._parse_date(data.get('start_date'))

        if priority not in ProjectService.ALLOWED_PRIORITIES:
            raise ValueError('Priority must be one of low, medium, high, critical')

        if status not in ProjectService.ALLOWED_STATUS:
            raise ValueError('Status must be one of open, in_progress, review, closed, cancelled')

        if isinstance(labels, list):
            labels = ','.join([str(label).strip() for label in labels if label is not None])
        elif labels is not None:
            labels = str(labels).strip()

        if not User.query.get(user_id):
            raise ValueError('User not found')

        # Create the project first (without attachment)
        project = Project(
            user_id=user_id,
            summary=summary,
            description=description,
            priority=priority,
            status=status,
            labels=labels,
            due_date=due_date,
            start_date=start_date,
            reporter=reporter,
            attachment=None,
        )

        db.session.add(project)
        db.session.flush()  # Get the project ID without committing

        # Handle file upload if provided
        if file:
            try:
                attachment_filename = ProjectService._save_file(file, project.id)
                project.attachment = attachment_filename
            except Exception as e:
                db.session.rollback()
                raise ValueError(f'File upload failed: {str(e)}')

        db.session.commit()
        return project.to_dict()

    @staticmethod
    def get_projects(user_id):
        """Get all projects for a user"""
        projects = Project.query.filter_by(user_id=user_id).all()
        return [project.to_dict() for project in projects]

    @staticmethod
    def get_project_by_id(user_id, project_id):
        """Get a specific project by ID"""
        project = Project.query.filter_by(id=project_id, user_id=user_id).first()
        if not project:
            raise ValueError('Project not found')
        
        project_dict = project.to_dict()
        project_dict['reports'] = [report.to_dict() for report in project.reports]
        return project_dict

    @staticmethod
    def update_project(user_id, project_id, data, file=None):
        """Update a project"""
        project = Project.query.filter_by(id=project_id, user_id=user_id).first()
        if not project:
            raise ValueError('Project not found')

        # Update fields if provided
        if 'summary' in data:
            project.summary = data['summary']
        if 'description' in data:
            project.description = data['description']
        if 'priority' in data:
            priority = data['priority'].lower()
            if priority not in ProjectService.ALLOWED_PRIORITIES:
                raise ValueError('Priority must be one of low, medium, high, critical')
            project.priority = priority
        if 'status' in data:
            status = data['status'].lower()
            if status not in ProjectService.ALLOWED_STATUS:
                raise ValueError('Status must be one of open, in_progress, review, closed, cancelled')
            project.status = status
        if 'labels' in data:
            labels = data['labels']
            if isinstance(labels, list):
                labels = ','.join([str(label).strip() for label in labels if label is not None])
            project.labels = labels
        if 'reporter' in data:
            project.reporter = data['reporter']
        if 'due_date' in data:
            project.due_date = ProjectService._parse_date(data['due_date'])
        if 'start_date' in data:
            project.start_date = ProjectService._parse_date(data['start_date'])

        # Handle file upload if provided
        if file:
            try:
                # Delete old file if it exists
                if project.attachment and os.path.exists(os.path.join(ProjectService.UPLOAD_FOLDER, project.attachment)):
                    try:
                        os.remove(os.path.join(ProjectService.UPLOAD_FOLDER, project.attachment))
                    except:
                        pass  # Continue even if old file deletion fails

                attachment_filename = ProjectService._save_file(file, project.id)
                project.attachment = attachment_filename
            except Exception as e:
                raise ValueError(f'File upload failed: {str(e)}')

        project.updated_at = datetime.utcnow()
        db.session.commit()

        return project.to_dict()

    @staticmethod
    def delete_project(user_id, project_id):
        """Delete a project"""
        project = Project.query.filter_by(id=project_id, user_id=user_id).first()
        if not project:
            raise ValueError('Project not found')

        # Delete attached file if it exists
        if project.attachment:
            file_path = os.path.join(ProjectService.UPLOAD_FOLDER, project.attachment)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except:
                    pass  # Continue even if file deletion fails

        db.session.delete(project)
        db.session.commit()
        return True

    @staticmethod
    def create_report(user_id, project_id, data, file=None):
        """Create a project report"""
        project = Project.query.filter_by(id=project_id, user_id=user_id).first()
        if not project:
            raise ValueError('Project not found')

        title = data.get('title')
        if not title:
            raise ValueError('Report title is required')

        content = data.get('content', '')
        file_path = None
        file_name = None
        file_size = None

        # Handle file upload
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
        project = Project.query.filter_by(id=project_id, user_id=user_id).first()
        if not project:
            raise ValueError('Project not found')

        reports = ProjectReport.query.filter_by(project_id=project_id).all()
        return [report.to_dict() for report in reports]

    @staticmethod
    def get_report_by_id(user_id, project_id, report_id):
        """Get a specific report"""
        project = Project.query.filter_by(id=project_id, user_id=user_id).first()
        if not project:
            raise ValueError('Project not found')

        report = ProjectReport.query.filter_by(id=report_id, project_id=project_id).first()
        if not report:
            raise ValueError('Report not found')

        return report.to_dict()

    @staticmethod
    def delete_report(user_id, project_id, report_id):
        """Delete a report"""
        project = Project.query.filter_by(id=project_id, user_id=user_id).first()
        if not project:
            raise ValueError('Project not found')

        report = ProjectReport.query.filter_by(id=report_id, project_id=project_id).first()
        if not report:
            raise ValueError('Report not found')

        # Delete file if exists
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
            return datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return None