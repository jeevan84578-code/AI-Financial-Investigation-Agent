"""add AI report fields

Revision ID: 0002_add_ai_report_fields
"""

from alembic import op
import sqlalchemy as sa

revision = "0002_add_ai_report_fields"
down_revision = "0001_create_investigations"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("investigations", sa.Column("ai_report", sa.JSON(), nullable=True))
    op.add_column("investigations", sa.Column("recommendations", sa.JSON(), nullable=False, server_default="[]"))
    op.add_column("investigations", sa.Column("confidence_score", sa.Float(), nullable=True))
    op.add_column("investigations", sa.Column("report_generated_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("investigations", "report_generated_at")
    op.drop_column("investigations", "confidence_score")
    op.drop_column("investigations", "recommendations")
    op.drop_column("investigations", "ai_report")
