"""add approval workflow fields

Revision ID: 0004_add_approval_workflow_fields
"""

from alembic import op
import sqlalchemy as sa

revision = "0004_add_approval_workflow_fields"
down_revision = "0003_add_case_management_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("investigations", sa.Column("approval_status", sa.String(length=20), nullable=False, server_default="Pending"))
    op.add_column("investigations", sa.Column("approved_by", sa.String(length=120), nullable=True))
    op.add_column("investigations", sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("investigations", sa.Column("approval_notes", sa.Text(), nullable=True))
    op.add_column("investigations", sa.Column("approval_history", sa.JSON(), nullable=False, server_default="[]"))


def downgrade() -> None:
    op.drop_column("investigations", "approval_history")
    op.drop_column("investigations", "approval_notes")
    op.drop_column("investigations", "approved_at")
    op.drop_column("investigations", "approved_by")
    op.drop_column("investigations", "approval_status")
