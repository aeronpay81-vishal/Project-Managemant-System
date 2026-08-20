from app import db
from datetime import datetime


class Project(db.Model):
    """Project model for project management"""
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    summary = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.String(50), nullable=False, default='medium')
    status = db.Column(db.String(50), nullable=False, default='active')
    labels = db.Column(db.String(255), nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    start_date = db.Column(db.DateTime, nullable=True)
    reporter = db.Column(db.String(120), nullable=True)
    attachment = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', foreign_keys=[user_id], backref='projects')
    assignee = db.relationship('User', foreign_keys=[assigned_to], backref='projects_assigned')
    reports = db.relationship('ProjectReport', backref='project', cascade='all, delete-orphan')

    def to_dict(self):
        task_list = [t.to_dict() for t in self.tasks] if hasattr(self, 'tasks') and self.tasks else []
        return {
            'id': self.id,
            'user_id': self.user_id,
            'assigned_to': self.assigned_to,
            'assignee': {
                'id': self.assignee.id,
                'username': self.assignee.username,
                'full_name': self.assignee.full_name,
                'email': self.assignee.email,
                'role': self.assignee.role,
            } if self.assignee else None,
            'creator': {
                'id': self.user.id,
                'username': self.user.username,
                'full_name': self.user.full_name,
                'email': self.user.email,
                'role': self.user.role,
            } if self.user else None,
            'summary': self.summary,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'labels': [l.strip() for l in self.labels.split(',') if l.strip()] if self.labels else [],
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'reporter': self.reporter,
            'attachment': self.attachment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'tasks': task_list,
            'assignments': [
                {
                    'id': t['id'],
                    'assigned_to': t['assigned_to'],
                    'priority': t['priority'],
                    'status': t['status'],
                    'start_date': t['start_date'],
                    'due_date': t['due_date'],
                    'task_detail': t.get('description') or t.get('summary'),
                    'summary': t.get('summary'),
                    'assignee': t.get('assignee'),
                } for t in task_list
            ] if task_list else [],
            'task_count': len(task_list),
        }


class ProjectReport(db.Model):
    """Project Report model for tracking project reporting with files"""
    __tablename__ = 'project_reports'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=True)
    file_path = db.Column(db.String(255), nullable=True)
    file_name = db.Column(db.String(255), nullable=True)
    file_size = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'title': self.title,
            'content': self.content,
            'file_name': self.file_name,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
