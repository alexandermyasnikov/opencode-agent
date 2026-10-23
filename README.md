# opencode-agent

Запуск [OpenCode](https://opencode.ai) в Docker: серверный режим + собственный Docker-демон — изолированная песочница, где агент разворачивает нужную инфраструктуру, не трогая хост.

## Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│  Host                                                       │
│  ~/.config/opencode/   ~/.config/ssh-mcp/                   │
│  ├─ .env               └─ config.toml                       │
│  ├─ .gitconfig_private                                      │
│  └─ .gitignore                                              │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  opencode (порт 49374)                                 │ │
│  │  ├─ plugins: ponytail, mem, rate-limit-retry           │ │
│  │  ├─ agents: title, reviewer, tester                    │ │
│  │  ├─ mcp: serena, context7, gitlab, grafana, ssh        │ │
│  │  └─ volumes: opencode-data, serena-data, codebase-mem  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ docker-dind (Docker daemon на tcp://docker-dind:2375)  │ │
│  │   └─ volume: docker-data (/var/lib/docker)             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

Хостовый `/var/run/docker.sock` намеренно не монтируется — агент выполняет произвольные команды, доступ к сокету хоста эквивалентен root на хосте.

## Сервисы

| Сервис | Назначение |
|---|---|
| `opencode` | Сам агент, `opencode serve`. Рабочие каталоги см. volumes в compose |
| `docker-dind` | Собственный Docker-демон — песочница (`DOCKER_HOST=tcp://docker-dind:2375`). Кеш сборок — в volume `docker-data` |

## Требования

- `docker` с compose-плагином
- `~/.config/opencode/.env` — все секреты и настройки
- `~/.config/opencode/.gitconfig_private` — git-настройки (email/name для коммитов и прочее)

## Хранение данных

Сессии, настройки и кеш лежат на хосте в:
- `~/.config/opencode` — конфиги
- `~/.local/share/opencode` — сессии, БД
- `~/.cache/opencode` — кеш

Пересоздание контейнера их не задевает (volumes см. `docker-compose.yaml`).

## Быстрый старт

```bash
# 1. Создай ~/.config/opencode/.env (переменные — в таблице ниже)
mkdir -p ~/.config/opencode
vim ~/.config/opencode/.env

# 2. Приватный gitconfig
vim ~/.config/opencode/.gitconfig_private
# отредактируй email/name и другие параметры

# 3. Запуск
docker compose up --build -d
```

Веб-интерфейс: `http://localhost:49374` (только loopback).

## Переменные окружения

| Переменная | Описание | Пример |
|------------|----------|--------|
| `OPENCODE_SERVER_PASSWORD` | Пароль веб-UI | `secret123` |
| `OPENCODE_MODEL` | Основная модель | `openrouter/deepseek/deepseek-v4.1-flash` |
| `OPENCODE_AGENT_TITLE_MODEL` | Модель для заголовков | `openrouter/deepseek/deepseek-v4.1-flash` |
| `OPENCODE_AGENT_REVIEWER_MODEL` | Модель ревьюера | `openrouter/deepseek/deepseek-v4.1-flash` |
| `OPENCODE_AGENT_TESTER_MODEL` | Модель тестера | `openrouter/deepseek/deepseek-v4.1-flash` |
| `PROVIDER_OPENROUTER_API_KEY` | OpenRouter API key | `sk-or-...` |
| `PROVIDER_DAHL_API_KEY` | Dahl API key | `sk-dahl-...` |
| `MCP_CONTEXT7_API_KEY` | Context7 API key | `ctx7-...` |
| `MCP_GITLAB_API_KEY` | GitLab token | `glpat-...` |
| `MCP_GRAFANA_URL` | Grafana URL | `https://grafana.example.com` |
| `MCP_GRAFANA_API_KEY` | Grafana service account token | `glc_...` |
| `MCP_GITHUB_API_KEY` | GitHub PAT | `ghp_...` |

## Плагины

| Плагин | Назначение |
|--------|------------|
| `opencode-mem@latest` | Долгосрочная локальная память |
| `@dietrichgebert/ponytail` | Lazy senior dev mode (`/ponytail`) |
| `superpowers` | Навыки: brainstorming, debugging, planning, code review, ... |
| `./plugins/rate-limit-retry` | Авто-ретрай при токеновом rate-limit |

## Персональные маунты

Базовый `docker-compose.yaml` — общий. Личные пути — в `docker-compose.override.yml` (в `.gitignore`, подхватывается автоматически):

```yaml
services:
  opencode:
    volumes:
      - ${HOME}/my/private/dir:/root/my/private/dir
```

## Обновление

```bash
docker compose build --no-cache opencode
```
