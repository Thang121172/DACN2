FROM python:3.11-slim
WORKDIR /app

# system deps
RUN apt-get update && apt-get install -y build-essential git libpq-dev && rm -rf /var/lib/apt/lists/*

# copy and install requirements
COPY requirements.txt ./requirements.txt
RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# copy project
COPY . /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn core.wsgi:application --bind 0.0.0.0:8000"]
