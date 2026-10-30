import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.database import Base

# Association table for User <-> Role
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', String(36), ForeignKey('users.id')),
    Column('role_id', String(36), ForeignKey('roles.id'))
)

# Association table for Role <-> Permission
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', String(36), ForeignKey('roles.id')),
    Column('permission_id', String(36), ForeignKey('permissions.id'))
)

class Department(Base):
    __tablename__ = 'departments'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    head_user_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship('User', back_populates='department')

class Role(Base):
    __tablename__ = 'roles'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False) # e.g. "Finance Director", "IT Admin", "HR Director", "Procurement Manager", "Employee"
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    permissions = relationship('Permission', secondary=role_permissions, back_populates='roles')
    users = relationship('User', secondary=user_roles, back_populates='roles')

class Permission(Base):
    __tablename__ = 'permissions'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False) # e.g. "approval:finance", "approval:it_access"
    resource = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    roles = relationship('Role', secondary=role_permissions, back_populates='permissions')

class User(Base):
    __tablename__ = 'users'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(150), unique=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    avatar_url = Column(String(255), nullable=True)
    department_id = Column(String(36), ForeignKey('departments.id'), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship('Department', back_populates='users')
    roles = relationship('Role', secondary=user_roles, back_populates='users')

