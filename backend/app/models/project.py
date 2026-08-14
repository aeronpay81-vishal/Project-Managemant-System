
from app import db
from datetime import datetime


class Project(db.Model):
    """Project model for project management"""
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
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

    user = db.relationship('User', backref='projects')
    reports = db.relationship('ProjectReport', backref='project', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'summary': self.summary,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'labels': self.labels.split(',') if self.labels else [],
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'reporter': self.reporter,
            'attachment': self.attachment,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
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
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
