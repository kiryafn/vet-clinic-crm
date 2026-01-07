"""Add weight column to pets table

Revision ID: e142a5652b75
Revises: 8f3dabd6765d
Create Date: 2026-01-07 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e142a5652b75'
down_revision: Union[str, None] = '1c931d90e31e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add weight column to pets table."""
    with op.batch_alter_table('pets', schema=None) as batch_op:
        batch_op.add_column(sa.Column('weight', sa.Float(), nullable=True))


def downgrade() -> None:
    """Remove weight column from pets table."""
    with op.batch_alter_table('pets', schema=None) as batch_op:
        batch_op.drop_column('weight')
