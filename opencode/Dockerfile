FROM ubuntu:26.04

RUN apt-get update && apt-get install --yes --no-install-recommends \
    ca-certificates \
    curl \
    jq \
    git \
    dnsutils \
    ncat \
    gdb \
    build-essential \
    openssh-client \
    python3 \
    python3-pip \
    python3-venv \
    fd-find \
    ripgrep \
    docker.io \
 && rm -rf /var/lib/apt/lists/*

ENV PATH="/usr/local/go/bin:/root/go/bin:/root/.local/bin:${PATH}"

RUN curl -fsSL "https://go.dev/dl/$(curl -fsSL https://go.dev/VERSION?m=text | head -n1).linux-$(dpkg --print-architecture).tar.gz" \
    | tar -C /usr/local -xz
RUN --mount=type=cache,target=/root/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go install golang.org/x/tools/gopls@latest \
 && go install github.com/go-task/task/v3/cmd/task@latest

RUN curl -fsSL https://opencode.ai/v2/install | bash

RUN --mount=type=cache,target=/root/.cache/uv \
    curl -fsSL https://astral.sh/uv/install.sh | sh \
 && uv tool install git+https://github.com/oraios/serena \
 && uv tool install mcp-sequential-thinking
