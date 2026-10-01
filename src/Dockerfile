FROM node:24-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json frontend/yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

COPY frontend/ .
RUN yarn build

FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=2222
WORKDIR /usr/src/app

COPY be/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY be ./be
COPY --from=frontend-builder /app/frontend/dist ./dist

EXPOSE 2222
CMD ["sh", "-c", "alembic -c be/alembic.ini upgrade head && exec gunicorn --bind 0.0.0.0:2222 --workers 2 --chdir be run:server"]
