"""add primary_city to user

Revision ID: 003
Revises: 002
Create Date: 2024-11-23

"""
from alembic import op
import sqlalchemy as sa


revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('primary_city', sa.String(length=100), nullable=True))


def downgrade():
    op.drop_column('users', 'primary_city')
