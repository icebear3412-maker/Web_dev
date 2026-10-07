"""Add per-ticket prices for cinema rooms.

Revision ID: 20261002_0003
Revises: 20260930_0002
Create Date: 2026-10-02
"""

from alembic import op


revision = "20261002_0003"
down_revision = "20260930_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        ALTER TABLE cinema_rooms
        ADD COLUMN IF NOT EXISTS ticket_price INTEGER NOT NULL DEFAULT 100000
        CHECK (ticket_price >= 0);
    """)
    op.execute("""
        UPDATE cinema_rooms
        SET ticket_price = CASE UPPER(type)
            WHEN 'IMAX' THEN 150000
            WHEN 'STANDARD' THEN 100000
            WHEN 'GOLD CLASS' THEN 300000
            ELSE ticket_price
        END
        WHERE UPPER(type) IN ('IMAX', 'STANDARD', 'GOLD CLASS');
    """)


def downgrade() -> None:
    op.execute("ALTER TABLE cinema_rooms DROP COLUMN IF EXISTS ticket_price;")
