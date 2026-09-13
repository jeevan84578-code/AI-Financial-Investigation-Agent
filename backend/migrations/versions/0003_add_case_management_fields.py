"""add case management fields

Revision ID: 0003_add_case_management_fields
"""

from alembic import op
import sqlalchemy as sa

revision = "0003_add_case_management_fields"
down_revision = "0002_add_ai_report_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("investigations", sa.Column("status", sa.String(length=30), nullable=False, server_default="Open"))
    op.add_column("investigations", sa.Column("priority", sa.String(length=20), nullable=False, server_default="Medium"))
    op.add_column("investigations", sa.Column("assigned_to", sa.String(length=120), nullable=True))
    op.add_column("investigations", sa.Column("notes", sa.JSON(), nullable=False, server_default="[]"))
    op.add_column("investigations", sa.Column("last_updated", sa.DateTime(timezone=True), nullable=True))
    op.execute(sa.text("UPDATE investigations SET last_updated = created_at WHERE last_updated IS NULL"))
    with op.batch_alter_table("investigations") as batch:
        batch.alter_column("last_updated", nullable=False)


def downgrade() -> None:
    op.drop_column("investigations", "last_updated")
    op.drop_column("investigations", "notes")
    op.drop_column("investigations", "assigned_to")
    op.drop_column("investigations", "priority")
    op.drop_column("investigations", "status")
