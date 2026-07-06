"""Add B-Tree indexes to category and status

Revision ID: 7ead06884278
Revises: 004
Create Date: 2026-07-05 23:19:34.538119

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7ead06884278'
down_revision: Union[str, None] = '004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(op.f('ix_places_category'), 'places', ['category'], unique=False)
    op.create_index(op.f('ix_places_location'), 'places', ['location'], unique=False)
    op.create_index(op.f('ix_places_status'), 'places', ['status'], unique=False)
    op.alter_column('users', 'points',
               existing_type=sa.INTEGER(),
               nullable=True,
               existing_server_default=sa.text('0'))


def downgrade() -> None:
    op.alter_column('users', 'points',
               existing_type=sa.INTEGER(),
               nullable=False,
               existing_server_default=sa.text('0'))
    op.drop_index(op.f('ix_places_status'), table_name='places')
    op.drop_index(op.f('ix_places_location'), table_name='places')
    op.drop_index(op.f('ix_places_category'), table_name='places')
