"""Initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import geoalchemy2

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("fcm_token", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("is_verified", sa.Boolean, default=False),
        sa.Column("contribution_count", sa.Integer, default=0),
        sa.Column("verification_count", sa.Integer, default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    op.create_table(
        "cities",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("state", sa.String(100), nullable=True),
        sa.Column("country", sa.String(100), nullable=False),
        sa.Column("location", geoalchemy2.Geography("POINT", srid=4326), nullable=False),
        sa.Column("is_active", sa.Boolean, default=True),
    )

    op.create_table(
        "places",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("location", geoalchemy2.Geography("POINT", srid=4326), nullable=False),
        sa.Column("address", sa.String(500), nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("reported_hours", sa.String(100), nullable=True),
        sa.Column("status", sa.String(20), default="unknown"),
        sa.Column("status_updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_verified_by_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("added_by_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("city_id", UUID(as_uuid=True), sa.ForeignKey("cities.id"), nullable=True),
        sa.Column("image_urls", ARRAY(sa.String), default=[]),
        sa.Column("verification_count", sa.Integer, default=0),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    op.create_table(
        "verifications",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("place_id", UUID(as_uuid=True), sa.ForeignKey("places.id"), nullable=False, index=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("note", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table("verifications")
    op.drop_table("places")
    op.drop_table("cities")
    op.drop_table("users")
