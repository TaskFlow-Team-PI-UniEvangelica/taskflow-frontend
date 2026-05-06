.PHONY: run-dev run down logs-dev logs terminal-dev terminal

# sobe o ambiente de Desenvolvimento (com Vite e Hot Reload)
run-dev:
	docker compose -f docker-compose-dev.yml up -d --build

# sobe o ambiente de Produção (com Nginx)
run:
	docker compose up -d --build

# desliga e remove os containers de qualquer ambiente
down:
	docker compose down --remove-orphans
	docker compose -f docker-compose-dev.yml down --remove-orphans

# visualiza os logs do ambiente de dev
logs-dev:
	docker compose -f docker-compose-dev.yml logs -f

# visualiza os logs do ambiente de prod
logs:
	docker compose logs -f

# acessar o terminal no conteiner de dev
terminal-dev:
	docker compose -f docker-compose-dev.yml exec taskflow_frontend_dev bash

# acessar o terminal no conteiner de prod
terminal:
	docker compose exec taskflow_frontend bash