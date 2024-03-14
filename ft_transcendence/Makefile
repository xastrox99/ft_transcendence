# Define variables
DOCKER_COMPOSE = docker compose
DEV_DOCKER_COMPOSE_FILE = "docker-compose.dev.yml"
PROD_DOCKER_COMPOSE_FILE = "docker-compose.yml"

# ANSI escape codes for text styles and colors
BOLD = \033[1m
RESET = \033[0m
YELLOW = \033[33m
GREEN = \033[32m
RED = \033[31m
BLUE = \033[34m

# Default target
all: help

# Display help message with colors and font style
help:
	@echo "$(BOLD)Available targets:$(RESET)"
	@echo "  $(GREEN)make dev$(RESET)            - $(GREEN)Start Docker containers for development$(RESET)"
	@echo "  $(GREEN)make prod$(RESET)           - $(GREEN)Start Docker containers for production$(RESET)"
	@echo "  $(YELLOW)make logs$(RESET)           - $(YELLOW)View Docker container logs for production$(RESET)"
	@echo "  $(YELLOW)make logs-dev$(RESET)       - $(YELLOW)View Docker container logs for development$(RESET)"
	@echo "  $(YELLOW)make exec-server$(RESET)    - $(YELLOW)Excute Bash For Server$(RESET)"
	@echo "  $(YELLOW)make exec-client$(RESET)    - $(YELLOW)Excute Bash For Client$(RESET)"
	@echo "  $(YELLOW)make exec-db$(RESET)        - $(YELLOW)Excute Bash For Database$(RESET)"
	@echo "  $(RED)make down$(RESET)           - $(RED)Stop and remove Docker containers$(RESET)"
	@echo "  $(RED)make kill$(RESET)           - $(RED)Kill Docker containers$(RESET)"
	@echo "  $(RED)make clean$(RESET)          - $(RED)Cleanup project dependencies$(RESET)"
	@echo "  $(RED)make fclean$(RESET)         - $(RED)Remove Docker images, volumes, and cleanup project dependencies$(RESET)"
	@echo "  $(BLUE)make help$(RESET)           - $(BLUE)Display this help message$(RESET)"

exec-server:
	docker exec -it server /bin/sh

exec-client:
	docker exec -it client /bin/sh

exec-db:
	docker exec -it db /bin/sh
	
# Start Docker containers for production
prod:
	$(DOCKER_COMPOSE) up --build -d

# Start Docker containers
dev:
	$(DOCKER_COMPOSE) -f $(DEV_DOCKER_COMPOSE_FILE) up --build -d

# Stop and remove Docker containers
down:
	$(DOCKER_COMPOSE) down

# kill and remove Docker containers
kill:
	$(DOCKER_COMPOSE) kill

# View Docker container logs for development
logs-dev:
	$(DOCKER_COMPOSE) --file $(DEV_DOCKER_COMPOSE_FILE) logs -f

# View Docker container logs for production
logs:
	$(DOCKER_COMPOSE) --file $(PROD_DOCKER_COMPOSE_FILE) logs -f

# Cleanup project dependencies
clean:
	rm -rf node_modules apps/client/node_modules apps/client/.next apps/server/dist apps/server/node_modules packages/db/node_modules packages/io-types/node_modules packages/io-types/dist packages/db/dist

# Remove Docker images and volumes
fclean: kill clean
	docker system prune --all

.PHONY: all help dev prod down kill logs-dev logs clean fclean
