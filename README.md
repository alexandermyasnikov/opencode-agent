# opencode-agent

Запуск [OpenCode](https://opencode.ai) в Docker: серверный режим + собственный
Docker-демон — изолированная песочница, где агент разворачивает нужную ему
инфраструктуру, не трогая хост.

## Требования

- `docker` с compose-плагином — на хосте
- `~/.config/opencode/.env` с паролем:
  ```
  OPENCODE_SERVER_PASSWORD=...
  ```
- `~/.config/opencode/gitconfig` — опционально: переопределение дефолтных git-параметров (имя, почта, ...), read-only

## Запуск

```bash
docker compose up --build
```

Веб-интерфейс: `http://localhost:49374` (слушает только loopback, наружу не торчит).

Сессии, настройки и кеш лежат в `~/.config/opencode`, `~/.local/share/opencode`,
`~/.cache/opencode` — пересоздание контейнера их не задевает.

## Как устроено

| Сервис | Назначение |
|---|---|
| `opencode` | Сам агент, `opencode serve`. Рабочие каталоги: `/data/code`, `~/Downloads` как общий черновик с хостом |
| `docker-dind` | Собственный Docker-демон — песочница, где агент разворачивает нужную ему инфраструктуру (`DOCKER_HOST=tcp://docker-dind:2375`). Кеш сборок — в volume `docker-data` |

Хостовый `/var/run/docker.sock` намеренно не монтируется: агент выполняет
произвольные команды, а доступ к сокету хоста эквивалентен root на хосте.

## Свои маунты

Базовый `docker-compose.yaml` — общий, без личных путей. Всё личное — в
`docker-compose.override.yml` (в `.gitignore`, подхватывается сам):

```yaml
services:
  opencode:
    volumes:
      - ${HOME}/my/private/dir:/root/my/private/dir
```
