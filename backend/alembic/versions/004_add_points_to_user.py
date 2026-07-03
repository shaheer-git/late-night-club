"""add points to user

Revision ID: 004
Revises: 003
Create Date: 2024-11-23

"""
from alembic import op
import sqlalchemy as sa


revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('points', sa.Integer(), server_default='0', nullable=False))


def downgrade():
    op.drop_column('users', 'points')
