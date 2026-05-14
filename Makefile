.PHONY: run run-dev down clean clean-dev logs logs-dev terminal terminal-dev

# sobe o ambiente de Produção (com Nginx)
run:
	docker compose up --build

# sobe o ambiente de Desenvolvimento (com Vite e Hot Reload)
run-dev:
	docker compose -f docker-compose-dev.yml up --build

# desliga e remove os containers de qualquer ambiente
down:
	docker compose down
	docker compose -f docker-compose-dev.yml down

# desliga, remove conteiners e imagens de prod
clean:
	docker compose down --rmi all

# desliga, remove conteiners e imagens de dev
clean-dev:
	docker compose -f docker-compose-dev.yml down --rmi all

# visualiza os logs do ambiente de prod
logs:
	docker compose logs -f

# visualiza os logs do ambiente de dev
logs-dev:
	docker compose -f docker-compose-dev.yml logs -f

# acessar o terminal no conteiner de prod
terminal:
	docker exec -it taskflow_frontend bash

# acessar o terminal no conteiner de dev
terminal-dev:
	docker exec -it taskflow_frontend_dev bash